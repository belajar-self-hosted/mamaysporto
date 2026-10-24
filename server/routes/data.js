import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

const ALLOWED_COLLECTIONS = new Set([
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "site_settings",
  "project_tags",
]);

const SINGLETON_COLLECTIONS = new Set(["hero", "about", "site_settings"]);

function validateCollection(collection) {
  if (!ALLOWED_COLLECTIONS.has(collection)) {
    throw new Error(`Invalid collection: ${collection}`);
  }
}

// 1. GET collection or singleton
router.get("/:collection", async (req, res) => {
  try {
    const { collection } = req.params;
    validateCollection(collection);

    let sql = `SELECT * FROM ${collection}`;
    if (SINGLETON_COLLECTIONS.has(collection)) {
      sql += ` WHERE id = 1 LIMIT 1`;
      const { rows } = await query(sql);
      return res.json(rows[0] || null);
    }

    if (collection === "projects" || collection === "experience") {
      sql += ` ORDER BY id DESC`;
    } else {
      sql += ` ORDER BY id ASC`;
    }

    const { rows } = await query(sql);
    return res.json(rows);
  } catch (err) {
    console.error(`Error fetching collection ${req.params.collection}:`, err);
    return res.status(400).json({ error: err.message });
  }
});

// 2. POST new row in collection (Protected)
router.post("/:collection", requireAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    validateCollection(collection);

    if (SINGLETON_COLLECTIONS.has(collection)) {
      return res.status(400).json({ error: "Cannot create multiple rows in singleton collection" });
    }

    const body = req.body;
    const { id, created_at, updated_at, ...data } = body;

    const keys = Object.keys(data);
    if (keys.length === 0) {
      return res.status(400).json({ error: "No data provided to insert" });
    }

    const cols = keys.map((k) => `"${k}"`).join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((k) => {
      // Serialize arrays / objects to JSON strings for jsonb columns if needed
      if (typeof data[k] === "object" && data[k] !== null) {
        return JSON.stringify(data[k]);
      }
      return data[k];
    });

    const sql = `INSERT INTO ${collection} (${cols}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await query(sql, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(`Error inserting into ${req.params.collection}:`, err);
    return res.status(500).json({ error: err.message });
  }
});

async function handlePut(req, res) {
  try {
    const { collection } = req.params;
    validateCollection(collection);

    const isSingleton = SINGLETON_COLLECTIONS.has(collection);
    const id = isSingleton ? 1 : req.params.id;

    if (!id) {
      return res.status(400).json({ error: "Row ID is required" });
    }

    const body = req.body;
    const { id: _id, created_at: _ca, updated_at: _ua, ...patch } = body;

    const keys = Object.keys(patch);
    if (keys.length === 0) {
      return res.status(400).json({ error: "No data provided to update" });
    }

    const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
    const values = keys.map((k) => {
      if (typeof patch[k] === "object" && patch[k] !== null) {
        return JSON.stringify(patch[k]);
      }
      return patch[k];
    });

    values.push(id);
    const sql = `UPDATE ${collection} SET ${setClauses} WHERE id = $${values.length} RETURNING *`;

    const { rows } = await query(sql, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Row not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(`Error updating ${req.params.collection}:`, err);
    return res.status(500).json({ error: err.message });
  }
}

// 3. PUT update row by id or singleton (Protected)
router.put("/:collection/:id", requireAuth, handlePut);
router.put("/:collection", requireAuth, handlePut);


// 4. DELETE row by id (Protected)
router.delete("/:collection/:id", requireAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    validateCollection(collection);

    if (SINGLETON_COLLECTIONS.has(collection)) {
      return res.status(400).json({ error: "Cannot delete singleton collection" });
    }

    const sql = `DELETE FROM ${collection} WHERE id = $1 RETURNING id`;
    const { rows } = await query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Row not found" });
    }

    return res.json({ success: true, id: rows[0].id });
  } catch (err) {
    console.error(`Error deleting from ${req.params.collection}:`, err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;

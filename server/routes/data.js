import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

const COLLECTION_COLUMNS = {
  hero: new Set([
    "greeting", "display_name", "role_prefix", "role_highlight", "subtitle", "image",
    "cta_projects_label", "cta_contact_label", "cta_yowman_label", "cta_yowman_link",
  ]),
  about: new Set([
    "content", "stat_1_number", "stat_1_label", "stat_2_number", "stat_2_label",
    "stat_3_number", "stat_3_label", "image",
  ]),
  skills: new Set(["name", "icon_url"]),
  projects: new Set(["title", "description", "image", "link", "github", "category", "tags"]),
  experience: new Set(["role", "company", "period", "description"]),
  site_settings: new Set([
    "site_title", "favicon_url", "navbar_brand", "footer_name", "social_links", "contact_title",
    "contact_desc", "contact_image", "report_whatsapp_number", "report_whatsapp_message",
    "chat_ticker_text", "ai_system_prompt",
  ]),
  project_tags: new Set(["name"]),
};

const ALLOWED_COLLECTIONS = new Set(Object.keys(COLLECTION_COLUMNS));
const SINGLETON_COLLECTIONS = new Set(["hero", "about", "site_settings"]);
const PUBLIC_SITE_SETTINGS_COLUMNS = [
  "id", "site_title", "favicon_url", "navbar_brand", "footer_name", "social_links",
  "contact_title", "contact_desc", "contact_image", "report_whatsapp_number",
  "report_whatsapp_message", "chat_ticker_text", "created_at", "updated_at",
];
const UPDATED_AT_COLLECTIONS = new Set(["hero", "about", "projects", "site_settings"]);
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;
const MAX_PAGE_OFFSET = 100_000;

function validateCollection(collection) {
  if (!ALLOWED_COLLECTIONS.has(collection)) throw new Error("Invalid collection.");
}

function extractData(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid request body.");
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...data } = body;
  return data;
}

function validateColumns(collection, data) {
  const keys = Object.keys(data);
  if (keys.some((key) => !COLLECTION_COLUMNS[collection].has(key))) {
    throw new Error("Invalid field for collection.");
  }
  if (keys.length === 0) throw new Error("No data provided.");
  return keys;
}

function parsePagination(queryParams) {
  const parseInteger = (value, fallback, max) => {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
    const number = Number(value);
    return Number.isSafeInteger(number) && number <= max ? number : null;
  };

  const limit = parseInteger(queryParams.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const offset = parseInteger(queryParams.offset, 0, MAX_PAGE_OFFSET);
  if (limit === null || limit < 1 || offset === null) {
    const error = new Error("Invalid pagination parameters.");
    error.code = "INVALID_PAGINATION";
    throw error;
  }
  return { limit, offset };
}

function serializeValue(value) {
  return typeof value === "object" && value !== null ? JSON.stringify(value) : value;
}

function logRouteFailure(action, collection, err) {
  console.error(`Error ${action} collection:`, {
    collection,
    name: err.name,
    code: err.code,
  });
}

// Public read endpoint: private site settings require an authenticated admin request.
async function handleGetCollection(req, res, includePrivateSiteSettings = false) {
  try {
    const { collection } = req.params;
    validateCollection(collection);

    const selectedColumns = collection === "site_settings" && !includePrivateSiteSettings
      ? PUBLIC_SITE_SETTINGS_COLUMNS.join(", ")
      : "*";
    let sql = `SELECT ${selectedColumns} FROM ${collection}`;
    if (SINGLETON_COLLECTIONS.has(collection)) {
      sql += " WHERE id = 1 LIMIT 1";
      const { rows } = await query(sql);
      return res.json(rows[0] || null);
    }

    sql += collection === "projects" || collection === "experience"
      ? " ORDER BY id DESC"
      : " ORDER BY id ASC";
    const { limit, offset } = parsePagination(req.query);
    sql += " LIMIT $1 OFFSET $2";
    const { rows } = await query(sql, [limit, offset]);
    return res.json(rows);
  } catch (err) {
    logRouteFailure("fetching", req.params.collection, err);
    const invalidCollection = err.message === "Invalid collection.";
    const invalidPagination = err.code === "INVALID_PAGINATION";
    return res.status(invalidCollection || invalidPagination ? 400 : 500).json({
      error: invalidCollection
        ? "Invalid collection request."
        : invalidPagination
          ? "Invalid pagination parameters."
          : "Could not fetch collection data.",
    });
  }
}

router.get("/:collection", async (req, res) => {
  const includePrivateSiteSettings =
    req.params.collection === "site_settings" && req.query.includePrivate === "true";
  if (!includePrivateSiteSettings) return handleGetCollection(req, res);
  return requireAuth(req, res, () => handleGetCollection(req, res, true));
});

router.post("/:collection", requireAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    validateCollection(collection);
    if (SINGLETON_COLLECTIONS.has(collection)) {
      return res.status(400).json({ error: "Cannot create multiple rows in singleton collection." });
    }

    const data = extractData(req.body);
    const keys = validateColumns(collection, data);
    const cols = keys.map((key) => `"${key}"`).join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((key) => serializeValue(data[key]));
    const sql = `INSERT INTO ${collection} (${cols}) VALUES (${placeholders}) RETURNING *`;

    const { rows } = await query(sql, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    logRouteFailure("inserting into", req.params.collection, err);
    const clientError = err.message === "Invalid collection." ||
      err.message === "Invalid field for collection." ||
      err.message === "Invalid request body." ||
      err.message === "No data provided.";
    return res.status(clientError ? 400 : 500).json({
      error: clientError ? err.message : "Could not save collection data.",
    });
  }
});

async function handlePut(req, res) {
  try {
    const { collection } = req.params;
    validateCollection(collection);

    const isSingleton = SINGLETON_COLLECTIONS.has(collection);
    const id = isSingleton ? 1 : req.params.id;
    if (!id) return res.status(400).json({ error: "Row ID is required." });

    const patch = extractData(req.body);
    const keys = validateColumns(collection, patch);
    const setClauses = keys.map((key, i) => `"${key}" = $${i + 1}`);
    const values = keys.map((key) => serializeValue(patch[key]));
    if (UPDATED_AT_COLLECTIONS.has(collection)) setClauses.push("updated_at = NOW()");

    values.push(id);
    const sql = `UPDATE ${collection} SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const { rows } = await query(sql, values);
    if (rows.length === 0) return res.status(404).json({ error: "Row not found." });
    return res.json(rows[0]);
  } catch (err) {
    logRouteFailure("updating", req.params.collection, err);
    const clientError = err.message === "Invalid collection." ||
      err.message === "Invalid field for collection." ||
      err.message === "Invalid request body." ||
      err.message === "No data provided.";
    return res.status(clientError ? 400 : 500).json({
      error: clientError ? err.message : "Could not update collection data.",
    });
  }
}

router.put("/:collection/:id", requireAuth, handlePut);
router.put("/:collection", requireAuth, handlePut);

router.delete("/:collection/:id", requireAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    validateCollection(collection);
    if (SINGLETON_COLLECTIONS.has(collection)) {
      return res.status(400).json({ error: "Cannot delete singleton collection." });
    }

    const { rows } = await query(`DELETE FROM ${collection} WHERE id = $1 RETURNING id`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Row not found." });
    return res.json({ success: true, id: rows[0].id });
  } catch (err) {
    logRouteFailure("deleting from", req.params.collection, err);
    const clientError = err.message === "Invalid collection.";
    return res.status(clientError ? 400 : 500).json({
      error: clientError ? err.message : "Could not delete collection data.",
    });
  }
});

export default router;

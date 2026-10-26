import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { pool } from "./db.js";
import { handleLogin, handleMe, handleLogout, handleUpdateAccount, requireAuth } from "./auth.js";
import dataRouter from "./routes/data.js";
import uploadRouter from "./routes/upload.js";

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve("uploads");
const DIST_DIR = process.env.DIST_DIR || path.resolve("dist");

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Uploads static directory
app.use("/uploads", express.static(UPLOADS_DIR));

// Healthcheck
app.get("/api/health", async (_req, res) => {
  try {
    const dbRes = await pool.query("SELECT 1 as healthy");
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbRes.rows[0]?.healthy === 1 ? "connected" : "unknown",
    });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: err.message,
    });
  }
});

// Auth Routes
app.post("/api/auth/login", handleLogin);
app.get("/api/auth/me", requireAuth, handleMe);
app.post("/api/auth/logout", handleLogout);
app.put("/api/auth/account", requireAuth, handleUpdateAccount);

// Data & Upload Routes
app.use("/api/data", dataRouter);
app.use("/api/upload", uploadRouter);

// Frontend Static SPA serving
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
      return res.sendFile(path.join(DIST_DIR, "index.html"));
    }
    next();
  });
} else {
  app.get("/", (_req, res) => {
    res.send("API Server running. Frontend dist/ not found. Run 'npm run build' to generate static assets.");
  });
}


// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;

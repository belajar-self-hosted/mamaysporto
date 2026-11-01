import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { assertDatabaseUrl, pool } from "./db.js";
import {
  assertJwtSecret,
  handleLogin,
  handleMe,
  handleLogout,
  handleUpdateAccount,
  loginRateLimit,
  requireAuth,
} from "./auth.js";
import dataRouter from "./routes/data.js";
import uploadRouter from "./routes/upload.js";

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve("uploads");
const DIST_DIR = process.env.DIST_DIR || path.resolve("dist");
const trustedProxyIps = (process.env.TRUSTED_PROXY_IPS || "")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

app.disable("x-powered-by");
if (trustedProxyIps.length > 0) app.set("trust proxy", trustedProxyIps);

app.use((_req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' https: data: blob:",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https: data:",
      "connect-src 'self'",
      "form-action 'self'",
    ].join("; "),
  });
  next();
});

app.use(cors());
app.use(express.json({ limit: "1mb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "10kb", parameterLimit: 20 }));

const blockedUploadExtensions = new Set([".html", ".htm", ".xhtml", ".svg", ".xml", ".xsl", ".js", ".mjs"]);
app.use("/uploads", (req, res, next) => {
  let requestedPath;
  try {
    requestedPath = decodeURIComponent(req.path);
  } catch {
    return res.status(400).json({ error: "Invalid upload path." });
  }
  if (blockedUploadExtensions.has(path.extname(requestedPath).toLowerCase())) {
    return res.status(404).end();
  }
  return next();
});

app.use("/uploads", express.static(UPLOADS_DIR, {
  dotfiles: "deny",
  fallthrough: true,
  setHeaders: (res) => {
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  },
}));

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
    console.error("Health check database query failed:", { code: err.code, name: err.name });
    res.status(503).json({
      status: "degraded",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "disconnected",
    });
  }
});

app.post("/api/auth/login", loginRateLimit, handleLogin);
app.get("/api/auth/me", requireAuth, handleMe);
app.post("/api/auth/logout", requireAuth, handleLogout);
app.put("/api/auth/account", requireAuth, handleUpdateAccount);

app.use("/api/data", dataRouter);
app.use("/api/upload", uploadRouter);
app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found." }));

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/uploads")) {
      return res.sendFile(path.join(DIST_DIR, "index.html"));
    }
    return next();
  });
} else {
  app.get("/", (_req, res) => {
    res.send("API Server running. Frontend dist/ not found. Run 'npm run build' to generate static assets.");
  });
}

app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.statusCode || err.status || (
    err.code === "LIMIT_FILE_SIZE" ? 413 : err.name === "MulterError" ? 400 : 500
  );
  let publicMessage = "Internal server error.";
  if (err.type === "entity.too.large" || err.code === "LIMIT_FILE_SIZE") {
    publicMessage = "Request is too large.";
  } else if (err.type === "entity.parse.failed") {
    publicMessage = "Invalid request body.";
  } else if (err.name === "MulterError") {
    publicMessage = "Invalid upload request.";
  }

  if (status >= 400 && status < 500 && publicMessage === "Internal server error.") {
    publicMessage = "Invalid request.";
  }

  console.error("Request failed:", { name: err.name, code: err.code, status });
  res.status(status >= 400 && status < 600 ? status : 500).json({ error: publicMessage });
});

export function startServer({ port = PORT, host = "0.0.0.0" } = {}) {
  assertDatabaseUrl();
  assertJwtSecret();

  const server = app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  });
  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}; draining HTTP requests.`);

    const forceCloseTimer = setTimeout(() => {
      server.closeAllConnections?.();
    }, 10_000);
    forceCloseTimer.unref();

    server.close((serverError) => {
      clearTimeout(forceCloseTimer);
      if (serverError) {
        console.error("HTTP server shutdown failed:", { code: serverError.code, name: serverError.name });
        process.exitCode = 1;
      }

      pool.end().catch((poolError) => {
        console.error("Database pool shutdown failed:", { code: poolError.code, name: poolError.name });
        process.exitCode = 1;
      });
    });
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    startServer();
  } catch (err) {
    console.error("Server configuration error:", err.message);
    process.exitCode = 1;
  }
}

export default app;

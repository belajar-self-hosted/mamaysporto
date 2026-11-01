import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import bcrypt from "bcryptjs";
import { normalizeUrl } from "../src/lib/url.js";
import { listMigrationFiles } from "../server/migrationFiles.js";

const migrationDirectory = path.resolve("database/migrations");
const sqlMigrationFiles = (await fs.readdir(migrationDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
assert.deepEqual(await listMigrationFiles(migrationDirectory), [
  "202611010001_ensure_updated_at_columns.sql",
  "202611010002_sync_admin_id_sequence.sql",
]);
assert.deepEqual(await listMigrationFiles(migrationDirectory), sqlMigrationFiles);

const invalidMigrationDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "mamaysporto-test-migrations-"));
try {
  await fs.writeFile(path.join(invalidMigrationDirectory, "bad-name.sql"), "SELECT 1;");
  await assert.rejects(listMigrationFiles(invalidMigrationDirectory), /Invalid migration filename/);
} finally {
  await fs.rm(invalidMigrationDirectory, { recursive: true, force: true });
}

const uploadsDir = await fs.mkdtemp(path.join(os.tmpdir(), "mamaysporto-test-uploads-"));
await fs.writeFile(path.join(uploadsDir, "legacy.svg"), "<svg><script>unsafe()</script></svg>");
await fs.writeFile(path.join(uploadsDir, "safe.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
process.env.JWT_SECRET = "mamaysporto-test-secret-with-at-least-32-bytes";
process.env.TRUSTED_PROXY_IPS = "127.0.0.1";
process.env.UPLOADS_DIR = uploadsDir;

const [{ default: app }, { pool, assertDatabaseUrl }, auth] = await Promise.all([
  import("../server/index.js"),
  import("../server/db.js"),
  import("../server/auth.js"),
]);

const server = http.createServer(app);
const sessionVersionStart = "2026-11-01 00:00:00.000001";
let adminSessionVersion = sessionVersionStart;
let adminPasswordHash = await bcrypt.hash("correct-horse-battery-staple", 10);
const executedQueries = [];
let healthFailure = false;
let simulateConcurrentPasswordUpdate = false;

pool.query = async (text, params = []) => {
  executedQueries.push({ text, params });
  if (text === "SELECT 1 as healthy") {
    if (healthFailure) throw Object.assign(new Error("internal db detail"), { code: "ECONNREFUSED" });
    return { rows: [{ healthy: 1 }], rowCount: 1 };
  }
  if (text.includes("password_hash") && text.includes("WHERE email = $1")) {
    return params[0] === "admin@example.com"
      ? {
          rows: [{
            id: 1,
            email: "admin@example.com",
            password_hash: adminPasswordHash,
            session_version: adminSessionVersion,
          }],
          rowCount: 1,
        }
      : { rows: [], rowCount: 0 };
  }
  if (text.includes("FROM admins WHERE id = $1")) {
    return {
      rows: [{ id: 1, email: "admin@example.com", session_version: adminSessionVersion }],
      rowCount: 1,
    };
  }
  if (text.startsWith("UPDATE admins SET updated_at = GREATEST(")) {
    adminSessionVersion = `revoked-${Date.now()}-${Math.random()}`;
    return { rows: [], rowCount: 1 };
  }
  if (text.startsWith("UPDATE admins SET password_hash = $1 WHERE id = $2 AND password_hash = $3")) {
    if (simulateConcurrentPasswordUpdate) {
      adminPasswordHash = await bcrypt.hash("new-password-for-race", 12);
      adminSessionVersion = `password-changed-${Date.now()}`;
      simulateConcurrentPasswordUpdate = false;
      return { rows: [], rowCount: 0 };
    }
    return { rows: [], rowCount: 1 };
  }
  if (text.startsWith("UPDATE hero SET")) {
    return { rows: [{ id: 1, greeting: params[0] }], rowCount: 1 };
  }
  if (text.startsWith("SELECT id FROM admins WHERE email = $1")) {
    return { rows: [], rowCount: 0 };
  }
  if (text.startsWith("UPDATE admins SET email = $1")) {
    return { rows: [{ id: 1, email: params[0] }], rowCount: 1 };
  }
  return { rows: [], rowCount: 0 };
};

function listen(target) {
  return new Promise((resolve, reject) => {
    target.once("error", reject);
    target.listen(0, "127.0.0.1", () => {
      target.removeListener("error", reject);
      resolve(`http://127.0.0.1:${target.address().port}`);
    });
  });
}

async function run() {
  assert.throws(() => auth.assertJwtSecret("short"), /at least 32 bytes/);
  assert.throws(() => assertDatabaseUrl(""), /DATABASE_URL must be configured/);
  assert.equal(normalizeUrl("https://example.com"), "https://example.com/");
  assert.equal(normalizeUrl("mailto:admin@example.com"), "mailto:admin@example.com");
  assert.equal(normalizeUrl("tel:+62812345678"), "tel:+62812345678");
  assert.equal(normalizeUrl("/projects"), "/projects");
  assert.equal(normalizeUrl("javascript:alert(1)"), "");
  assert.equal(normalizeUrl("data:text/html,hello"), "");
  assert.equal(normalizeUrl("//evil.example"), "");
  assert.equal(normalizeUrl("/\\evil.example"), "");

  const baseUrl = await listen(server);
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const health = await healthResponse.json();
    assert.equal(healthResponse.status, 200);
    assert.equal(health.status, "ok");
    assert.equal(typeof health.uptime, "number");
    assert.equal(healthResponse.headers.get("x-content-type-options"), "nosniff");
    assert.equal(healthResponse.headers.get("x-frame-options"), "DENY");
    assert.match(healthResponse.headers.get("content-security-policy"), /frame-ancestors 'none'/);

    healthFailure = true;
    const degradedHealthResponse = await fetch(`${baseUrl}/api/health`);
    const degradedHealth = await degradedHealthResponse.json();
    assert.equal(degradedHealthResponse.status, 503);
    assert.equal(degradedHealth.status, "degraded");
    assert.equal("error" in degradedHealth, false);
    healthFailure = false;

    const unauthenticatedResponse = await fetch(`${baseUrl}/api/auth/account`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
    assert.equal(unauthenticatedResponse.status, 401);

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "correct-horse-battery-staple" }),
    });
    assert.equal(loginResponse.status, 200);
    const { token } = await loginResponse.json();
    const passwordHashUpgrade = executedQueries.findLast(({ text }) => text.startsWith("UPDATE admins SET password_hash = $1"));
    assert.ok(passwordHashUpgrade);
    assert.equal(bcrypt.getRounds(passwordHashUpgrade.params[0]), 12);
    assert.match(passwordHashUpgrade.text, /AND password_hash = \$3/);
    assert.equal(passwordHashUpgrade.params[2], adminPasswordHash);

    const wrongPasswordResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "wrong-password" }),
    });
    const missingAccountResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "missing@example.com", password: "wrong-password" }),
    });
    assert.equal(wrongPasswordResponse.status, 401);
    assert.equal(missingAccountResponse.status, wrongPasswordResponse.status);
    assert.deepEqual(await missingAccountResponse.json(), await wrongPasswordResponse.json());

    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(meResponse.status, 200);

    for (const password of ["a".repeat(13), "é".repeat(37)]) {
      const weakPasswordResponse = await fetch(`${baseUrl}/api/auth/account`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@example.com", password }),
      });
      assert.equal(weakPasswordResponse.status, 400);
    }

    const injectionResponse = await fetch(`${baseUrl}/api/data/projects`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 'title"; DROP TABLE projects; --': "payload" }),
    });
    assert.equal(injectionResponse.status, 400);

    const pagedCollectionResponse = await fetch(`${baseUrl}/api/data/projects?limit=2&offset=4`);
    assert.equal(pagedCollectionResponse.status, 200);
    assert.deepEqual(
      executedQueries.findLast(({ text }) => text.startsWith("SELECT * FROM projects")),
      { text: "SELECT * FROM projects ORDER BY id DESC LIMIT $1 OFFSET $2", params: [2, 4] }
    );
    const invalidPageResponse = await fetch(`${baseUrl}/api/data/projects?limit=501`);
    assert.equal(invalidPageResponse.status, 400);

    const publicSettingsResponse = await fetch(`${baseUrl}/api/data/site_settings`);
    assert.equal(publicSettingsResponse.status, 200);
    const publicSettingsQuery = executedQueries.findLast(({ text }) => text.startsWith("SELECT id, site_title"));
    assert.ok(publicSettingsQuery);
    assert.equal(publicSettingsQuery.text.includes("ai_system_prompt"), false);

    const unauthenticatedPrivateSettingsResponse = await fetch(
      `${baseUrl}/api/data/site_settings?includePrivate=true`
    );
    assert.equal(unauthenticatedPrivateSettingsResponse.status, 401);

    const privateSettingsResponse = await fetch(
      `${baseUrl}/api/data/site_settings?includePrivate=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(privateSettingsResponse.status, 200);
    assert.ok(executedQueries.findLast(({ text }) => text.startsWith("SELECT * FROM site_settings")));

    const updatedAtResponse = await fetch(`${baseUrl}/api/data/hero`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ greeting: "Halo" }),
    });
    assert.equal(updatedAtResponse.status, 200);
    assert.match(
      executedQueries.findLast(({ text }) => text.startsWith("UPDATE hero SET"))?.text || "",
      /updated_at = NOW\(\)/
    );

    const uploadForm = new FormData();
    uploadForm.append("file", new Blob(["not an image"], { type: "image/png" }), "../fake.png");
    const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: uploadForm,
    });
    assert.equal(uploadResponse.status, 415);

    const legacySvgResponse = await fetch(`${baseUrl}/uploads/legacy.svg`);
    assert.equal(legacySvgResponse.status, 404);
    const safeImageResponse = await fetch(`${baseUrl}/uploads/safe.png`);
    assert.equal(safeImageResponse.status, 200);
    assert.match(safeImageResponse.headers.get("content-type"), /image\/png/);

    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(logoutResponse.status, 200);
    const revokedTokenResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(revokedTokenResponse.status, 401);

    const tooLargeResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "x".repeat(1024 * 1024) }),
    });
    assert.equal(tooLargeResponse.status, 413);

    const invalidLogin = { email: "admin@example.com", password: "wrong-password" };
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.10" },
        body: JSON.stringify(invalidLogin),
      });
      assert.equal(response.status, 401);
    }
    const limitedLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.10" },
      body: JSON.stringify(invalidLogin),
    });
    assert.equal(limitedLogin.status, 429);
    assert.ok(Number(limitedLogin.headers.get("retry-after")) > 0);

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": `203.0.113.${20 + attempt}` },
        body: JSON.stringify(invalidLogin),
      });
      assert.equal(response.status, 401);
    }
    const adminCanStillLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.40" },
      body: JSON.stringify({ email: "admin@example.com", password: "correct-horse-battery-staple" }),
    });
    assert.equal(adminCanStillLogin.status, 200);

    simulateConcurrentPasswordUpdate = true;
    const loginDuringPasswordChange = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.41" },
      body: JSON.stringify({ email: "admin@example.com", password: "correct-horse-battery-staple" }),
    });
    assert.equal(loginDuringPasswordChange.status, 200);
    assert.equal(await bcrypt.compare("new-password-for-race", adminPasswordHash), true);
    assert.equal(await bcrypt.compare("correct-horse-battery-staple", adminPasswordHash), false);
    const { token: staleLoginToken } = await loginDuringPasswordChange.json();
    const staleLoginResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${staleLoginToken}` },
    });
    assert.equal(staleLoginResponse.status, 401);

    console.log("All server tests passed.");
  } finally {
    try {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    } finally {
      await fs.rm(uploadsDir, { recursive: true, force: true });
    }
  }
}

run().catch((err) => {
  console.error("Server tests failed:", err);
  process.exitCode = 1;
});

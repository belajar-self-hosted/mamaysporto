import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { listMigrationFiles } from "../server/migrationFiles.js";

const { Pool } = pg;
const migrationUrl = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
const appRole = process.env.APP_DB_USER;
const appPassword = process.env.APP_DB_PASSWORD;

if (!migrationUrl && !(process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER && process.env.PGPASSWORD)) {
  throw new Error("Set MIGRATION_DATABASE_URL or all of PGHOST, PGDATABASE, PGUSER, and PGPASSWORD.");
}
if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(appRole || "")) {
  throw new Error("APP_DB_USER must be a valid PostgreSQL role name.");
}
if (!/^[a-fA-F0-9]{64,}$/.test(appPassword || "")) {
  throw new Error("APP_DB_PASSWORD must be at least 32 bytes represented as hex.");
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

function quoteLiteral(value) {
  if (value.includes("\0")) throw new Error("Database passwords cannot contain null bytes.");
  return `'${value.replaceAll("'", "''")}'`;
}

const pool = new Pool({
  ...(migrationUrl ? { connectionString: migrationUrl } : {}),
  max: 1,
  connectionTimeoutMillis: 5000,
});

async function ensureAppRole(client) {
  const { rows } = await client.query("SELECT current_user AS role_name");
  const migrationRole = rows[0]?.role_name;
  if (!migrationRole || migrationRole === appRole) {
    throw new Error("Migrations must use a database role separate from APP_DB_USER.");
  }

  const roleIdentifier = quoteIdentifier(appRole);
  const password = quoteLiteral(appPassword);
  const existingRole = await client.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [appRole]);

  if (existingRole.rowCount > 0) {
    await client.query(
      `ALTER ROLE ${roleIdentifier} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD ${password}`,
    );
  } else {
    await client.query(
      `CREATE ROLE ${roleIdentifier} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD ${password}`,
    );
  }

  const memberships = await client.query(
    `SELECT parent.rolname
     FROM pg_auth_members AS membership
     JOIN pg_roles AS parent ON parent.oid = membership.roleid
     JOIN pg_roles AS member ON member.oid = membership.member
     WHERE member.rolname = $1`,
    [appRole],
  );
  for (const { rolname } of memberships.rows) {
    await client.query(`REVOKE ${quoteIdentifier(rolname)} FROM ${roleIdentifier}`);
  }

  const { rows: databaseRows } = await client.query("SELECT current_database() AS database_name");
  const databaseIdentifier = quoteIdentifier(databaseRows[0].database_name);
  await client.query(`REVOKE CONNECT ON DATABASE ${databaseIdentifier} FROM PUBLIC`);
  await client.query(`REVOKE TEMPORARY ON DATABASE ${databaseIdentifier} FROM PUBLIC`);
  await client.query(`GRANT CONNECT ON DATABASE ${databaseIdentifier} TO ${roleIdentifier}`);
  await client.query("REVOKE CREATE ON SCHEMA public FROM PUBLIC");
  await client.query(`GRANT USAGE ON SCHEMA public TO ${roleIdentifier}`);
  await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${roleIdentifier}`);
  await client.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${roleIdentifier}`);
  await client.query(
    `ALTER DEFAULT PRIVILEGES FOR ROLE ${quoteIdentifier(migrationRole)} IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${roleIdentifier}`,
  );
  await client.query(
    `ALTER DEFAULT PRIVILEGES FOR ROLE ${quoteIdentifier(migrationRole)} IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${roleIdentifier}`,
  );
}

async function runMigrations(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      migration_id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const directory = path.resolve("database/migrations");
  const files = await listMigrationFiles(directory);

  for (const file of files) {
    const applied = await client.query("SELECT 1 FROM schema_migrations WHERE migration_id = $1", [file]);
    if (applied.rowCount > 0) continue;

    const source = await fs.readFile(path.join(directory, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(source);
      await client.query("INSERT INTO schema_migrations (migration_id) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`Applied migration ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
}

try {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(781002, 1)");
    try {
      await ensureAppRole(client);
      await runMigrations(client);
      await client.query(`REVOKE ALL ON TABLE schema_migrations FROM ${quoteIdentifier(appRole)}`);
    } finally {
      await client.query("SELECT pg_advisory_unlock(781002, 1)");
    }
  } finally {
    client.release();
  }
} catch (error) {
  console.error("Database provisioning or migration failed.", error.code || "");
  process.exitCode = 1;
} finally {
  await pool.end();
}

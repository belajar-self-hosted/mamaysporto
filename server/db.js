import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
export function assertDatabaseUrl(value = connectionString) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("DATABASE_URL must be configured before starting the server.");
  }
  return value;
}

const configuredPoolMax = Number.parseInt(process.env.DB_POOL_MAX || "10", 10);
const poolMax = Number.isInteger(configuredPoolMax) && configuredPoolMax > 0 && configuredPoolMax <= 50
  ? configuredPoolMax
  : 10;

export const pool = new Pool({
  ...(connectionString ? { connectionString } : {}),
  max: poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", { code: err.code, name: err.name });
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === "development") {
    console.log("executed query", { text, duration, rows: res.rowCount });
  }
  return res;
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import { query } from "./db.js";

const JWT_EXPIRES_IN = "30m";
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMITS = { ip: 10 };
const MAX_LOGIN_BUCKETS = 10_000;
const loginAttempts = new Map();
let loginRequestCount = 0;
const ADVANCE_ADMIN_SESSION_VERSION = "GREATEST(clock_timestamp(), COALESCE(updated_at, '-infinity'::timestamptz) + INTERVAL '1 microsecond')";
const INSECURE_JWT_SECRET_DIGEST = "d1860af7838696a4388b53969b623f0b690f01a388eb43d076eac4bfd96b6ca8";
const DUMMY_PASSWORD_HASH = "$2b$12$ZaTaQ/7Q2CSdtIvu1ZQDNengca.6nzdPnLqpl6ko9KkXM/ZWBJoli";
const DUMMY_PASSWORD_HASH_10 = "$2b$10$pFvy9plK5rI9UfaqLAvxkuMFQ8Y0a5yPH5D4uZkSvuURvwIUu21yq";

export function assertJwtSecret(secret = process.env.JWT_SECRET) {
  const isString = typeof secret === "string";
  const hasMinimumLength = isString && Buffer.byteLength(secret, "utf8") >= 32;
  const hasMinimumVariety = isString && new Set(secret).size >= 16;
  const digest = isString ? createHash("sha256").update(secret).digest("hex") : "";
  if (!hasMinimumLength || !hasMinimumVariety || digest === INSECURE_JWT_SECRET_DIGEST) {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes of high-entropy data.");
  }
  return secret;
}

function getJwtSecret() {
  return assertJwtSecret();
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function compareLoginPassword(password, passwordHash) {
  const rounds = bcrypt.getRounds(passwordHash);
  const matched = await bcrypt.compare(password, passwordHash);

  // Historical admin hashes used cost 10; new hashes use cost 12. Add the
  // complementary work so those supported hash generations take similar time.
  const paddingHash = rounds === 10 ? DUMMY_PASSWORD_HASH : DUMMY_PASSWORD_HASH_10;
  await bcrypt.compare(password, paddingHash);
  return matched;
}

function bucketKey(scope, value) {
  return `${scope}:${value || "unknown"}`;
}

function pruneLoginAttempts(now) {
  for (const [key, bucket] of loginAttempts) {
    if (bucket.resetAt <= now) loginAttempts.delete(key);
  }
}

export function loginRateLimit(req, res, next) {
  const now = Date.now();
  loginRequestCount += 1;
  if (loginRequestCount % 50 === 0 || loginAttempts.size >= MAX_LOGIN_BUCKETS) {
    pruneLoginAttempts(now);
  }

  // Use the client IP only. A hard account/email bucket lets anyone who knows
  // the admin address lock that account out from unrelated source IPs.
  const keys = [
    { key: bucketKey("ip", req.ip || req.socket?.remoteAddress), limit: LOGIN_LIMITS.ip },
  ];

  const newKeys = keys.filter(({ key }, index) => !loginAttempts.has(key) && keys.findIndex((item) => item.key === key) === index);
  if (loginAttempts.size + newKeys.length > MAX_LOGIN_BUCKETS) {
    res.set("Retry-After", "60");
    return res.status(429).json({ error: "Batas percobaan login sementara tercapai. Coba lagi nanti." });
  }

  const activeBuckets = keys.map(({ key, limit }) => {
    const existing = loginAttempts.get(key);
    const bucket = !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + LOGIN_WINDOW_MS }
      : existing;
    return { key, limit, bucket };
  });

  const blocked = activeBuckets
    .filter(({ bucket, limit }) => bucket.count >= limit)
    .sort((left, right) => right.bucket.resetAt - left.bucket.resetAt)[0];

  if (blocked) {
    res.set("Retry-After", String(Math.max(1, Math.ceil((blocked.bucket.resetAt - now) / 1000))));
    return res.status(429).json({ error: "Terlalu banyak percobaan login. Coba lagi nanti." });
  }

  for (const { key, bucket } of activeBuckets) {
    bucket.count += 1;
    loginAttempts.set(key, bucket);
  }

  res.locals.loginRateLimitKeys = activeBuckets.map(({ key }) => key);
  return next();
}

function clearLoginAttempts(res) {
  for (const key of res.locals.loginRateLimitKeys || []) loginAttempts.delete(key);
}

function sessionVersionSql(alias = "") {
  const prefix = alias ? `${alias}.` : "";
  return `COALESCE(to_char(${prefix}updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US'), '')`;
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id || typeof decoded.sessionVersion !== "string") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { rows } = await query(
      `SELECT id, email, ${sessionVersionSql()} AS session_version FROM admins WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );
    const admin = rows[0];
    if (!admin || admin.email !== decoded.email || admin.session_version !== decoded.sessionVersion) {
      return res.status(401).json({ error: "Sesi tidak valid. Silakan login kembali." });
    }

    req.admin = { id: admin.id, email: admin.email };
    return next();
  } catch (err) {
    console.error("Authentication session check failed:", { code: err.code, name: err.name });
    return res.status(503).json({ error: "Layanan autentikasi sementara tidak tersedia." });
  }
}

export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body || {};
    if (
      typeof email !== "string" || !email.trim() || email.length > 254 ||
      typeof password !== "string" || password.length === 0 || password.length > 128
    ) {
      return res.status(400).json({ error: "Email atau password tidak valid." });
    }

    const { rows } = await query(
      `SELECT id, email, password_hash, ${sessionVersionSql()} AS session_version FROM admins WHERE email = $1 LIMIT 1`,
      [normalizeEmail(email)]
    );

    const admin = rows[0];
    const passwordMatch = await compareLoginPassword(password, admin?.password_hash || DUMMY_PASSWORD_HASH);
    if (!admin) {
      return res.status(401).json({ error: "Email atau password salah." });
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: "Email atau password salah." });
    }

    if (bcrypt.getRounds(admin.password_hash) < 12) {
      try {
        const upgradedHash = await bcrypt.hash(password, 12);
        await query(
          "UPDATE admins SET password_hash = $1 WHERE id = $2 AND password_hash = $3",
          [upgradedHash, admin.id, admin.password_hash],
        );
      } catch (upgradeError) {
        console.error("Admin password hash upgrade failed:", { code: upgradeError.code, name: upgradeError.name });
      }
    }

    const token = signToken({
      id: admin.id,
      email: admin.email,
      sessionVersion: admin.session_version,
    });
    clearLoginAttempts(res);
    return res.json({ token, user: { id: admin.id, email: admin.email } });
  } catch (err) {
    console.error("Login error:", { code: err.code, name: err.name });
    return res.status(500).json({ error: "Login gagal karena kesalahan server." });
  }
}

export async function handleMe(req, res) {
  return res.json({ user: req.admin });
}

export async function handleLogout(req, res) {
  try {
    await query(`UPDATE admins SET updated_at = ${ADVANCE_ADMIN_SESSION_VERSION} WHERE id = $1`, [req.admin.id]);
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", { code: err.code, name: err.name });
    return res.status(500).json({ error: "Logout gagal karena kesalahan server." });
  }
}

export async function handleUpdateAccount(req, res) {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email, password } = req.body || {};
    if (typeof email !== "string" || !email.trim() || email.length > 254 || !email.includes("@")) {
      return res.status(400).json({ error: "Alamat email tidak valid." });
    }

    const normalizedEmail = normalizeEmail(email);
    const checkEmail = await query("SELECT id FROM admins WHERE email = $1 AND id != $2 LIMIT 1", [
      normalizedEmail,
      adminId,
    ]);
    if (checkEmail.rows.length > 0) {
      return res.status(409).json({ error: "Email sudah digunakan oleh akun lain." });
    }

    if (password !== undefined && password !== "") {
      if (
        typeof password !== "string" || Array.from(password).length < 14 || password.length > 128 ||
        Buffer.byteLength(password, "utf8") > 72
      ) {
        return res.status(400).json({ error: "Password harus terdiri dari minimal 14 karakter dan maksimal 72 byte UTF-8." });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const { rows } = await query(
        `UPDATE admins SET email = $1, password_hash = $2, updated_at = ${ADVANCE_ADMIN_SESSION_VERSION} WHERE id = $3 RETURNING id, email`,
        [normalizedEmail, passwordHash, adminId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "Akun admin tidak ditemukan." });
      }
      return res.json({
        success: true,
        message: "Email dan password berhasil diperbarui. Silakan login kembali.",
        user: { id: rows[0].id, email: rows[0].email },
      });
    }

    const { rows } = await query(
      `UPDATE admins SET email = $1, updated_at = ${ADVANCE_ADMIN_SESSION_VERSION} WHERE id = $2 RETURNING id, email`,
      [normalizedEmail, adminId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Akun admin tidak ditemukan." });
    }
    return res.json({
      success: true,
      message: "Email berhasil diperbarui. Silakan login kembali.",
      user: { id: rows[0].id, email: rows[0].email },
    });
  } catch (err) {
    console.error("Update account error:", { code: err.code, name: err.name });
    return res.status(500).json({ error: "Gagal memperbarui akun karena kesalahan server." });
  }
}

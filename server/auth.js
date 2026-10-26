import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "mamaysporto-super-secure-production-jwt-key";
const JWT_EXPIRES_IN = "7d";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }

  req.admin = decoded;
  next();
}

export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { rows } = await query("SELECT id, email, password_hash FROM admins WHERE email = $1 LIMIT 1", [
      email.toLowerCase().trim(),
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const admin = rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ id: admin.id, email: admin.email });
    return res.json({
      token,
      user: { id: admin.id, email: admin.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}

export async function handleMe(req, res) {
  return res.json({ user: req.admin });
}

export async function handleLogout(req, res) {
  return res.json({ message: "Logged out successfully" });
}

export async function handleUpdateAccount(req, res) {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email, password } = req.body || {};
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Alamat email tidak valid." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Pastikan email tidak dipakai oleh admin lain
    const checkEmail = await query("SELECT id FROM admins WHERE email = $1 AND id != $2 LIMIT 1", [
      normalizedEmail,
      adminId,
    ]);
    if (checkEmail.rows.length > 0) {
      return res.status(409).json({ error: "Email sudah digunakan oleh akun lain." });
    }

    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ error: "Password minimal terdiri dari 6 karakter." });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const { rows } = await query(
        "UPDATE admins SET email = $1, password_hash = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email",
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
    } else {
      const { rows } = await query(
        "UPDATE admins SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email",
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
    }
  } catch (err) {
    console.error("Update account error:", err);
    return res.status(500).json({ error: err.message || "Gagal memperbarui akun." });
  }
}

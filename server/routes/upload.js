import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import { randomUUID } from "node:crypto";
import { requireAuth } from "../auth.js";

const router = Router();
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve("uploads");
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_FILES = 5_000;
const configuredMaxStorageBytes = Number.parseInt(process.env.UPLOADS_MAX_BYTES || "104857600", 10);
const MAX_STORAGE_BYTES = Number.isSafeInteger(configuredMaxStorageBytes) && configuredMaxStorageBytes >= MAX_FILE_BYTES
  ? configuredMaxStorageBytes
  : 104857600;
const UPLOAD_WINDOW_MS = 60 * 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 20;
const uploadAttempts = new Map();
let reservedBytes = 0;
let reservedFiles = 0;

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true, mode: 0o750 });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_BYTES,
    files: 1,
    fields: 0,
    parts: 1,
    fieldNameSize: 100,
  },
});

function detectImage(buffer) {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer.subarray(1, 4).toString("ascii") === "PNG" &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) return { ext: ".png", mime: "image/png" };

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }

  if (
    buffer.length >= 6 && buffer.subarray(0, 3).toString("ascii") === "GIF" &&
    (buffer.subarray(3, 6).toString("ascii") === "87a" || buffer.subarray(3, 6).toString("ascii") === "89a")
  ) return { ext: ".gif", mime: "image/gif" };

  if (
    buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) return { ext: ".webp", mime: "image/webp" };

  if (buffer.length >= 6 && buffer.readUInt16LE(0) === 0 && buffer.readUInt16LE(2) === 1) {
    return { ext: ".ico", mime: "image/x-icon" };
  }

  return null;
}

function limitUploadRate(req, res, next) {
  const key = String(req.admin?.id || req.ip || req.socket?.remoteAddress || "unknown");
  const now = Date.now();
  for (const [bucketKey, bucket] of uploadAttempts) {
    if (bucket.resetAt <= now) uploadAttempts.delete(bucketKey);
  }

  const current = uploadAttempts.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + UPLOAD_WINDOW_MS }
    : current;
  if (bucket.count >= MAX_UPLOADS_PER_WINDOW) {
    res.set("Retry-After", String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
    return res.status(429).json({ error: "Batas upload sementara tercapai. Coba lagi nanti." });
  }
  if (uploadAttempts.size >= 10_000 && !current) {
    return res.status(429).json({ error: "Batas upload sementara tercapai. Coba lagi nanti." });
  }

  bucket.count += 1;
  uploadAttempts.set(key, bucket);
  return next();
}

async function getStorageUsage() {
  const entries = await fsPromises.readdir(UPLOADS_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());
  const sizes = await Promise.all(files.map(async (entry) => {
    const stat = await fsPromises.stat(path.join(UPLOADS_DIR, entry.name));
    return stat.size;
  }));
  return { bytes: sizes.reduce((total, size) => total + size, 0), files: files.length };
}

async function saveImage(file) {
  const detected = detectImage(file.buffer);
  if (!detected) {
    const error = new Error("Unsupported image content.");
    error.code = "INVALID_IMAGE_CONTENT";
    throw error;
  }

  const usage = await getStorageUsage();
  if (
    usage.bytes + reservedBytes + file.size > MAX_STORAGE_BYTES ||
    usage.files + reservedFiles >= MAX_UPLOAD_FILES
  ) {
    const error = new Error("Upload storage quota exceeded.");
    error.code = "UPLOAD_STORAGE_QUOTA";
    throw error;
  }

  reservedBytes += file.size;
  reservedFiles += 1;
  const filename = `img-${randomUUID()}${detected.ext}`;
  const destination = path.join(UPLOADS_DIR, filename);
  try {
    await fsPromises.writeFile(destination, file.buffer, { flag: "wx", mode: 0o640 });
  } finally {
    reservedBytes -= file.size;
    reservedFiles -= 1;
  }

  return { filename, size: file.size, mime: detected.mime };
}

router.post("/", requireAuth, limitUploadRate, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File tidak ditemukan dalam request." });
  }

  try {
    const saved = await saveImage(req.file);
    return res.status(201).json({
      url: `/uploads/${saved.filename}`,
      filename: saved.filename,
      size: saved.size,
    });
  } catch (err) {
    if (err.code === "INVALID_IMAGE_CONTENT") {
      return res.status(415).json({ error: "Format gambar tidak didukung. Gunakan JPEG, PNG, WebP, GIF, atau ICO." });
    }
    if (err.code === "UPLOAD_STORAGE_QUOTA") {
      return res.status(507).json({ error: "Kapasitas penyimpanan upload telah tercapai." });
    }
    console.error("Image upload failed:", { code: err.code, name: err.name });
    return res.status(500).json({ error: "Gagal menyimpan gambar." });
  }
});

export default router;

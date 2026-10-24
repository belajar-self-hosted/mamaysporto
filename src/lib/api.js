// REST API Client for mamaysporto
import { getStoredToken } from "./auth";

function getAuthHeaders() {
  const token = getStoredToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Ambil semua item dari sebuah koleksi / tabel CMS.
 * Singleton tables (hero, about, site_settings) mengembalikan object langsung.
 * Collection tables (skills, projects, experience, project_tags) mengembalikan array.
 */
export async function fetchCollection(collectionName) {
  const res = await fetch(`/api/data/${collectionName}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Gagal mengambil data "${collectionName}".`);
  }
  return res.json();
}

/** Update singleton row (id = 1) milik sebuah tabel. Butuh sesi admin login. */
export async function updateSingleton(table, patch) {
  const res = await fetch(`/api/data/${table}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(patch),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Gagal menyimpan "${table}".`);
  }
  return data;
}

/** Tambah row baru ke collection table. Butuh sesi admin login. */
export async function insertRow(table, row) {
  const res = await fetch(`/api/data/${table}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(row),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Gagal menambah data "${table}".`);
  }
  return data;
}

/** Update row collection table berdasarkan id. Butuh sesi admin login. */
export async function updateRow(table, id, patch) {
  const { id: _id, created_at: _createdAt, ...safePatch } = patch;

  const res = await fetch(`/api/data/${table}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(safePatch),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Gagal menyimpan "${table}".`);
  }
  return data;
}

/** Hapus row collection table berdasarkan id. Butuh sesi admin login. */
export async function deleteRow(table, id) {
  const res = await fetch(`/api/data/${table}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Gagal menghapus data "${table}".`);
  }
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** Upload gambar ke server lokal, lalu kembalikan URL-nya. */
async function uploadImage(_bucket, file) {
  if (!file) throw new Error("File tidak ditemukan.");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  const token = getStoredToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal mengunggah gambar ke server.");
  }

  return data.url;
}

/** Upload gambar project ke server lokal. */
export function uploadProjectImage(file) {
  return uploadImage("project-images", file);
}

/** Upload gambar situs (mis. foto Hero/Favicon) ke server lokal. */
export function uploadSiteImage(file) {
  return uploadImage("site-images", file);
}

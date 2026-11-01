// REST API Client for mamaysporto
import { getStoredToken, onAuthStateChange } from "./auth.js";

const COLLECTION_CACHE_TTL_MS = 30_000;
const COLLECTION_PAGE_SIZE = 500;
const collectionCache = new Map();

function clearPrivateCollectionCache() {
  for (const [cacheKey, entry] of collectionCache) {
    if (entry.isPrivate) collectionCache.delete(cacheKey);
  }
}

onAuthStateChange(clearPrivateCollectionCache);

export function invalidateCollection(collectionName) {
  collectionCache.delete(collectionName);
  for (const [cacheKey, entry] of collectionCache) {
    if (entry.isPrivate && cacheKey.startsWith(`${collectionName}:private:`)) {
      collectionCache.delete(cacheKey);
    }
  }
}

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
export function fetchCollection(collectionName, { includePrivate = false } = {}) {
  const token = includePrivate ? getStoredToken() : null;
  const cacheKey = includePrivate
    ? `${collectionName}:private:${token ?? "anonymous"}`
    : collectionName;
  const cached = collectionCache.get(cacheKey);
  if (cached?.promise) return cached.promise;
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.data);

  const entry = { data: undefined, expiresAt: 0, promise: null, isPrivate: includePrivate };
  const fetchPage = (offset) => fetch(
    `/api/data/${encodeURIComponent(collectionName)}?limit=${COLLECTION_PAGE_SIZE}&offset=${offset}${includePrivate ? "&includePrivate=true" : ""}`,
    includePrivate && token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined
  ).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Gagal mengambil data "${collectionName}".`);
      }
      return res.json();
    });

  const request = (async () => {
    const firstPage = await fetchPage(0);
    if (!Array.isArray(firstPage)) return firstPage;

    const rows = [...firstPage];
    let offset = firstPage.length;
    let page = firstPage;
    while (page.length === COLLECTION_PAGE_SIZE) {
      page = await fetchPage(offset);
      if (!Array.isArray(page)) throw new Error(`Respons koleksi "${collectionName}" tidak valid.`);
      rows.push(...page);
      offset += page.length;
    }
    return rows;
  })()
    .then((data) => {
      if (collectionCache.get(cacheKey) === entry) {
        entry.data = data;
        entry.expiresAt = Date.now() + COLLECTION_CACHE_TTL_MS;
        entry.promise = null;
      }
      return data;
    })
    .catch((error) => {
      if (collectionCache.get(cacheKey) === entry) collectionCache.delete(cacheKey);
      throw error;
    });

  entry.promise = request;
  collectionCache.set(cacheKey, entry);
  return request;
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
  invalidateCollection(table);
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
  invalidateCollection(table);
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
  invalidateCollection(table);
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
  invalidateCollection(table);
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

// src/lib/api.js
//
// Karena Nginx men-serve frontend DAN mem-proxy /api di origin yang sama
// (satu domain, satu port dari sudut pandang browser), fetch bisa pakai
// path relatif "/api/..." tanpa perlu konfigurasi CORS tambahan di Directus.

const API_BASE = "/api";

/**
 * Ambil semua item dari sebuah collection Directus.
 * Ganti "posts" dengan nama collection kamu yang sebenarnya di Directus.
 */
export async function fetchCollection(collectionName) {
  const res = await fetch(`${API_BASE}/items/${collectionName}`);

  if (!res.ok) {
    throw new Error(`Gagal mengambil data "${collectionName}": HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.data; // Directus selalu membungkus hasil dalam { data: [...] }
}

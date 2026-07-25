import { supabase } from "./supabase";

const SINGLETON_TABLES = new Set(["hero", "about", "site_settings"]);

/**
 * Ambil semua item dari sebuah tabel Supabase.
 *
 * Singleton tables (hero, about, site_settings) mengembalikan object langsung.
 * Collection tables (skills, projects, experience) mengembalikan array.
 */
export async function fetchCollection(collectionName) {
  const { data, error } = await supabase
    .from(collectionName)
    .select("*");

  if (error) {
    throw new Error(`Gagal mengambil data "${collectionName}": ${error.message}`);
  }

  if (SINGLETON_TABLES.has(collectionName)) {
    return data && data.length > 0 ? data[0] : null;
  }

  return data || [];
}

/** Update singleton row (id = 1) milik sebuah tabel. Butuh sesi admin login. */
export async function updateSingleton(table, patch) {
  const { data, error } = await supabase
    .from(table)
    .update(patch)
    .eq("id", 1)
    .select()
    .single();

  if (error) throw new Error(`Gagal menyimpan "${table}": ${error.message}`);
  return data;
}

/** Tambah row baru ke collection table. Butuh sesi admin login. */
export async function insertRow(table, row) {
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Gagal menambah data "${table}": ${error.message}`);
  return data;
}

/** Update row collection table berdasarkan id. Butuh sesi admin login. */
export async function updateRow(table, id, patch) {
  // Buang id/created_at kalau ikut terbawa dari form (mis. hasil spread row lama) —
  // "id" adalah generated identity column, Postgres menolak kalau di-SET manual.
  const { id: _id, created_at: _createdAt, ...safePatch } = patch;

  const { data, error } = await supabase
    .from(table)
    .update(safePatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Gagal menyimpan "${table}": ${error.message}`);
  return data;
}

/** Hapus row collection table berdasarkan id. Butuh sesi admin login. */
export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus data "${table}": ${error.message}`);
}

const MAX_IMAGE_BYTES = 1024 * 1024; // 1MB

/** Upload gambar ke sebuah bucket Supabase Storage (max 1MB), lalu kembalikan public URL-nya. */
async function uploadImage(bucket, file) {
  if (!file) throw new Error("File tidak ditemukan.");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Ukuran gambar maksimal 1 MB.");
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw new Error(`Gagal upload gambar: ${uploadError.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Upload gambar project ke Supabase Storage (bucket project-images, max 1MB). */
export function uploadProjectImage(file) {
  return uploadImage("project-images", file);
}

/** Upload gambar situs (mis. foto Hero) ke Supabase Storage (bucket site-images, max 1MB). */
export function uploadSiteImage(file) {
  return uploadImage("site-images", file);
}

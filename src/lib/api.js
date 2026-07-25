import { supabase } from "./supabase";

/**
 * Ambil semua item dari sebuah tabel Supabase.
 * Signature tetap sama agar section components tidak perlu diubah.
 *
 * Singleton tables (hero, about) mengembalikan object langsung.
 * Collection tables (skills, projects, experience) mengembalikan array.
 */
export async function fetchCollection(collectionName) {
  const { data, error } = await supabase
    .from(collectionName)
    .select("*");

  if (error) {
    throw new Error(`Gagal mengambil data "${collectionName}": ${error.message}`);
  }

  // Singleton tables: return object (ambil row pertama)
  if (collectionName === "hero" || collectionName === "about") {
    return data && data.length > 0 ? data[0] : null;
  }

  // Collection tables: return array
  return data || [];
}

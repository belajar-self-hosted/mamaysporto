/**
 * Pastikan URL punya scheme (https://, mailto:, tel:, dll) sebelum dipakai sebagai href.
 * Tanpa ini, input seperti "google.com" jadi link RELATIF ke halaman saat ini, bukan
 * link absolut ke situs eksternal.
 */
export function normalizeUrl(value) {
  const trimmed = (value || "").trim();
  if (!trimmed || trimmed === "#") return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith("//")) return trimmed;
  return `https://${trimmed}`;
}

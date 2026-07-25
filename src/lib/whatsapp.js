/** Bangun link wa.me dari nomor & pesan default, dengan pesan di-encode dengan benar. */
export function buildWhatsAppLink(number, message) {
  const digits = (number || "").replace(/[^\d]/g, "");
  if (!digits) return "";

  const text = (message || "").trim();
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

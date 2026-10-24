// Helper untuk mengatur dan memperbarui favicon browser secara dinamis

export function setFavicon(url) {
  if (!url || typeof document === "undefined") return;

  // Hapus semua tag link icon lama untuk memaksa browser refresh cache favicon
  const existingIcons = document.querySelectorAll('link[rel*="icon"]');
  existingIcons.forEach((el) => el.remove());

  // Tentukan MIME type berdasarkan ekstensi file
  let type = "";
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".svg")) {
    type = "image/svg+xml";
  } else if (cleanUrl.endsWith(".png")) {
    type = "image/png";
  } else if (cleanUrl.endsWith(".ico")) {
    type = "image/x-icon";
  } else if (cleanUrl.endsWith(".webp")) {
    type = "image/webp";
  } else if (cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg")) {
    type = "image/jpeg";
  }

  // Buat element rel="icon" baru
  const link = document.createElement("link");
  link.rel = "icon";
  if (type) link.type = type;
  link.href = url;
  document.head.appendChild(link);

  // Tambahkan rel="shortcut icon" untuk kompatibilitas maksimal browser
  const shortcutLink = document.createElement("link");
  shortcutLink.rel = "shortcut icon";
  if (type) shortcutLink.type = type;
  shortcutLink.href = url;
  document.head.appendChild(shortcutLink);
}

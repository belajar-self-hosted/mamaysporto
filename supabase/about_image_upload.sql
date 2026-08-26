-- =============================================
-- About section image upload (mamaysporto)
-- =============================================
-- Jalankan SETELAH chat_ticker_text.sql, lewat Supabase SQL Editor.
--
-- Menambahkan kolom `image` di tabel about (URL gambar manifesto/figure),
-- diupload lewat admin panel ke bucket "site-images" yang sudah dibuat
-- di hero_image_upload.sql.
-- =============================================

alter table about add column if not exists image text not null default '';

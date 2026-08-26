-- =============================================
-- Contact section decorative image upload (mamaysporto)
-- =============================================
-- Jalankan SETELAH about_image_upload.sql, lewat Supabase SQL Editor.
--
-- Menambahkan kolom `contact_image` di tabel site_settings (URL gambar
-- dekoratif di section Contact), diupload lewat admin panel ke bucket
-- "site-images" yang sudah dibuat di hero_image_upload.sql.
-- =============================================

alter table site_settings add column if not exists contact_image text not null default '';

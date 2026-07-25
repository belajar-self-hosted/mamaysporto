-- =============================================
-- Site meta: judul tab browser & favicon (mamaysporto)
-- =============================================
-- Jalankan SETELAH hero_image_upload.sql, lewat Supabase SQL Editor.
--
-- Menambahkan kolom site_title (judul tab browser) dan favicon_url
-- (gambar favicon, diupload lewat admin panel ke bucket site-images
-- yang sudah dibuat di hero_image_upload.sql).
-- =============================================

alter table site_settings
  add column if not exists site_title text not null default 'Fannandya Sutan',
  add column if not exists favicon_url text not null default '';

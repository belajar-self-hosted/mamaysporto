-- =============================================
-- Skills icon upload (mamaysporto)
-- =============================================
-- Jalankan SETELAH contact_image_upload.sql, lewat Supabase SQL Editor.
--
-- Menambahkan kolom `icon_url` di tabel skills (URL ikon kecil per-skill,
-- opsional), diupload lewat admin panel ke bucket "site-images" yang
-- sudah dibuat di hero_image_upload.sql. Skill tanpa icon tetap tampil
-- sebagai pill teks-saja di frontend (non-breaking untuk data lama).
-- =============================================

alter table skills add column if not exists icon_url text not null default '';

-- =============================================
-- WhatsApp "Report" link: pisah jadi nomor + pesan default (mamaysporto)
-- =============================================
-- Jalankan SETELAH social_links_dynamic.sql, lewat Supabase SQL Editor.
--
-- Menggantikan kolom report_whatsapp_link (raw wa.me URL) dengan dua kolom
-- yang lebih gampang diisi admin: report_whatsapp_number & report_whatsapp_message.
-- Link wa.me lengkap dibangun otomatis di frontend (src/lib/whatsapp.js).
-- =============================================

alter table site_settings
  add column if not exists report_whatsapp_number text not null default '',
  add column if not exists report_whatsapp_message text not null default '';

-- Sesuaikan nilai default di bawah kalau kamu ingin data awal yang berbeda.
update site_settings
set
  report_whatsapp_number = '6285190847766',
  report_whatsapp_message = 'halo admin saya ingin melaporkan bug yang terdapat di website mamay.my.id berupa: '
where id = 1 and report_whatsapp_number = '';

alter table site_settings drop column if exists report_whatsapp_link;

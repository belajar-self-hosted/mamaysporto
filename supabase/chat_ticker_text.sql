-- =============================================
-- Site settings: teks berjalan (ticker) di bawah chat container (mamaysporto)
-- =============================================
-- Jalankan lewat Supabase SQL Editor.
--
-- Menambahkan kolom chat_ticker_text ke site_settings — teks yang tampil
-- berjalan dari kiri ke kanan di bawah section ChatAI (Yowman), diedit
-- lewat admin panel > Site Settings.
-- =============================================

alter table site_settings
  add column if not exists chat_ticker_text text not null default 'Ada pertanyaan tentang aku? Tanya langsung ke YOWMAN, asisten AI pribadiku!';

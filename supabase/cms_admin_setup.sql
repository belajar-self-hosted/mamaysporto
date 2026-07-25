-- =============================================
-- CMS Admin Setup for Portfolio (mamaysporto)
-- =============================================
-- Jalankan SETELAH schema.sql, lewat Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- Menambahkan:
-- 1. Kolom judul/CTA dinamis di tabel hero
-- 2. Tabel site_settings (navbar, footer, contact, AI system prompt)
-- 3. Policy write (insert/update/delete) khusus untuk user authenticated (admin)
-- 4. Storage bucket "project-images" (public read, max 1MB) untuk upload gambar project
--
-- Setelah menjalankan script ini, buat 1 akun admin lewat:
-- Supabase Dashboard > Authentication > Users > Add User
-- Akun ini yang dipakai untuk login ke halaman admin (/#/admin).
-- Jangan aktifkan public sign-up — hanya akun ini yang boleh bisa login.
-- =============================================

-- 1. Extend hero dengan bagian judul + CTA
alter table hero
  add column if not exists greeting text not null default 'HALO, AKU',
  add column if not exists display_name text not null default 'TAMA',
  add column if not exists role_prefix text not null default 'JUNIOR FULL STACK',
  add column if not exists role_highlight text not null default 'DEVELOPER',
  add column if not exists cta_projects_label text not null default 'View Projects',
  add column if not exists cta_contact_label text not null default 'Contact Me',
  add column if not exists cta_yowman_label text not null default 'YOWMAN',
  add column if not exists cta_yowman_link text not null default 'https://aspriguatuh.my.id';

-- 2. site_settings (Singleton) - navbar, footer, contact section, AI system prompt
create table if not exists site_settings (
  id int primary key default 1,
  navbar_brand text not null default 'WEBLOG',
  footer_name text not null default 'FANNANDYA.',
  footer_github text not null default '',
  footer_linkedin text not null default '',
  footer_instagram text not null default '',
  contact_title text not null default 'GET IN TOUCH',
  contact_desc text not null default '',
  report_whatsapp_link text not null default '',
  ai_system_prompt text not null default '',
  constraint site_settings_single_row check (id = 1)
);

alter table site_settings enable row level security;

drop policy if exists "Public read site_settings" on site_settings;
create policy "Public read site_settings" on site_settings for select using (true);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- 3. Write policies (authenticated/admin only) untuk semua tabel CMS
drop policy if exists "Authenticated write hero" on hero;
create policy "Authenticated write hero" on hero for all
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

drop policy if exists "Authenticated write about" on about;
create policy "Authenticated write about" on about for all
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

drop policy if exists "Authenticated write skills" on skills;
create policy "Authenticated write skills" on skills for all
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

drop policy if exists "Authenticated write projects" on projects;
create policy "Authenticated write projects" on projects for all
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

drop policy if exists "Authenticated write experience" on experience;
create policy "Authenticated write experience" on experience for all
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

drop policy if exists "Authenticated write site_settings" on site_settings;
create policy "Authenticated write site_settings" on site_settings for all
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

-- 4. Storage bucket untuk gambar project (public read, 1MB limit, admin write)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 1048576, array['image/png','image/jpeg','image/jpg','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read project-images" on storage.objects;
create policy "Public read project-images" on storage.objects for select
  using (bucket_id = 'project-images');

drop policy if exists "Authenticated upload project-images" on storage.objects;
create policy "Authenticated upload project-images" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

drop policy if exists "Authenticated update project-images" on storage.objects;
create policy "Authenticated update project-images" on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Authenticated delete project-images" on storage.objects;
create policy "Authenticated delete project-images" on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');

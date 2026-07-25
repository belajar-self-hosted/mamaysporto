-- =============================================
-- Hero profile image upload (mamaysporto)
-- =============================================
-- Jalankan SETELAH cms_admin_setup.sql, lewat Supabase SQL Editor.
--
-- Menambahkan kolom `image` di tabel hero (URL foto profil) dan bucket
-- storage "site-images" untuk gambar singleton/site-wide (mis. foto Hero),
-- terpisah dari bucket "project-images".
-- =============================================

alter table hero add column if not exists image text not null default '';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 1048576, array['image/png','image/jpeg','image/jpg','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read site-images" on storage.objects;
create policy "Public read site-images" on storage.objects for select
  using (bucket_id = 'site-images');

drop policy if exists "Authenticated upload site-images" on storage.objects;
create policy "Authenticated upload site-images" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images');

drop policy if exists "Authenticated update site-images" on storage.objects;
create policy "Authenticated update site-images" on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images');

drop policy if exists "Authenticated delete site-images" on storage.objects;
create policy "Authenticated delete site-images" on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images');

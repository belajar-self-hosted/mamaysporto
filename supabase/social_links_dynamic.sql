-- =============================================
-- Social links jadi list dinamis (mamaysporto)
-- =============================================
-- Jalankan SETELAH site_meta_title_favicon.sql, lewat Supabase SQL Editor.
--
-- Mengganti kolom tetap footer_github/footer_linkedin/footer_instagram
-- dengan satu kolom jsonb `social_links` (array of { url }), sehingga admin
-- bisa menambah sosial media apa saja lewat admin panel. Ikon yang tampil
-- di homepage dideteksi otomatis dari domain URL (lihat src/lib/socialIcons.jsx),
-- tidak disimpan di database.
-- =============================================

alter table site_settings add column if not exists social_links jsonb not null default '[]'::jsonb;

with existing as (
  select footer_github, footer_linkedin, footer_instagram from site_settings where id = 1
),
built as (
  select coalesce(jsonb_agg(jsonb_build_object('url', url)), '[]'::jsonb) as links
  from (
    select footer_github as url from existing where footer_github is not null and footer_github <> ''
    union all
    select footer_linkedin from existing where footer_linkedin is not null and footer_linkedin <> ''
    union all
    select footer_instagram from existing where footer_instagram is not null and footer_instagram <> ''
  ) t
)
update site_settings set social_links = (select links from built) where id = 1;

alter table site_settings drop column if exists footer_github;
alter table site_settings drop column if exists footer_linkedin;
alter table site_settings drop column if exists footer_instagram;

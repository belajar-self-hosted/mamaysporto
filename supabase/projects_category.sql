-- Tambah kolom kategori deployment status ke project (live / localhost).
-- Dipakai untuk filter tab di section Projects dan badge status di tiap project card.

alter table projects
  add column category text not null default 'live';

alter table projects
  add constraint projects_category_check check (category in ('live', 'localhost'));

-- Tabel master untuk tags project, dipilih via checkbox di form Project (bukan ketik bebas lagi).
-- Diisi awal dengan tag yang sudah dipakai project-project yang sudah ada supaya tidak hilang.

create table if not exists project_tags (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz default now()
);

alter table project_tags enable row level security;

create policy "Public read project_tags" on project_tags for select using (true);

create policy "Authenticated write project_tags" on project_tags for all
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

insert into project_tags (name) values
  ('AI'), ('Express'), ('Desktop'), ('Management'), ('Web'), ('Next.js'), ('postgres')
on conflict (name) do nothing;

-- =============================================
-- Supabase Schema for Portfolio (mamaysporto)
-- =============================================
-- Jalankan SQL ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =============================================

-- 1. HERO (Singleton - hanya 1 row)
create table if not exists hero (
  id int primary key default 1,
  subtitle text not null,
  constraint hero_single_row check (id = 1)
);

-- 2. ABOUT (Singleton - hanya 1 row)
create table if not exists about (
  id int primary key default 1,
  content text not null,
  stat_1_number text not null,
  stat_1_label text not null,
  stat_2_number text not null,
  stat_2_label text not null,
  stat_3_number text not null,
  stat_3_label text not null,
  constraint about_single_row check (id = 1)
);

-- 3. SKILLS (Collection - multi rows)
create table if not exists skills (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz default now()
);

-- 4. PROJECTS (Collection - multi rows)
create table if not exists projects (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null default '',
  image text not null default '',
  link text not null default '#',
  github text not null default '#',
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 5. EXPERIENCE (Collection - multi rows)
create table if not exists experience (
  id bigint generated always as identity primary key,
  role text not null,
  company text not null,
  period text not null,
  description text not null default '',
  created_at timestamptz default now()
);

-- =============================================
-- RLS (Row Level Security) - Public Read Only
-- =============================================
alter table hero enable row level security;
alter table about enable row level security;
alter table skills enable row level security;
alter table projects enable row level security;
alter table experience enable row level security;

-- Policy: Anonymous user (anon key) hanya bisa SELECT
create policy "Public read hero" on hero for select using (true);
create policy "Public read about" on about for select using (true);
create policy "Public read skills" on skills for select using (true);
create policy "Public read projects" on projects for select using (true);
create policy "Public read experience" on experience for select using (true);

-- =============================================
-- Sample Data (opsional - hapus setelah import data asli)
-- =============================================
insert into hero (id, subtitle) values (1, 'Mahasiswa Teknik Informasi UMY yang passionate di bidang web development dan networking.')
on conflict (id) do update set subtitle = excluded.subtitle;

insert into about (id, content, stat_1_number, stat_1_label, stat_2_number, stat_2_label, stat_3_number, stat_3_label)
values (1, '<p>Aku adalah <strong>Tama</strong>, mahasiswa Teknik Informasi di Universitas Muhammadiyah Yogyakarta semester 5. Aku passionate di bidang <strong>web development</strong> dan <strong>computer networking</strong>.</p><p>Aku suka explore hal baru di bidang teknologi dan sedang belajar mobile development.</p>', '5+', 'Projects Done', '3.58', 'GPA (Sem 5)', '2', 'Certificates')
on conflict (id) do update set
  content = excluded.content,
  stat_1_number = excluded.stat_1_number,
  stat_1_label = excluded.stat_1_label,
  stat_2_number = excluded.stat_2_number,
  stat_2_label = excluded.stat_2_label,
  stat_3_number = excluded.stat_3_number,
  stat_3_label = excluded.stat_3_label;

insert into skills (name) values
  ('JavaScript'), ('React.js'), ('Next.js'), ('Node.js'), ('SolidJS'),
  ('PostgreSQL'), ('MySQL'), ('SQL Server'), ('Tailwind CSS'), ('Docker'),
  ('Git'), ('Linux'), ('Networking')
on conflict do nothing;

insert into projects (title, description, image, link, github, tags) values
  ('Portfolio Website', 'Website portofolio pribadi dengan desain Neobrutalism', '', 'https://mamay.my.id', 'https://github.com/tama/mamaysporto', '["SolidJS","Vite","Neobrutalism"]'),
  ('Yowman AI Chat', 'Chatbot AI pribadi yang menjawab pertanyaan tentang profil', '', '', '', '["AI","OpenRouter","Express"]'),
  ('Sarpras App', 'Aplikasi desktop manajemen sarana dan prasarana prodi TI UMY', '', '', '', '["Desktop","Management"]')
on conflict do nothing;

insert into experience (role, company, period, description) values
  ('Asisten Dosen', 'Universitas Muhammadiyah Yogyakarta', '2024 - Sekarang', 'Membantu mengajar mata kuliah Administrasi Basis Data')
on conflict do nothing;

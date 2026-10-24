-- =============================================
-- PostgreSQL Schema for mamaysporto
-- Target: PostgreSQL 16 (LXC 10018)
-- =============================================

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. HERO (Singleton - hanya 1 row)
CREATE TABLE IF NOT EXISTS hero (
  id INT PRIMARY KEY DEFAULT 1,
  greeting TEXT NOT NULL DEFAULT 'HALO, AKU',
  display_name TEXT NOT NULL DEFAULT 'TAMA',
  role_prefix TEXT NOT NULL DEFAULT 'JUNIOR FULL STACK',
  role_highlight TEXT NOT NULL DEFAULT 'DEVELOPER',
  subtitle TEXT NOT NULL DEFAULT 'Mahasiswa Teknik Informasi UMY yang passionate di bidang web development dan networking.',
  image TEXT NOT NULL DEFAULT '',
  cta_projects_label TEXT NOT NULL DEFAULT 'View Projects',
  cta_contact_label TEXT NOT NULL DEFAULT 'Contact Me',
  cta_yowman_label TEXT NOT NULL DEFAULT 'YOWMAN',
  cta_yowman_link TEXT NOT NULL DEFAULT 'https://aspriguatuh.my.id',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT hero_single_row CHECK (id = 1)
);

-- 2. ABOUT (Singleton - hanya 1 row)
CREATE TABLE IF NOT EXISTS about (
  id INT PRIMARY KEY DEFAULT 1,
  content TEXT NOT NULL DEFAULT '',
  stat_1_number TEXT NOT NULL DEFAULT '5+',
  stat_1_label TEXT NOT NULL DEFAULT 'Projects Done',
  stat_2_number TEXT NOT NULL DEFAULT '3.58',
  stat_2_label TEXT NOT NULL DEFAULT 'GPA (Sem 5)',
  stat_3_number TEXT NOT NULL DEFAULT '2',
  stat_3_label TEXT NOT NULL DEFAULT 'Certificates',
  image TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT about_single_row CHECK (id = 1)
);

-- 3. SKILLS (Collection - multi rows)
CREATE TABLE IF NOT EXISTS skills (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECT TAGS (Master tags)
CREATE TABLE IF NOT EXISTS project_tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROJECTS (Collection - multi rows)
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '#',
  github TEXT NOT NULL DEFAULT '#',
  category TEXT NOT NULL DEFAULT 'live' CHECK (category IN ('live', 'localhost')),
  tags JSONB NOT NULL DEFAULT '[]'::jsonB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXPERIENCE (Collection - multi rows)
CREATE TABLE IF NOT EXISTS experience (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SITE SETTINGS (Singleton - hanya 1 row)
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_title TEXT NOT NULL DEFAULT 'Fannandya Sutan',
  favicon_url TEXT NOT NULL DEFAULT '',
  navbar_brand TEXT NOT NULL DEFAULT 'WEBLOG',
  footer_name TEXT NOT NULL DEFAULT 'FANNANDYA.',
  social_links JSONB NOT NULL DEFAULT '[]'::jsonB,
  contact_title TEXT NOT NULL DEFAULT 'GET IN TOUCH',
  contact_desc TEXT NOT NULL DEFAULT '',
  contact_image TEXT NOT NULL DEFAULT '',
  report_whatsapp_number TEXT NOT NULL DEFAULT '6285190847766',
  report_whatsapp_message TEXT NOT NULL DEFAULT 'halo admin saya ingin melaporkan bug yang terdapat di website mamay.my.id berupa: ',
  chat_ticker_text TEXT NOT NULL DEFAULT 'Ada pertanyaan tentang aku? Hubungi langsung via email atau WhatsApp!',
  ai_system_prompt TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

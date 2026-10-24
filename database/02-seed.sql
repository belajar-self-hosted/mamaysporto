-- =============================================
-- Seed Initial Data for mamaysporto
-- =============================================

-- 1. Default Admin Account (Email: admin@mamay.my.id, Password: admin123)
INSERT INTO admins (id, email, password_hash)
VALUES (1, 'admin@mamay.my.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (email) DO NOTHING;

-- 2. Hero Singleton
INSERT INTO hero (id, greeting, display_name, role_prefix, role_highlight, subtitle, cta_projects_label, cta_contact_label, cta_yowman_label, cta_yowman_link)
VALUES (
  1,
  'HALO, AKU',
  'TAMA',
  'JUNIOR FULL STACK',
  'DEVELOPER',
  'Mahasiswa Teknik Informasi UMY yang passionate di bidang web development dan networking.',
  'View Projects',
  'Contact Me',
  'YOWMAN',
  'https://aspriguatuh.my.id'
)
ON CONFLICT (id) DO NOTHING;

-- 3. About Singleton
INSERT INTO about (id, content, stat_1_number, stat_1_label, stat_2_number, stat_2_label, stat_3_number, stat_3_label)
VALUES (
  1,
  '<p>Aku adalah <strong>Tama</strong>, mahasiswa Teknik Informasi di Universitas Muhammadiyah Yogyakarta semester 5. Aku passionate di bidang <strong>web development</strong> dan <strong>computer networking</strong>.</p><p>Aku suka explore hal baru di bidang teknologi dan sedang mendalami arsitektur server serta homelab.</p>',
  '5+',
  'Projects Done',
  '3.58',
  'GPA (Sem 5)',
  '2',
  'Certificates'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Skills Master
INSERT INTO skills (name, icon_url) VALUES
  ('JavaScript', ''),
  ('SolidJS', ''),
  ('React.js', ''),
  ('Node.js', ''),
  ('PostgreSQL', ''),
  ('Docker', ''),
  ('Linux', ''),
  ('Computer Networking', ''),
  ('Proxmox VE', ''),
  ('Traefik', '')
ON CONFLICT DO NOTHING;

-- 5. Project Tags Master
INSERT INTO project_tags (name) VALUES
  ('Web'),
  ('SolidJS'),
  ('Vite'),
  ('Neobrutalism'),
  ('Docker'),
  ('Proxmox'),
  ('PostgreSQL'),
  ('Networking')
ON CONFLICT (name) DO NOTHING;

-- 6. Sample Projects
INSERT INTO projects (title, description, image, link, github, category, tags) VALUES
  (
    'Portfolio Website',
    'Website portofolio pribadi dengan desain Neobrutalism berarsitektur self-hosted di Proxmox VE.',
    '',
    'https://profile.mamay.my.id',
    'https://github.com/tama/mamaysporto',
    'live',
    '["SolidJS", "Vite", "Neobrutalism", "Proxmox"]'::jsonb
  ),
  (
    'Proxmox Homelab Ingress Gateway',
    'Arsitektur routing Traefik v3 dan Cloudflare Tunnel terpusat untuk homelab server.',
    '',
    'https://mamay.my.id',
    '',
    'live',
    '["Networking", "Proxmox", "Docker"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- 7. Experience
INSERT INTO experience (role, company, period, description) VALUES
  ('Asisten Dosen', 'Universitas Muhammadiyah Yogyakarta', '2024 - Sekarang', 'Membantu mengajar mata kuliah Administrasi Basis Data & Jaringan Komputer.')
ON CONFLICT DO NOTHING;

-- 8. Site Settings
INSERT INTO site_settings (
  id,
  site_title,
  navbar_brand,
  footer_name,
  social_links,
  contact_title,
  contact_desc,
  report_whatsapp_number,
  report_whatsapp_message,
  chat_ticker_text
)
VALUES (
  1,
  'Tama | Portfolio',
  'TAMA.',
  'FANNANDYA SUTAN.',
  '[{"url":"https://github.com/tama"},{"url":"https://linkedin.com/in/tama"}]'::jsonb,
  'GET IN TOUCH',
  'Punya ide proyek, kolaborasi, atau sekadar ingin menyapa? Silakan hubungi saya.',
  '6285190847766',
  'Halo Tama, saya ingin berdiskusi mengenai proyek web/networking:',
  'Hubungi saya lewat form kontak atau langsung via WhatsApp dan LinkedIn!'
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Seed Initial Data for mamaysporto
-- =============================================

-- Admin accounts are created explicitly with `node scripts/create-admin.js`.
-- Never seed a shared or known password into a deployed database.

-- Hero singleton
INSERT INTO hero (
  id, greeting, display_name, role_prefix, role_highlight, subtitle,
  cta_projects_label, cta_contact_label, cta_yowman_label, cta_yowman_link
)
VALUES (
  1,
  'HALO, SAYA',
  'FANNANDYA',
  'INFORMATICS ENGINEERING',
  'STUDENT',
  'Mahasiswa Teknologi Informasi UMY yang membangun solusi software, web, mobile, dan DevOps melalui proyek akademik, personal, serta klien.',
  'View Projects',
  'Contact Me',
  'MY MAIN WEBSITE',
  'https://mamay.my.id'
)
ON CONFLICT (id) DO NOTHING;

-- About singleton. Keep these details in the existing About editor so admins
-- can update the CV narrative, education, languages, certifications, and contact.
INSERT INTO about (
  id, content, stat_1_number, stat_1_label, stat_2_number, stat_2_label,
  stat_3_number, stat_3_label
)
VALUES (
  1,
  '<p>Nama saya <strong>Fannandya Sutan Sakti Pratama</strong>, mahasiswa S1 Teknologi Informasi di Universitas Muhammadiyah Yogyakarta. Saya berfokus pada software engineering, web development, mobile development, dan DevOps melalui proyek akademik, personal, serta klien.</p><p>Saya mengembangkan aplikasi web dan mobile, termasuk sistem Point of Sale dan manajemen inventori. Saya juga belajar infrastruktur server melalui homelab berbasis Proxmox dan Docker, serta berkolaborasi dengan rekan mahasiswa merintis <strong>Nusa Data Indonesia</strong>, startup di bidang teknologi informasi.</p><p><strong>Pendidikan</strong><br>Universitas Muhammadiyah Yogyakarta — S1 Teknologi Informasi (2024)</p><p><strong>Bahasa</strong></p><ul><li>Bahasa Indonesia — Mahir</li><li>Bahasa Inggris — Menengah</li></ul><p><strong>Sertifikasi</strong></p><ul><li>AI For Good — AI Singapore (6 Mei 2026)</li><li>T-Lab — PT Teknologi Kode Indonesia (Juni 2026)</li></ul><p><strong>Lokasi:</strong> Yogyakarta · <strong>Email:</strong> sfannandya@gmail.com</p>',
  '14',
  'Projects in CV',
  '2',
  'Certifications',
  '2',
  'Languages'
)
ON CONFLICT (id) DO NOTHING;

-- Explicit skills listed in the CV.
INSERT INTO skills (name, icon_url)
SELECT seed.name, ''
FROM (VALUES
  ('JavaScript'),
  ('HTML'),
  ('CSS'),
  ('Node.js'),
  ('MySQL'),
  ('PostgreSQL'),
  ('React.js'),
  ('Svelte'),
  ('GitHub')
) AS seed(name)
WHERE NOT EXISTS (
  SELECT 1 FROM skills existing WHERE lower(btrim(existing.name)) = lower(btrim(seed.name))
);

-- Tags describe areas and technologies explicitly named in the CV.
INSERT INTO project_tags (name) VALUES
  ('Information System'),
  ('Inventory'),
  ('Android'),
  ('Productivity'),
  ('Portfolio'),
  ('RAG'),
  ('Public Service'),
  ('UMKM'),
  ('Travel'),
  ('Umrah'),
  ('Hajj'),
  ('Education'),
  ('LMS'),
  ('API'),
  ('Express'),
  ('DevOps'),
  ('Docker'),
  ('CI/CD'),
  ('Infrastructure'),
  ('Proxmox'),
  ('POS'),
  ('React Native'),
  ('Expo'),
  ('Image Processing'),
  ('ASCII'),
  ('Security'),
  ('Reconnaissance'),
  ('Event Ticketing'),
  ('QR Code'),
  ('CV'),
  ('Privacy'),
  ('Client-side')
ON CONFLICT (name) DO NOTHING;

-- Projects are inserted in reverse CV order because the public list orders by
-- descending ID, which displays these in the same order as the source CV.
INSERT INTO projects (title, description, image, link, github, category, tags)
SELECT seed.title, seed.description, '', seed.link, '', seed.category, seed.tags::jsonb
FROM (VALUES
  (
    'Website Personal',
    'Pengembang utama. Personal portfolio website sebagai CV online untuk memperkenalkan profil, pengalaman, keterampilan, dan hasil proyek.',
    'https://profile.mamay.my.id',
    'live',
    '["Portfolio", "CV"]'
  ),
  (
    'CV Generator',
    'Pengembang utama. Web-based CV generator dengan formulir interaktif dan pemrosesan client-side agar data pribadi pengguna tidak disimpan di server.',
    'https://cv.mamay.my.id',
    'live',
    '["CV", "Privacy", "Client-side"]'
  ),
  (
    'Beli Tiket',
    'Pengembang utama. Platform event ticketing dengan manajemen acara, penjualan tiket digital, pembuatan QR Code otomatis, dan validasi tiket. Integrasi payment gateway masih direncanakan.',
    'https://belitiket.sequein.my.id',
    'live',
    '["Event Ticketing", "QR Code"]'
  ),
  (
    'OSC',
    'Pengembang utama. Tool untuk initial reconnaissance dan identifikasi awal potensi kerentanan keamanan website sebagai bagian dari web vulnerability assessment.',
    'https://osc.mamay.my.id',
    'live',
    '["Security", "Reconnaissance"]'
  ),
  (
    'ASCII Converter',
    'Pengembang utama. Image-to-ASCII converter yang memetakan intensitas piksel menjadi karakter untuk menghasilkan representasi gambar berbasis ASCII.',
    'https://ascii.mamay.my.id',
    'live',
    '["Image Processing", "ASCII"]'
  ),
  (
    'mayPos',
    'Pengembang utama. Aplikasi Point of Sale offline untuk katalog produk, kontrol stok otomatis, dan perhitungan transaksi kasir menggunakan React Native dan Expo.',
    '',
    'localhost',
    '["POS", "React Native", "Expo"]'
  ),
  (
    'Home Server',
    'Pengembang utama. Homelab untuk belajar DevOps, Docker, CI/CD, infrastruktur, dan hosting website pribadi.',
    '',
    'localhost',
    '["DevOps", "Docker", "CI/CD", "Infrastructure", "Proxmox"]'
  ),
  (
    'KRL API',
    'Pengembang utama. Proyek akhir mata kuliah Pengembangan Web Service yang mempraktikkan konsumsi dan pembuatan API menggunakan Express.',
    'https://api-krl-ten.vercel.app',
    'live',
    '["API", "Express"]'
  ),
  (
    'LMS Teknik Sipil UMY',
    'Pengembang utama. Learning Management System untuk mahasiswa Program Studi Teknik Sipil UMY, dibuat sebagai tugas dosen.',
    'https://civil-labs.vercel.app',
    'live',
    '["Education", "LMS"]'
  ),
  (
    'Portal Kemitraan Retali Travel',
    'Pengembang utama. Portal informasi paket perjalanan ibadah umrah dan haji untuk PT Retali Mustajab Travel.',
    'https://retalikabupatenbekasi.my.id',
    'live',
    '["Travel", "Umrah", "Hajj"]'
  ),
  (
    'Sistem Informasi Desa',
    'Pengembang utama. Portal layanan monitoring dan administrasi publik desa, termasuk direktori UMKM dan statistik demografi.',
    '',
    'localhost',
    '["Information System", "Public Service", "UMKM"]'
  ),
  (
    'Website Portofolio & Asisten RAG',
    'Pengembang utama. Website portofolio pribadi yang terintegrasi dengan asisten berbasis Retrieval-Augmented Generation (RAG).',
    'https://mamay.my.id',
    'live',
    '["Portfolio", "RAG"]'
  ),
  (
    'CampusTask',
    'Pengembang utama. Aplikasi Android native untuk manajemen tugas dan produktivitas perkuliahan.',
    '',
    'localhost',
    '["Android", "Productivity"]'
  ),
  (
    'Sarpras Apps',
    'Pengembang utama. Sistem informasi manajemen dan inventarisasi sarana serta prasarana penunjang akademik Program Studi Teknologi Informasi UMY.',
    '',
    'localhost',
    '["Information System", "Inventory"]'
  )
) AS seed(title, description, link, category, tags)
WHERE NOT EXISTS (
  SELECT 1 FROM projects existing WHERE lower(btrim(existing.title)) = lower(btrim(seed.title))
)
ORDER BY array_position(ARRAY[
  'Sarpras Apps',
  'CampusTask',
  'Website Portofolio & Asisten RAG',
  'Sistem Informasi Desa',
  'Portal Kemitraan Retali Travel',
  'LMS Teknik Sipil UMY',
  'KRL API',
  'Home Server',
  'mayPos',
  'ASCII Converter',
  'OSC',
  'Beli Tiket',
  'CV Generator',
  'Website Personal'
]::text[], seed.title) DESC;

-- Experience
INSERT INTO experience (role, company, period, description)
SELECT
  'Asisten Dosen',
  'Universitas Muhammadiyah Yogyakarta',
  'Februari 2026 – Sekarang',
  'Mendampingi pembelajaran Administrasi Basis Data pada sesi teori dan praktikum, serta membantu mahasiswa memahami materi dan menyelesaikan tugas praktik. Lokasi: Bantul, Yogyakarta.'
WHERE NOT EXISTS (
  SELECT 1 FROM experience existing
  WHERE existing.role = 'Asisten Dosen'
    AND existing.company = 'Universitas Muhammadiyah Yogyakarta'
);

-- Site settings singleton
INSERT INTO site_settings (
  id, site_title, navbar_brand, footer_name, social_links, contact_title,
  contact_desc, report_whatsapp_number, report_whatsapp_message, chat_ticker_text
)
VALUES (
  1,
  'Fannandya Sutan Sakti Pratama | Portfolio',
  'FANNANDYA.',
  'FANNANDYA SUTAN SAKTI.',
  '[]'::jsonb,
  'GET IN TOUCH',
  'Punya pertanyaan atau ide kolaborasi tentang software, web, mobile, atau DevOps? Silakan hubungi saya melalui WhatsApp.',
  '6285190847766',
  'Halo Fannandya, saya ingin berdiskusi mengenai proyek atau kolaborasi:',
  'Saya terbuka untuk kolaborasi seputar software, web, mobile, dan DevOps.'
)
ON CONFLICT (id) DO NOTHING;

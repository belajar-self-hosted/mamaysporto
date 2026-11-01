-- Apply the CV portfolio seed once to existing databases.
-- The migration runner records this file, and each statement below only
-- changes known initial values or inserts missing CV entries. Admin-edited
-- content that no longer matches the original seed is retained.

UPDATE hero
SET
  greeting = CASE WHEN greeting = 'HALO, AKU' THEN 'HALO, SAYA' ELSE greeting END,
  display_name = CASE WHEN display_name = 'TAMA' THEN 'FANNANDYA' ELSE display_name END,
  role_prefix = CASE WHEN role_prefix = 'JUNIOR FULL STACK' THEN 'INFORMATICS ENGINEERING' ELSE role_prefix END,
  role_highlight = CASE WHEN role_highlight = 'DEVELOPER' THEN 'STUDENT' ELSE role_highlight END,
  subtitle = CASE
    WHEN subtitle = 'Mahasiswa Teknik Informasi UMY yang passionate di bidang web development dan networking.'
    THEN 'Mahasiswa Teknologi Informasi UMY yang membangun solusi software, web, mobile, dan DevOps melalui proyek akademik, personal, serta klien.'
    ELSE subtitle
  END,
  cta_yowman_label = CASE WHEN cta_yowman_label = 'YOWMAN' THEN 'MY MAIN WEBSITE' ELSE cta_yowman_label END,
  cta_yowman_link = CASE WHEN cta_yowman_link = 'https://aspriguatuh.my.id' THEN 'https://mamay.my.id' ELSE cta_yowman_link END,
  updated_at = NOW()
WHERE id = 1
  AND (
    greeting = 'HALO, AKU'
    OR display_name = 'TAMA'
    OR role_prefix = 'JUNIOR FULL STACK'
    OR role_highlight = 'DEVELOPER'
    OR subtitle = 'Mahasiswa Teknik Informasi UMY yang passionate di bidang web development dan networking.'
    OR cta_yowman_label = 'YOWMAN'
    OR cta_yowman_link = 'https://aspriguatuh.my.id'
  );

UPDATE about
SET
  content = CASE
    WHEN content = '<p>Aku adalah <strong>Tama</strong>, mahasiswa Teknik Informasi di Universitas Muhammadiyah Yogyakarta semester 5. Aku passionate di bidang <strong>web development</strong> dan <strong>computer networking</strong>.</p><p>Aku suka explore hal baru di bidang teknologi dan sedang mendalami arsitektur server serta homelab.</p>'
    THEN '<p>Nama saya <strong>Fannandya Sutan Sakti Pratama</strong>, mahasiswa S1 Teknologi Informasi di Universitas Muhammadiyah Yogyakarta. Saya berfokus pada software engineering, web development, mobile development, dan DevOps melalui proyek akademik, personal, serta klien.</p><p>Saya mengembangkan aplikasi web dan mobile, termasuk sistem Point of Sale dan manajemen inventori. Saya juga belajar infrastruktur server melalui homelab berbasis Proxmox dan Docker, serta berkolaborasi dengan rekan mahasiswa merintis <strong>Nusa Data Indonesia</strong>, startup di bidang teknologi informasi.</p><p><strong>Pendidikan</strong><br>Universitas Muhammadiyah Yogyakarta — S1 Teknologi Informasi (2024)</p><p><strong>Bahasa</strong></p><ul><li>Bahasa Indonesia — Mahir</li><li>Bahasa Inggris — Menengah</li></ul><p><strong>Sertifikasi</strong></p><ul><li>AI For Good — AI Singapore (6 Mei 2026)</li><li>T-Lab — PT Teknologi Kode Indonesia (Juni 2026)</li></ul><p><strong>Lokasi:</strong> Yogyakarta · <strong>Email:</strong> sfannandya@gmail.com</p>'
    ELSE content
  END,
  stat_1_number = CASE
    WHEN stat_1_number = '5+' AND stat_1_label = 'Projects Done' THEN '14'
    ELSE stat_1_number
  END,
  stat_1_label = CASE
    WHEN stat_1_number = '5+' AND stat_1_label = 'Projects Done' THEN 'Projects in CV'
    ELSE stat_1_label
  END,
  stat_2_number = CASE
    WHEN stat_2_number = '3.58' AND stat_2_label = 'GPA (Sem 5)' THEN '2'
    ELSE stat_2_number
  END,
  stat_2_label = CASE
    WHEN stat_2_number = '3.58' AND stat_2_label = 'GPA (Sem 5)' THEN 'Certifications'
    ELSE stat_2_label
  END,
  stat_3_label = CASE
    WHEN stat_3_number = '2' AND stat_3_label = 'Certificates' THEN 'Languages'
    ELSE stat_3_label
  END,
  updated_at = NOW()
WHERE id = 1
  AND (
    content = '<p>Aku adalah <strong>Tama</strong>, mahasiswa Teknik Informasi di Universitas Muhammadiyah Yogyakarta semester 5. Aku passionate di bidang <strong>web development</strong> dan <strong>computer networking</strong>.</p><p>Aku suka explore hal baru di bidang teknologi dan sedang mendalami arsitektur server serta homelab.</p>'
    OR (stat_1_number = '5+' AND stat_1_label = 'Projects Done')
    OR (stat_2_number = '3.58' AND stat_2_label = 'GPA (Sem 5)')
    OR (stat_3_number = '2' AND stat_3_label = 'Certificates')
  );

UPDATE site_settings
SET
  site_title = CASE WHEN site_title = 'Tama | Portfolio' THEN 'Fannandya Sutan Sakti Pratama | Portfolio' ELSE site_title END,
  navbar_brand = CASE WHEN navbar_brand = 'TAMA.' THEN 'FANNANDYA.' ELSE navbar_brand END,
  footer_name = CASE WHEN footer_name = 'FANNANDYA SUTAN.' THEN 'FANNANDYA SUTAN SAKTI.' ELSE footer_name END,
  social_links = CASE
    WHEN social_links = '[{"url":"https://github.com/tama"},{"url":"https://linkedin.com/in/tama"}]'::jsonb
    THEN '[]'::jsonb
    ELSE social_links
  END,
  contact_desc = CASE
    WHEN contact_desc = 'Punya ide proyek, kolaborasi, atau sekadar ingin menyapa? Silakan hubungi saya.'
    THEN 'Punya pertanyaan atau ide kolaborasi tentang software, web, mobile, atau DevOps? Silakan hubungi saya melalui WhatsApp.'
    ELSE contact_desc
  END,
  report_whatsapp_message = CASE
    WHEN report_whatsapp_message = 'Halo Tama, saya ingin berdiskusi mengenai proyek web/networking:'
    THEN 'Halo Fannandya, saya ingin berdiskusi mengenai proyek atau kolaborasi:'
    ELSE report_whatsapp_message
  END,
  chat_ticker_text = CASE
    WHEN chat_ticker_text = 'Hubungi saya lewat form kontak atau langsung via WhatsApp dan LinkedIn!'
    THEN 'Saya terbuka untuk kolaborasi seputar software, web, mobile, dan DevOps.'
    ELSE chat_ticker_text
  END,
  updated_at = NOW()
WHERE id = 1
  AND (
    site_title = 'Tama | Portfolio'
    OR navbar_brand = 'TAMA.'
    OR footer_name = 'FANNANDYA SUTAN.'
    OR social_links = '[{"url":"https://github.com/tama"},{"url":"https://linkedin.com/in/tama"}]'::jsonb
    OR contact_desc = 'Punya ide proyek, kolaborasi, atau sekadar ingin menyapa? Silakan hubungi saya.'
    OR report_whatsapp_message = 'Halo Tama, saya ingin berdiskusi mengenai proyek web/networking:'
    OR chat_ticker_text = 'Hubungi saya lewat form kontak atau langsung via WhatsApp dan LinkedIn!'
  );

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

-- Remove only the two untouched legacy project seed rows. If an admin set an
-- image or changed their content, retain that row and let the CV project be
-- added as a separate item below.
DELETE FROM projects
WHERE image = ''
  AND (
    (
      title = 'Portfolio Website'
      AND description = 'Website portofolio pribadi dengan desain Neobrutalism berarsitektur self-hosted di Proxmox VE.'
      AND link = 'https://profile.mamay.my.id'
      AND github = 'https://github.com/tama/mamaysporto'
      AND category = 'live'
      AND tags = '["SolidJS", "Vite", "Neobrutalism", "Proxmox"]'::jsonb
    )
    OR (
      title = 'Proxmox Homelab Ingress Gateway'
      AND description = 'Arsitektur routing Traefik v3 dan Cloudflare Tunnel terpusat untuk homelab server.'
      AND link = 'https://mamay.my.id'
      AND github = ''
      AND category = 'live'
      AND tags = '["Networking", "Proxmox", "Docker"]'::jsonb
    )
  );

-- Insert in reverse CV order because public projects are sorted by descending ID.
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

UPDATE experience
SET
  period = 'Februari 2026 – Sekarang',
  description = 'Mendampingi pembelajaran Administrasi Basis Data pada sesi teori dan praktikum, serta membantu mahasiswa memahami materi dan menyelesaikan tugas praktik. Lokasi: Bantul, Yogyakarta.'
WHERE role = 'Asisten Dosen'
  AND company = 'Universitas Muhammadiyah Yogyakarta'
  AND period = '2024 - Sekarang'
  AND description = 'Membantu mengajar mata kuliah Administrasi Basis Data & Jaringan Komputer.';

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

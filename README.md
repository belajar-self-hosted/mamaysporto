# SolidJS Neobrutalism Portfolio

Sebuah project portofolio interaktif dan modern yang dibangun dengan **SolidJS** dan desain **Neobrutalism**. Dilengkapi dengan AI Chat Assistant yang didukung oleh Google Gemini via OpenRouter, serta CMS berbasis Supabase untuk manajemen konten yang dinamis.

## Teknologi yang Digunakan

### Frontend
- **Framework:** [SolidJS](https://www.solidjs.com/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Desain Sistem:** Neobrutalism (Custom CSS)

### Backend (Serverless)
- **Runtime:** [Vercel Serverless Functions](https://vercel.com/docs/functions)
- **AI:** [OpenRouter](https://openrouter.ai/) (Google Gemini 2.5 Flash Lite) via [Vercel AI SDK](https://sdk.vercel.ai)

### Database / CMS
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL) — menyimpan data portfolio (hero, about, skills, projects, experience)

---

## Cara Menjalankan Project (Lokal)

1. **Clone repository:**
   ```bash
   git clone <URL_REPO_ANDA>
   cd mamaysporto
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Buat file `.env` dari `.env.example`:**
   ```bash
   cp .env.example .env
   ```
   Isi variabel-variabel di dalamnya (lihat bagian Environment Variables).

4. **Jalankan server development:**
   ```bash
   npm run dev
   ```
   Aplikasi berjalan di `http://localhost:3333`.

---

## Deploy ke Vercel

1. **Push repository ke GitHub/GitLab/Bitbucket.**
2. **Import project di [Vercel Dashboard](https://vercel.com/dashboard).**
3. **Set Environment Variables di Vercel:**
   - `OPENROUTER_API_KEY` — API key dari OpenRouter
   - `VITE_SUPABASE_URL` — URL project Supabase
   - `VITE_SUPABASE_ANON_KEY` — Anon key Supabase
4. **Deploy.** Vercel akan otomatis build dan deploy setiap push ke branch utama.

---

## Environment Variables

| Variable | Keterangan | Lokasi |
|---|---|---|
| `OPENROUTER_API_KEY` | API key untuk AI Chat (server-side only) | Vercel Dashboard |
| `VITE_SUPABASE_URL` | URL project Supabase | Vercel Dashboard |
| `VITE_SUPABASE_ANON_KEY` | Anon key Supabase | Vercel Dashboard |

---

## Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com).
2. Jalankan SQL script di `supabase/schema.sql` melalui **Supabase Dashboard > SQL Editor**.
3. Jalankan `supabase/cms_admin_setup.sql` (setelah schema.sql) untuk menambahkan kolom Hero/CTA tambahan, tabel `site_settings`, policy tulis khusus admin, dan storage bucket `project-images`.
3b. Jalankan `supabase/hero_image_upload.sql` (setelah cms_admin_setup.sql) untuk menambahkan kolom `image` di Hero dan storage bucket `site-images` (foto profil Hero yang bisa diupload lewat admin panel).
3c. Jalankan `supabase/site_meta_title_favicon.sql` (setelah hero_image_upload.sql) untuk menambahkan kolom `site_title` dan `favicon_url` di `site_settings` (judul tab browser & favicon).
3d. Jalankan `supabase/social_links_dynamic.sql` (setelah site_meta_title_favicon.sql) untuk mengganti field social link tetap dengan kolom `social_links` (jsonb, list dinamis).
4. Buat 1 akun admin lewat **Supabase Dashboard > Authentication > Users > Add User** (email + password). Akun ini dipakai untuk login ke CMS. Jangan aktifkan public sign-up.
5. Isi/edit data portfolio (hero, about, skills, projects, experience, site settings, AI prompt) lewat **CMS Admin Panel** di aplikasi (lihat di bawah), bukan lewat Table Editor.

---

## CMS Admin Panel

Semua konten website (Hero, About, Skills, Projects, Experience, Navbar/Footer, Contact, hingga system prompt AI chat "Yowman") dikelola lewat halaman admin bawaan, tanpa perlu redeploy.

- **URL:** `/#/admin` (mis. `http://localhost:3333/#/admin` atau `https://domain-kamu.com/#/admin`)
- **Login:** gunakan akun yang dibuat di langkah Setup Supabase #4 (Supabase Auth, email + password).
- **Fitur per tab:**
  - **Hero** — foto profil (upload ke Supabase Storage, maks 1 MB, tampil dengan rasio asli gambar), sapaan, nama, judul role, subtitle, label & link tombol CTA
  - **About** — konten (boleh HTML sederhana seperti `<strong>`) + 3 statistik
  - **Skills** — tambah/edit/hapus skill
  - **Projects** — tambah/edit/hapus project, upload gambar langsung ke Supabase Storage (maks 1 MB) atau paste URL, kelola tags/link
  - **Experience** — tambah/edit/hapus riwayat pengalaman
  - **Site Settings** — judul tab browser & favicon, brand navbar & nama footer, **social media links (bebas tambah/hapus, ikon otomatis menyesuaikan platform dari URL yang dimasukkan — GitHub, LinkedIn, Instagram, X/Twitter, Facebook, YouTube, TikTok, WhatsApp, Telegram, Email, dll)**, judul/deskripsi Contact, link WhatsApp "Report", serta system prompt AI chatbot Yowman
- Perubahan tersimpan langsung ke Supabase dan otomatis tampil di halaman publik setelah reload (tanpa perlu deploy ulang).

---

## Struktur Folder

- `/src/` — Source code SolidJS
  - `/src/sections/` — Komponen halaman publik (Hero, About, Skills, Projects, Experience, Contact)
  - `/src/admin/` — CMS Admin Panel (`/#/admin`): login, layout, dan panel per section
  - `/src/lib/` — Helper functions (API read/write, Supabase client, auth)
- `/api/` — Vercel Serverless Functions (AI Chat endpoint)
- `/supabase/` — SQL schema & migration untuk Supabase
- `/public/` — Static assets

---

*Dibangun dengan SolidJS + Vercel + Supabase.*

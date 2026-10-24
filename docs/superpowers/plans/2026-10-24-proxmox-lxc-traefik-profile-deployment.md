# Proxmox LXC 10018 Deployment & Traefik Ingress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyiapkan konfigurasi deployment production lengkap untuk `mamaysporto` di Proxmox LXC 10018 (IP `192.168.0.18`) dengan Traefik v3 di LXC 10080 (`profile.mamay.my.id`), menggantikan Supabase/OpenRouter dengan PostgreSQL lokal + Node.js backend terpadu, CI/CD self-hosted runner, dan menyinkronkan [opt/HOMELAB-SSOT.md](file:///Users/macbookpro/tama/projek/mamaysporto/opt/HOMELAB-SSOT.md).

**Architecture:** Single multi-stage container Node.js melayani bundle build SolidJS (`dist/`) dan REST API lokal terhubung ke container PostgreSQL 16 pada Docker network internal di LXC 10018. Ingress publik dilayani oleh Traefik v3 di LXC 10080 via Dynamic File Provider (`/opt/ingress/dynamic/profile-mamay.yml`) dan Cloudflare Tunnel (`profile.mamay.my.id` -> `traefik:80`). CI/CD dijalankan langsung oleh GitHub Actions Self-Hosted Runner di LXC 10018.

**Tech Stack:** SolidJS, Vite, Node.js (Fastify/Express), PostgreSQL 16, Docker & Docker Compose, Traefik v3.1, Cloudflare Tunnel, GitHub Actions Runner.

**Spec:** [docs/superpowers/specs/2026-10-24-proxmox-lxc-traefik-profile-deployment-design.md](file:///Users/macbookpro/tama/projek/mamaysporto/docs/superpowers/specs/2026-10-24-proxmox-lxc-traefik-profile-deployment-design.md)

## Global Constraints
- Target LXC App: ID `10018`, IP `192.168.0.18`, Port `3000`.
- Target Gateway Ingress: LXC `10080`, IP `192.168.0.80`, Entrypoint `web` (:80).
- Domain & Hostname: `profile.mamay.my.id`.
- Zero External Secrets: Hapus dependensi OpenRouter dan Supabase cloud; semua database dan storage berjalan lokal di LXC 10018.
- SSOT Compliance: Semua pembaruan harus dicatat di [opt/HOMELAB-SSOT.md](file:///Users/macbookpro/tama/projek/mamaysporto/opt/HOMELAB-SSOT.md).

---

### Task 1: Traefik Dynamic Ingress Configuration
**Files:**
- Create: `opt/ingress/dynamic/profile-mamay.yml`
- Create: `scripts/sync-ingress-gateway.sh`

**Interfaces:**
- Consumes: Hostname `profile.mamay.my.id`, Target backend `http://192.168.0.18:3000`.
- Produces: Traefik dynamic router & service YAML valid untuk dipantau oleh Traefik File Provider di LXC 10080.

- [ ] **Step 1: Buat file Traefik dynamic configuration**
Buat `opt/ingress/dynamic/profile-mamay.yml` dengan konfigurasi router dan service Traefik v3.
- [ ] **Step 2: Buat helper script sinkronisasi ke LXC 10080**
Buat `scripts/sync-ingress-gateway.sh` yang mendokumentasikan cara menyalin file dynamic konfigurasi ini ke `/opt/ingress/dynamic/` di LXC 10080.
- [ ] **Step 3: Verifikasi sintaks YAML**
Jalankan verifikasi YAML sintaks menggunakan node atau yaml parser untuk memastikan tidak ada kesalahan indentasi.
- [ ] **Step 4: Commit**
`git add opt/ingress/dynamic/profile-mamay.yml scripts/sync-ingress-gateway.sh && git commit -m "feat(ingress): add Traefik dynamic route for profile.mamay.my.id"`

---

### Task 2: Database Schema & Seed Setup untuk Local PostgreSQL
**Files:**
- Create: `database/init.sql`
- Create: `database/seed.sql`

**Interfaces:**
- Consumes: Kebutuhan data CMS (`hero`, `about`, `skills`, `projects`, `experience`, `site_settings`, `project_tags`, `admins`).
- Produces: Skema DDL SQL idempotent yang otomatis dieksekusi oleh `/docker-entrypoint-initdb.d/` pada PostgreSQL container.

- [ ] **Step 1: Tulis skema DDL di `database/init.sql`**
Definisikan tabel `admins`, `hero`, `about`, `skills`, `project_tags`, `projects`, `experience`, `site_settings` lengkap dengan index, constraint, dan trigger `updated_at`.
- [ ] **Step 2: Tulis data inisial di `database/seed.sql`**
Isi data awal default untuk profil, settings, skill dasar, dan default admin password hash (bcrypt) agar CMS siap digunakan.
- [ ] **Step 3: Uji validasi SQL sintaks**
Periksa sintaks SQL terhadap standar PostgreSQL 16.
- [ ] **Step 4: Commit**
`git add database/init.sql database/seed.sql && git commit -m "feat(db): add PostgreSQL schema and initial seed data"`

---

### Task 3: Node.js Backend Server & REST API
**Files:**
- Create: `server/index.js`
- Create: `server/db.js`
- Create: `server/auth.js`
- Create: `server/routes/data.js`
- Create: `server/routes/upload.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: PostgreSQL connection string (`DATABASE_URL`), `JWT_SECRET`, port `PORT=3000`.
- Produces: REST API endpoints:
  - `GET /api/health`
  - `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
  - `GET /api/data/:collection`, `POST /api/data/:collection`, `PUT /api/data/:collection/:id`, `DELETE /api/data/:collection/:id`
  - `POST /api/upload`
  - Static file server: `/uploads/*` dan SPA static handler (`dist/*` -> `index.html`).

- [ ] **Step 1: Tambahkan dependensi server di `package.json`**
Tambahkan `pg`, `bcryptjs`, `jsonwebtoken` (atau paket lightweight serupa) yang diperlukan server.
- [ ] **Step 2: Implementasikan modul koneksi DB `server/db.js`**
Gunakan `pg.Pool` dengan connection pooling terisolasi dan helper query.
- [ ] **Step 3: Implementasikan autentikasi JWT di `server/auth.js`**
Helper hashing bcrypt dan verifikasi token admin.
- [ ] **Step 4: Implementasikan REST routes data dan upload**
Di `server/routes/data.js` dan `server/routes/upload.js`.
- [ ] **Step 5: Implementasikan file server utama `server/index.js`**
Sajikan static SPA `dist/`, media `/uploads/`, dan router API.
- [ ] **Step 6: Uji server & healthcheck endpoint**
Jalankan node test script untuk memverifikasi endpoint `GET /api/health` merespons 200 OK.
- [ ] **Step 7: Commit**
`git add server/ package.json package-lock.json && git commit -m "feat(server): implement local Node.js backend REST API and static server"`

---

### Task 4: Client Refactoring (Migrasi dari Supabase ke Local API)
**Files:**
- Modify: `src/lib/api.js`
- Modify: `src/lib/auth.js`
- Delete: `api/chat.js`, `api/prompt.js`, `dev-server.js` (unneeded AI & dev server)
- Modify: `package.json` (hapus `@supabase/supabase-js`, `@openrouter/ai-sdk-provider`, `ai`, `@ai-sdk/solid`)

**Interfaces:**
- Consumes: REST API di `/api/data/*`, `/api/auth/*`, `/api/upload`.
- Produces: Frontend SolidJS yang bersih dari third-party cloud SDK.

- [ ] **Step 1: Refactor `src/lib/api.js`**
Ganti implementasi `fetchCollection`, `updateSingleton`, `insertRow`, `updateRow`, `deleteRow`, dan upload file menggunakan standard `fetch()` ke `/api/data/*` dan `/api/upload`.
- [ ] **Step 2: Refactor `src/lib/auth.js`**
Ganti fungsi `signInWithPassword`, `signOut`, `getSession` menggunakan `fetch("/api/auth/*")` dan token di `localStorage` / cookie.
- [ ] **Step 3: Bersihkan folder `api/` (AI OpenRouter yang sudah nonaktif)**
Hapus `api/chat.js` dan file prompt AI yang tidak lagi digunakan.
- [ ] **Step 4: Hapus dependensi tidak terpakai dari `package.json`**
Hapus `@supabase/supabase-js`, `@openrouter/ai-sdk-provider`, `ai`, `@ai-sdk/solid`. Jalankan `npm install`.
- [ ] **Step 5: Verifikasi build frontend**
Jalankan `npm run build` dan pastikan build Vite berhasil tanpa error.
- [ ] **Step 6: Commit**
`git add src/lib/api.js src/lib/auth.js api/ package.json package-lock.json && git commit -m "refactor(client): replace Supabase and OpenRouter with local REST client"`

---

### Task 5: Containerization (Dockerfile & Docker Compose)
**Files:**
- Create: `Dockerfile`
- Create: `compose.yaml`
- Create: `.env.example`
- Modify: `.dockerignore`

**Interfaces:**
- Consumes: Frontend build (`dist/`), `server/index.js`, `database/init.sql`.
- Produces: Container `app` dan `postgres` yang dapat dijalankan dengan `docker compose up -d`.

- [ ] **Step 1: Buat `.dockerignore`**
Abaikan `node_modules`, `.git`, `dist`, `.env`.
- [ ] **Step 2: Buat multi-stage `Dockerfile`**
Stage 1: build Vite frontend.
Stage 2: runtime Node.js Alpine menyajikan static assets dan API.
- [ ] **Step 3: Buat `compose.yaml`**
Konfigurasi service `postgres` (volume `postgres_data`, internal network) dan `app` (volume `uploads_data`, port `3000:3000`).
- [ ] **Step 4: Buat `.env.example`**
Definisikan variabel `PORT=3000`, `DATABASE_URL=postgres://...`, `JWT_SECRET=...`.
- [ ] **Step 5: Validasi syntax compose**
Jalankan `docker compose config` (jika docker tersedia) atau verifikasi integritas konfigurasi YAML.
- [ ] **Step 6: Commit**
`git add Dockerfile compose.yaml .env.example .dockerignore && git commit -m "feat(docker): add multi-stage Dockerfile and compose.yaml"`

---

### Task 6: GitHub Actions Self-Hosted Runner Workflow
**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `docs/LXC-10018-SETUP.md`

**Interfaces:**
- Consumes: Trigger push ke branch `main`.
- Produces: Automasi build dan deployment lokal di LXC 10018 via self-hosted runner.

- [ ] **Step 1: Buat file workflow `.github/workflows/deploy.yml`**
Konfigurasi job `deploy` pada `runs-on: self-hosted`, mengeksekusi `docker compose up -d --build` dan memvalidasi `curl http://localhost:3000/api/health`.
- [ ] **Step 2: Buat panduan setup LXC 10018 di `docs/LXC-10018-SETUP.md`**
Tuliskan panduan step-by-step:
  - Instalasi Docker & Compose di LXC 10018 (Debian/Ubuntu).
  - Pendaftaran GitHub Actions Self-Hosted Runner ke repository ini.
  - Penyiapan direktori kerja dan file `.env`.
- [ ] **Step 3: Commit**
`git add .github/workflows/deploy.yml docs/LXC-10018-SETUP.md && git commit -m "ci: add self-hosted runner deploy workflow and LXC setup guide"`

---

### Task 7: Sinkronisasi dan Pembaruan [opt/HOMELAB-SSOT.md](file:///Users/macbookpro/tama/projek/mamaysporto/opt/HOMELAB-SSOT.md)
**Files:**
- Modify: `opt/HOMELAB-SSOT.md`

**Interfaces:**
- Consumes: Keputusan arsitektur LXC 10018, IP 192.168.0.18, domain profile.mamay.my.id, runner lokal.
- Produces: Dokumen SSOT yang akurat dan terverifikasi.

- [ ] **Step 1: Perbarui Tabel 2.1 & Status Informasi**
Catat LXC 10018 sebagai container aplikasi produksi dengan IP `192.168.0.18` dan domain `profile.mamay.my.id`.
- [ ] **Step 2: Perbarui Bagian 5.2 (Traefik File Provider)**
Tambahkan referensi file dinamis `/opt/ingress/dynamic/profile-mamay.yml`.
- [ ] **Step 3: Perbarui Bagian 6 (CI/CD Runner)**
Dokumentasikan pengecualian/model runner lokal untuk `mamaysporto` di LXC 10018.
- [ ] **Step 4: Perbarui Bagian 12.1 (Tabel Inventaris Layanan)**
Catat entri aktif untuk `mamaysporto` (`10018`, `192.168.0.18`, `profile.mamay.my.id`, port 3000).
- [ ] **Step 5: Commit**
`git add opt/HOMELAB-SSOT.md && git commit -m "docs(ssot): update HOMELAB-SSOT with LXC 10018 and Traefik profile route"`

---

### Task 8: Verifikasi Akhir
- [ ] **Step 1: Jalankan `npm run build`** untuk memastikan frontend lolos kompilasi tanpa modul eksternal.
- [ ] **Step 2: Jalankan linting / sanity test** pada kode server dan client.
- [ ] **Step 3: Pastikan seluruh file konfigurasi konsisten** antara SSOT, Docker Compose, Traefik dynamic YAML, dan workflow.

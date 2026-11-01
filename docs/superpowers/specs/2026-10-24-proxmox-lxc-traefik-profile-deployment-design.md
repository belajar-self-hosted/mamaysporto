# Design Spec: Proxmox LXC 10018 Deployment & Traefik Ingress

**Date:** 2026-10-24  
**Status:** Current deployment baseline (revised 2026-11-01)
**Project:** mamaysporto (`profile.mamay.my.id`)  

---

## 1. Context & Objectives

Aplikasi portfolio `mamaysporto` saat ini berjalan sebagai SolidJS/Vite frontend dengan Express 5 dan PostgreSQL. Vercel, Supabase, dan OpenRouter merupakan konfigurasi/SQL legacy, bukan layanan yang dipakai runtime root. Arsitektur deployment yang tercatat di repository adalah Docker Compose pada homelab Proxmox VE:

1. **LXC Ingress Gateway (ID 10080, IP 192.168.0.80):**
   - Menjalankan Cloudflare Tunnel (`cloudflared`) dan Traefik v3.1.
   - Menggunakan Traefik File Provider (`/opt/ingress/dynamic/`) untuk merutekan request `profile.mamay.my.id` ke backend LXC aplikasi.
2. **LXC Aplikasi (ID 10018, IP 192.168.0.18):**
   - Berjalan pada container Proxmox terisolasi dengan IP statis `192.168.0.18`.
   - Menyediakan runtime self-hosted:
     - AI Chat tidak termasuk dalam aplikasi aktif.
     - Database internal PostgreSQL 16 (container) + backend REST API Express.
     - Media storage (foto Hero, screenshot Project) disimpan di disk lokal LXC 10018 (volume `/uploads`) dan disajikan langsung via HTTP.
   - Menjalankan GitHub Actions Self-Hosted Runner langsung di LXC 10018 untuk build & deploy lokal (`docker compose up -d --build`) tanpa registry GHCR dan tanpa SSH deployment antar-LXC.
3. **Pembaruan SSOT:**
   - Menyinkronkan status LXC 10018, IP, hostname, arsitektur CI/CD, dan dynamic Traefik ke [opt/HOMELAB-SSOT.md](file:///Users/macbookpro/tama/projek/mamaysporto/opt/HOMELAB-SSOT.md).

---

## 2. Architecture & Network Topology

```text
Pengunjung Internet
       │
       ▼
Cloudflare Edge (SSL Termination: *.mamay.my.id)
       │
       ▼ (Cloudflare Tunnel)
LXC 10080 (gateway-ingress - 192.168.0.80)
  ├── cloudflared (Docker container)
  └── Traefik v3.1 (Docker container - port :80)
       │
       ▼ (Proxmox LAN Bridge / Dynamic File Provider: profile-mamay.yml)
LXC 10018 (profile-app - 192.168.0.18:3000)
  ├── GitHub Actions Runner (Host service / systemd)
  └── Docker Compose:
       ├── app (Node.js multi-stage: SolidJS static build + Express REST API + uploads) [:3000]
       │    └── Mount: uploads_data:/app/uploads
       ├── migrator (one-shot runtime-role provisioning and SQL migrations)
       └── postgres (Postgres 16 Alpine - isolated bridge network) [:5432 internal]
            └── Mount: postgres_data:/var/lib/postgresql/data
```

---

## 3. Detailed Component Specifications

### 3.1 Gateway LXC 10080 Ingress Configuration
- **File:** `/opt/ingress/dynamic/profile-mamay.yml`
- **Isi:**
  ```yaml
  http:
    routers:
      profile-mamay-router:
        rule: "Host(`profile.mamay.my.id`)"
        entryPoints:
          - web
        service: profile-mamay-service

    services:
      profile-mamay-service:
        loadBalancer:
          servers:
            - url: "http://192.168.0.18:3000"
  ```
- **Cloudflare Zero Trust Setting:**
  - Public hostname: `profile.mamay.my.id`
  - Service: `HTTP` `traefik:80`

### 3.2 LXC 10018 Application Stack
- **Direktori Deployment:** `/opt/mamaysporto`
- **Stack:**
  1. `server/index.js`: Express server yang:
     - Melayani static build frontend `dist/` (dengan fallback SPA routing ke `index.html`).
     - Menyajikan upload media dari `/uploads/` dengan header caching.
     - Menyediakan endpoint REST API:
       - `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` (JWT / session admin).
       - `GET /api/data/:collection` (public read untuk hero, about, skills, projects, experience, site_settings, tags).
       - `PUT /api/data/:collection/:id` & `POST /api/data/:collection` & `DELETE /api/data/:collection/:id` (admin write).
       - `POST /api/upload` (multipart image upload ke `/app/uploads`).
       - `GET /api/health` (health check status DB + app).
  2. `Dockerfile`: Multi-stage build:
     - Stage 1: Build SolidJS static assets (`npm run build`).
     - Stage 2: Runtime minimal Node.js alpine, menginstall runtime dependencies, menjalankan `server/server.js`.
  3. `compose.yaml`:
     - Service `postgres`: image `postgres:16-alpine`, bootstrap credentials dari private `.env`, volume `postgres_data`.
     - Service `migrator`: menggunakan bootstrap role sekali jalan untuk membuat role runtime terbatas dan menjalankan migrasi bernomor sebelum aplikasi dimulai.
     - Service `app`: koneksi memakai `APP_DB_USER`/`APP_DB_PASSWORD`, port 3000 untuk jalur ingress, volume `uploads_data:/app/uploads`.
  4. Database Schema & Seed:
     - `database/01-init.sql` dan `database/02-seed.sql` menyiapkan schema dan konten publik hanya pada volume PostgreSQL baru. Tidak ada akun admin bersama di seed; buat akun pertama melalui `node scripts/create-admin.js`.
     - `database/migrations/*.sql` dilacak melalui `schema_migrations` dan dijalankan oleh `scripts/migrate.js` sebelum deployment.

### 3.3 Client Integration
- `src/lib/api.js`:
  - Mengarahkan `fetchCollection`, `updateSingleton`, `insertRow`, `updateRow`, `deleteRow`, dan upload file ke endpoint REST lokal `/api/data/*` dan `/api/upload` (tanpa `@supabase/supabase-js`).
- `src/lib/auth.js`:
  - Mengarahkan login/logout admin ke `/api/auth/login` dan `/api/auth/logout`.
- Chat AI (Yowman):
  - Memastikan seluruh trigger dan UI chat dinonaktifkan/dibersihkan sesuai keputusan user.

### 3.4 CI/CD Self-Hosted Runner di LXC 10018
- File `.github/workflows/deploy.yml`:
  - `runs-on: self-hosted`
  - Trigger: `push` ke `main`.
  - Steps:
    - Checkout repo
    - Validasi dependency produksi, lint, dan test
    - Pastikan direktori `/opt/mamaysporto` dan file `.env` tersedia
    - Build image, jalankan migrator, lalu deploy dengan Docker Compose
    - Cek status container dan healthcheck `curl -f http://localhost:3000/api/health`

### 3.5 SSOT Synchronization
- Memperbarui `opt/HOMELAB-SSOT.md`:
  - Perbarui status LXC `10018` dengan IP `192.168.0.18`, domain `profile.mamay.my.id`, port 3000.
  - Catat pola runner per-LXC dan penyimpanan dynamic Traefik.

## 4. Internal network trust boundary

Cloudflare mengakhiri TLS publik di edge. Route Traefik yang tersimpan di repository meneruskan HTTP dari LXC ingress 10080 (`192.168.0.80`) ke app pada LXC 10018 (`192.168.0.18:3000`). Source ini tidak membuktikan isolasi LAN atau aturan firewall aktif. Batasi port 3000 pada firewall LXC/Proxmox agar hanya gateway ingress yang dapat terhubung dan verifikasi aturan runtime. Jika LAN tidak sepenuhnya tepercaya, aktifkan HTTPS atau mTLS antara Traefik dan app serta validasi sertifikat backend. TLS Cloudflare tidak melindungi hop internal ini.

# Design Spec: Proxmox LXC 10018 Deployment & Traefik Ingress

**Date:** 2026-10-24  
**Status:** Approved  
**Project:** mamaysporto (`profile.mamay.my.id`)  

---

## 1. Context & Objectives

Aplikasi portfolio `mamaysporto` sebelumnya dirancang untuk berjalan di serverless Vercel dengan Supabase (PostgreSQL/Auth/Storage) dan OpenRouter AI (Yowman AI). Berdasarkan kesepakatan arsitektur homelab di [opt/HOMELAB-SSOT.md](file:///Users/macbookpro/tama/projek/mamaysporto/opt/HOMELAB-SSOT.md), aplikasi ini akan di-deploy ke infrastruktur lokal homelab Proxmox VE:

1. **LXC Ingress Gateway (ID 10080, IP 192.168.0.80):**
   - Menjalankan Cloudflare Tunnel (`cloudflared`) dan Traefik v3.1.
   - Menggunakan Traefik File Provider (`/opt/ingress/dynamic/`) untuk merutekan request `profile.mamay.my.id` ke backend LXC aplikasi.
2. **LXC Aplikasi (ID 10018, IP 192.168.0.18):**
   - Berjalan pada container Proxmox terisolasi dengan IP statis `192.168.0.18`.
   - Menggantikan ketergantungan eksternal (Supabase & OpenRouter AI):
     - OpenRouter AI / Chat area dinonaktifkan sepenuhnya.
     - Supabase digantikan oleh database internal PostgreSQL 16 (container) + backend REST API Node.js.
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
       ├── app (Node.js multi-stage: SolidJS static build + REST API + uploads) [:3000]
       │    └── Mount: uploads_data:/app/uploads
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
  1. `server/server.js`: Web server Node.js ringan (menggunakan Fastify atau native HTTP) yang:
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
     - Service `postgres`: image `postgres:16-alpine`, env `POSTGRES_DB=mamaysporto`, `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=...`, volume `postgres_data`.
     - Service `app`: build context `.`, ports `3000:3000`, depends_on `postgres`, volumes `uploads_data:/app/uploads`.
  4. Database Schema & Seed:
     - Script SQL inisialisasi tabel (`hero`, `about`, `skills`, `projects`, `experience`, `site_settings`, `project_tags`, `admins`) yang otomatis dijalankan saat container Postgres pertama kali dibuat via `/docker-entrypoint-initdb.d/init.sql`.

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
    - Pastikan direktori `/opt/mamaysporto` dan file `.env` tersedia
    - Jalankan `docker compose up -d --build`
    - Cek status container dan healthcheck `curl -f http://localhost:3000/api/health`

### 3.5 SSOT Synchronization
- Memperbarui `opt/HOMELAB-SSOT.md`:
  - Perbarui status LXC `10018` dengan IP `192.168.0.18`, domain `profile.mamay.my.id`, port 3000.
  - Catat pola runner per-LXC dan penyimpanan dynamic Traefik.

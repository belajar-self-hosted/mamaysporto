# 🚀 SolidJS Neobrutalism Portfolio

Sebuah project portofolio interaktif dan modern yang dibangun dengan **SolidJS** dan desain **Neobrutalism**. Project ini tidak hanya fokus pada tampilan antarmuka yang memukau, tetapi juga dilengkapi dengan infrastruktur *DevOps* yang solid, mulai dari containerization hingga pipeline CI/CD otomatis.

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Framework:** [SolidJS](https://www.solidjs.com/) (dipilih karena reaktivitas granularnya yang sangat cepat)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Desain Sistem:** Neobrutalism (Custom CSS)

### DevOps & Infrastruktur Server
- **Containerization:** Docker & Docker Compose (Multi-stage build dengan Nginx Alpine)
- **CI/CD:** GitHub Actions (Self-Hosted Runner)
- **Jaringan & Keamanan:** Cloudflare Tunnel (Zero Trust)
- **Routing:** Nginx dikonfigurasi khusus untuk *Single Page Application* (SPA) dengan fallback ke `index.html`.

---

## 🏗️ Arsitektur Infrastruktur (DevOps Setup)

Project ini berjalan di atas sebuah **Mini PC Lokal (Ubuntu)** yang telah diubah menjadi server publik skala global tanpa perlu membuka *port forwarding* pada router rumahan.

### Alur Kerja (Workflow)
1. **Developer (Lokal):** Mengedit file konten di `src/data/` atau memodifikasi UI, lalu melakukan `git push` ke branch `main`.
2. **GitHub Actions (CI/CD):** Mendeteksi perubahan dan mengirimkan perintah eksekusi ke *Self-Hosted Runner* yang berjalan di Mini PC.
3. **Mini PC (Server):** 
   - Mengeksekusi `.github/workflows/deploy.yml`.
   - Melakukan build ulang Docker Image.
   - Menjalankan container baru dan menghapus image lama (*prune*) secara otomatis.
4. **Cloudflare Tunnel:** Container `cloudflared` yang berjalan di Mini PC menelepon keluar (outbound) ke jaringan Cloudflare, mengamankan koneksi dengan SSL/HTTPS otomatis, lalu mempublikasikannya ke internet global.

---

## 💻 Cara Menjalankan Project (Lokal/Development)

Jika Anda ingin mencoba menjalankan atau memodifikasi project ini di komputer Anda sendiri:

1. **Clone repository ini:**
   ```bash
   git clone <URL_REPO_ANDA>
   cd test-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Jalankan server development:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## 📁 Struktur Folder Utama

- `/src/data/` : Tempat menyimpan data dinamis (Experience, Projects, Skills). Anda hanya perlu mengedit file di sini untuk memperbarui konten portofolio tanpa menyentuh kode UI.
- `/src/sections/` : Kumpulan komponen halaman (Hero, About, dll).
- `Dockerfile` : Blueprint untuk membangun container Nginx + SolidJS.
- `docker-compose.yml` : Konfigurasi untuk menjalankan aplikasi di lingkungan production.
- `nginx.conf` : Aturan server Nginx khusus untuk meroute SPA SolidJS.
- `.github/workflows/deploy.yml` : Robot otomatisasi CI/CD.

---
*Dibangun dengan penuh dedikasi melalui perpaduan *Frontend Engineering* dan *DevOps Modern*.*

# 🏗️ Dokumentasi Arsitektur Infrastruktur & DevOps
**Projek:** Portofolio SolidJS (Tama)  
**Domain:** `mamay.my.id`

Dokumen ini berisi rangkuman teknis menyeluruh mengenai arsitektur perangkat lunak, konfigurasi jaringan, port, dan IP yang digunakan pada server Mini PC lokal untuk mendeploy website portofolio ke internet publik.

---

## 1. Topologi Jaringan (Network Topology)

Server tidak menggunakan metode tradisional (seperti Port Forwarding atau IP Publik Statis ISP). Server menggunakan metode *Outbound Tunneling* (Cloudflare Zero Trust) yang menjamin keamanan jaringan lokal rumahan (NAT).

*   **Mini PC (Server Hosting):** Berjalan menggunakan OS Ubuntu.
*   **IP LAN Lokal (WiFi/Router):** `192.168.1.104` (Telah dikunci / statis menggunakan DHCP Binding pada Router).
*   **IP Private VPN (Tailscale):** `100.69.196.46` (Hanya digunakan untuk remote akses SSH/Manajemen dari perangkat pribadi).
*   **Domain Name:** `mamay.my.id` (Diatur dan diproxy oleh Cloudflare).

---

## 2. Peta Port (Port Mapping)

Berikut adalah daftar port yang aktif di dalam Mini PC:

| Port | Layanan (Service) | Penjelasan |
| :--- | :--- | :--- |
| **`3000`** | **SolidJS / Nginx (Web)** | Port utama tempat aplikasi Portofolio berjalan (via `docker-compose`). Container Docker Nginx mengekspos port 80 ke port 3000 pada host Mini PC. |
| **`80`** | Nginx Proxy Manager (NPM) | Menangkap traffic HTTP standar (Tersedia, namun di-*bypass* oleh Cloudflare Tunnel). |
| **`443`** | Nginx Proxy Manager (NPM) | Menangkap traffic HTTPS (Tersedia, namun di-*bypass*). |
| **`81`** | NPM Dashboard | Panel admin untuk manajemen Nginx Proxy Manager lokal. |

---

## 3. Arsitektur Perangkat Lunak (Software Stack)

### A. Frontend (Aplikasi)
*   **Framework:** SolidJS + Vite (Dipilih karena performa tinggi tanpa Virtual DOM).
*   **Konsep Desain UI:** *Data-Driven UI* (Separation of Concerns). 
    *   **Data (Teks/Isi):** Disimpan di dalam file terpisah (`src/data/skills.js`, `experience.js`, `projects.js`).
    *   **UI (Tampilan):** Komponen mengambil data dari file JS dan melakukan iterasi (looping) menggunakan `<For>`.
*   **Gaya Desain:** Neobrutalism (Warna kontras, border tegas 3px hitam, shadow solid).

### B. Containerization (Docker)
Aplikasi dibungkus menggunakan Docker agar environment-nya konsisten.
*   **Multi-stage Build (`Dockerfile`):**
    *   *Tahap 1 (Build):* Menggunakan `node:20-alpine` untuk melakukan `npm ci` dan `npm run build`.
    *   *Tahap 2 (Serve):* Menggunakan `nginx:alpine` yang sangat ringan. File hasil build dari tahap 1 disalin ke dalam folder html Nginx.
*   **Nginx Config (`nginx.conf`):** Aturan `try_files $uri $uri/ /index.html;` disuntikkan ke dalam container agar *Single Page Application* (SPA) tidak mengalami *Error 404* saat pengguna me-refresh halaman.
*   **Docker Ignore (`.dockerignore`):** Mengabaikan folder `node_modules` bawaan sistem host agar tidak merusak instalasi bersih di dalam container Docker.

---

## 4. Konfigurasi CI/CD (GitHub Actions)

Aplikasi diperbarui secara otomatis ketika ada perubahan kode (Git Push).

*   **Runner:** Menggunakan **Self-Hosted Runner** level organisasi yang diinstal langsung di Mini PC Ubuntu.
*   **Trigger:** Otomatis berjalan (*on: push*) ke branch `main`.
*   **Skrip Eksekusi (`deploy.yml`):**
    1. Membuat file `.env` (Jika ada *secrets*).
    2. Menjalankan perintah `docker-compose up --build -d`.
    3. Menjalankan `docker image prune -f` untuk menghapus *image* lama agar penyimpanan Mini PC (Disk) tidak cepat penuh.

---

## 5. Konfigurasi Tunneling (Cloudflare Zero Trust)

Ini adalah tulang punggung infrastruktur publik server Anda yang menggantikan peran *Port Forwarding* dan pengaturan SSL manual.

1.  **Daemon `cloudflared`:** Berjalan di dalam container Docker pada Mini PC sebagai agen perantara (mengeksekusi perintah `docker run -d --restart unless-stopped cloudflare/cloudflared:latest tunnel ...`).
2.  **Jalur Lalu Lintas (Traffic Route):**
    *   **Cloudflare Dashboard (Published application routes):** Rute dikonfigurasi untuk menangkap akses `mamay.my.id` (HTTP/HTTPS dari publik).
    *   **Target (Service URL):** `http://192.168.1.104:3000`.
3.  **Keamanan & SSL:** Cloudflare Tunnel mengenkripsi koneksi secara end-to-end dari pengunjung hingga mencapai agen `cloudflared` di Mini PC. Oleh karena itu, kita tidak perlu mengonfigurasi sertifikat *Let's Encrypt* secara manual di server lokal.

---
*Dokumentasi ini dibuat untuk mempermudah perawatan (maintenance), pemecahan masalah (troubleshooting), dan pengembangan arsitektur di masa depan.*

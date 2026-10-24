# Panduan Konfigurasi LXC 10018 (Production App & Self-Hosted Runner)

Dokumen ini adalah panduan langkah demi langkah untuk mengonfigurasi **LXC 10018** (`profile-app`) di Proxmox VE agar siap menjalankan `mamaysporto` dan GitHub Actions Self-Hosted Runner sesuai dengan [opt/HOMELAB-SSOT.md](file:///Users/macbookpro/tama/projek/mamaysporto/opt/HOMELAB-SSOT.md).

---

## 1. Spesifikasi Target

| Item | Nilai | Keterangan |
|---|---|---|
| LXC ID | `10018` | Container aplikasi |
| Hostname | `profile-app` | Hostname LXC |
| IP Statis | `192.168.0.18/24` | Jaringan internal Proxmox |
| Gateway | `192.168.0.1` | Router LAN |
| Port Aplikasi | `3000` | HTTP internal (di-route oleh Traefik) |
| Ingress Gateway | `192.168.0.80` (LXC `10080`) | Traefik v3 File Provider |
| Domain Publik | `profile.mamay.my.id` | Cloudflare Tunnel -> Traefik |

---

## 2. Instalasi Dependensi di Host LXC 10018

Masuk ke console LXC 10018 dari Proxmox (atau via SSH `ssh root@192.168.0.18`):

### 2.1 Update Paket & Instal Docker
```bash
apt-get update && apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg git

# Install Docker engine
curl -fsSL https://get.docker.com | sh

# Aktifkan Docker service
systemctl enable --now docker
```

---

## 3. Instalasi GitHub Actions Self-Hosted Runner

Runner diinstal langsung di OS LXC 10018 agar dapat mengeksekusi `docker compose` secara lokal tanpa perlu SSH antar-LXC atau registry image eksternal.

### 3.1 Buat User Khusus Runner
```bash
useradd -m -s /bin/bash github-runner
usermod -aG docker github-runner
```

### 3.2 Unduh dan Konfigurasikan Runner
Pindah ke user `github-runner`:
```bash
su - github-runner
mkdir actions-runner && cd actions-runner

# Unduh paket runner (periksa versi terbaru di repo GitHub: Settings > Actions > Runners > New runner)
curl -o actions-runner-linux-x64-2.322.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-linux-x64-2.322.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.322.0.tar.gz

# Jalankan registrasi runner (Ganti <REPO_URL> dan <TOKEN> dari GitHub Dashboard)
./config.sh --url https://github.com/<OWNER>/<REPO> --token <RUNNER_REGISTRATION_TOKEN> --name lxc-10018-runner --labels self-hosted,linux,x64 --unattended
```

### 3.3 Pasang Runner sebagai Systemd Service
Kembali ke root (`exit`), lalu jalankan:
```bash
cd /home/github-runner/actions-runner
./svc.sh install github-runner
./svc.sh start
./svc.sh status
```

---

## 4. Penyiapan Direktori & File `.env` Produksi

Siapkan file `.env` persisten di `/opt/mamaysporto/.env` yang akan dibaca oleh runner:

```bash
mkdir -p /opt/mamaysporto
cat << 'EOF' > /opt/mamaysporto/.env
PORT=3000
NODE_ENV=production
POSTGRES_DB=mamaysporto
POSTGRES_USER=postgres
POSTGRES_PASSWORD=GANTI_DENGAN_PASSWORD_DATABASE_AMAN
JWT_SECRET=GANTI_DENGAN_STRING_RANDOM_MINIMAL_32_KARAKTER
EOF

# Kunci izin file agar hanya bisa dibaca owner/runner
chown -R github-runner:github-runner /opt/mamaysporto
chmod 600 /opt/mamaysporto/.env
```

---

## 5. Hubungkan ke Gateway Ingress (LXC 10080)

1. Pastikan file konfigurasi dinamis Traefik disalin ke LXC 10080:
   ```bash
   # Dari mesin lokal:
   ./scripts/sync-ingress-gateway.sh
   # Atau langsung di LXC 10080 di /opt/ingress/dynamic/profile-mamay.yml
   ```
2. Di **Cloudflare Zero Trust Dashboard**:
   - Buka: **Networks** > **Tunnels** > Pilih Tunnel Anda > **Configure** > **Public Hostname**.
   - Tambahkan rule:
     - **Subdomain:** `profile`
     - **Domain:** `mamay.my.id`
     - **Type:** `HTTP`
     - **URL:** `traefik:80`
   - Simpan.

---

## 6. Verifikasi dan Operasional

### 6.1 Uji Manual Awal di LXC 10018
```bash
cd /path/to/repo/or/runner-workspace
docker compose up -d --build
curl -f http://localhost:3000/api/health
```

### 6.2 Log Container
```bash
docker compose logs -f app
docker compose logs -f postgres
```

### 6.3 Backup Database Lokal
```bash
docker exec -t mamaysporto-db pg_dump -U postgres mamaysporto > /opt/mamaysporto/backup-$(date +%F).sql
```

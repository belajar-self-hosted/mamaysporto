# Audit Codebase & Security Assessment

**Proyek:** mamaysporto
**Tanggal audit:** 1 November 2026 (Asia/Jakarta)
**Ruang lingkup:** seluruh source dan konfigurasi yang terlacak, ditambah berkas lokal yang relevan tanpa membaca nilai rahasia.
**Status perubahan:** laporan ini memuat snapshot audit awal sebelum remediation. Setelah snapshot tersebut, pengguna meminta semua temuan diperbaiki; perubahan source, dependency, dokumentasi, dan konfigurasi yang disetujui kini dicatat pada Bagian L. Validasi terhadap layanan production tetap tidak dilakukan.

> **Catatan status:** Bagian C–K mempertahankan bukti dan rekomendasi pada waktu audit awal. Jika statusnya bertentangan dengan ledger terbaru, Bagian L yang berlaku.

### Ringkasan status terbaru

- Implementasi untuk seluruh temuan yang dapat ditangani dari repository sudah diterapkan; temuan yang memerlukan akses production atau baseline resource tetap berstatus validasi operasional.
- `npm test` (termasuk penemuan migration dan isolasi cache privat antar-sesi), `npm run lint`, production build, `npm audit --omit=dev`, pemeriksaan sintaks JavaScript, validasi konfigurasi Compose, dan `git diff --check` lulus pada pemeriksaan terakhir.
- Build mengeluarkan peringatan bahwa chunk Three.js berukuran 518,36 kB mentah (129,65 kB gzip); ini hasil ukuran bundle, bukan bukti bottleneck runtime.
- Tidak ada database, akun, kebijakan Supabase, firewall, atau layanan production yang diakses atau diubah. File `.env` tidak dibaca.

## A. Executive Summary (snapshot awal sebelum remediation)

Root aplikasi adalah website portofolio SolidJS/Vite dengan backend Express 5, PostgreSQL, JWT untuk CMS admin, dan penyimpanan upload lokal. Deployment yang saat ini tampak aktif dalam repository menggunakan Docker Compose dan GitHub Actions self-hosted di Proxmox. Folder sumur-creative merupakan aplikasi React/TypeScript terpisah yang tidak ikut dibangun oleh pipeline root.

Pada snapshot awal, temuan dengan prioritas tertinggi adalah fallback JWT yang diketahui dan kredensial admin bersama dalam seed. Keduanya terbukti ada di source/config, tetapi nilai environment serta kondisi database production tidak dapat diverifikasi dari workspace. Source fallback/seed serta temuan XSS, URL aktif, rate limit, dan revocation kemudian ditangani; status terbaru per ID ada di Bagian L. Nilai environment dan kondisi database production tetap belum diverifikasi.

Pemeriksaan dependency pada snapshot awal menunjukkan advisory pada 18 entri package di lockfile root. Setelah dependency diperbarui, audit terakhir pada 1 November 2026 menunjukkan nol advisory root dan production-only; advisory tersebut tetap merupakan hasil historis, bukan status dependency terkini. Jalur aplikasi ke API deserialisasi seroval tidak ditemukan pada baseline.

### Ringkasan severity (snapshot sebelum remediation)

| Severity | Jumlah temuan dengan severity aplikasi | Catatan |
|---|---:|---|
| Critical (P0) | 0 | Tidak ada exploit kritis yang tervalidasi pada aplikasi aktif. |
| High (P1) | 2 | Ada pada source/config; penggunaan default di deployment masih perlu diperiksa. |
| Medium (P2) | 5 | Jalur ada di kode; sebagian membutuhkan hak admin atau klik pengunjung. |
| Low (P3) | 9 | Kebocoran error, isu performa, reliability, dan konfigurasi/tooling. |
| Informational (P4) | 3 | Drift dokumentasi dan technical debt. |
| Belum diberi severity | 14 | Kandidat yang status runtime atau exploitabilitasnya belum tervalidasi. |

### Status validasi

| Validation Status | Jumlah | Catatan |
|---|---:|---|
| Confirmed | 21 | Temuan terbukti pada source/config atau hasil check; beberapa masih memiliki prasyarat deployment yang belum diketahui. |
| Potential | 7 | Ada indikasi risiko, tetapi exploitabilitas atau dampak runtime belum dibuktikan. |
| Needs Validation | 5 | Memerlukan pemeriksaan deployment atau pemetaan jalur dependency. |
| Rejected / False Positive | 0 finding | Dugaan yang ditolak dirangkum pada bagian K. |

Angka ini menghitung temuan aplikasi, bukan jumlah advisory dari npm. Advisory upstream dapat memiliki CVSS tinggi tanpa jalur yang dapat dicapai pada aplikasi ini.

## B. Technology & Architecture Overview pada snapshot audit awal

### Stack dan runtime

- Frontend utama: JavaScript/JSX, SolidJS, Vite; entry point **src/index.jsx** dan **index.html**.
- Backend: Node.js dengan Express 5 pada **server/index.js**; runtime image Docker menggunakan Node 22 Alpine.
- Database aktif menurut konfigurasi Compose: PostgreSQL 16, koneksi melalui **pg** dengan pool maksimum 10.
- Admin CMS: Bearer JWT; hash password memakai bcryptjs; token disimpan frontend di localStorage.
- Upload: Multer menulis ke volume lokal yang disajikan publik pada path **/uploads**.
- Deployment: **.github/workflows/deploy.yml**, Docker Compose, dan Traefik file-provider untuk route ke port aplikasi.
- Aplikasi terpisah: **sumur-creative/** menggunakan React, TypeScript, dan Vite. Root build tidak memasukkan folder ini.
- Supabase SQL serta **vercel.json** masih ada, tetapi tidak ditemukan pemakaian Supabase client pada runtime root. Dokumen deployment menyebut Supabase/OpenRouter sebagai arsitektur lama yang sudah diganti.

### Alur dan attack surface

- Pengunjung dapat membaca koleksi publik melalui **GET /api/data/:collection**. Data yang dapat dimutasi dilindungi middleware Bearer JWT.
- Login melalui **POST /api/auth/login**; pemeriksaan sesi melalui **GET /api/auth/me**; logout melalui **POST /api/auth/logout**; perubahan akun melalui **PUT /api/auth/account**.
- Upload admin melalui **POST /api/upload**; hasil file dapat dibaca publik melalui **/uploads/**.
- Koleksi tabel API dibatasi allowlist. Nilai SQL menggunakan parameter, tetapi nama kolom saat insert/update berasal dari JSON request.
- Konten About menerima HTML dan dirender langsung sebagai innerHTML. URL CTA, proyek, dan sosial memakai helper yang mempertahankan skema apa pun.
- Health check publik melakukan query database dan mengembalikan pesan error database ketika gagal.

### Metodologi

Audit mengikuti pemeriksaan risiko OWASP Top 10 dan OWASP ASVS 5.0.0: input/output encoding, autentikasi, otorisasi, konfigurasi, dependency, dan reliability. Pemeriksaan dilakukan melalui pembacaan source/config, penelusuran dependency lockfile, serta linter, test script, dan npm audit yang sudah tersedia. Tidak ada dependency dipasang dan tidak ada exploit yang dikirim ke layanan publik. [OWASP Top 10](https://top10.owasp.org/) · [OWASP ASVS](https://asvs.owasp.org/)

## C. Security Findings

### SEC-001 — Secret JWT memiliki fallback tetap yang diketahui

- **Category:** Security
- **Validation Status:** Confirmed pada source/config; penggunaan nilai fallback di deployment perlu divalidasi.
- **Severity:** High (P1)
- **Priority:** P1
- **Affected File:** **server/auth.js**, **compose.yaml**, **server/routes/data.js**, **server/routes/upload.js**
- **Location:** **server/auth.js:5,8-15**; **compose.yaml:32-36**; route terlindungi **server/routes/data.js:53,133-138** dan **server/routes/upload.js:51**
- **Evidence:** Server menandatangani dan memverifikasi JWT dengan nilai default tetap saat JWT_SECRET tidak tersedia. Compose mendefinisikan fallback yang sama. Middleware hanya memverifikasi signature dan kemudian menerima claim sebagai req.admin.
- **Root Cause:** Startup fail-open; nilai rahasia mempunyai fallback di kode dan Compose.
- **Impact:** Jika fallback dipakai, pihak yang dapat mencapai aplikasi bisa membuat token admin dan mengakses perubahan konten serta upload tanpa password.
- **Exploitability / Trigger Condition:** JWT_SECRET tidak diisi dengan nilai kuat dan service bisa dijangkau. Nilai environment production tidak tersedia untuk audit.
- **Recommended Fix:** Hapus fallback; gagalkan startup bila JWT_SECRET hilang atau tidak memenuhi kebijakan kekuatan. Rotasi secret deployment terdampak dan invalidasi sesi yang lama.
- **Alternative Fix:** Ambil secret dari secret manager runtime dengan health/startup validation yang sama.
- **Regression Risk:** Rotasi secret akan membuat seluruh JWT aktif tidak berlaku dan mengharuskan admin login kembali.
- **Verification:** Start service tanpa JWT_SECRET dan pastikan gagal. Pastikan token yang dibuat memakai fallback lama ditolak oleh endpoint terlindungi.

### SEC-002 — Seed database menyertakan kredensial admin bersama

- **Category:** Security
- **Validation Status:** Confirmed pada seed; status akun database aktif belum diketahui.
- **Severity:** High (P1)
- **Priority:** P1
- **Affected File:** **database/02-seed.sql**, **database/seed.sql**, **compose.yaml**, **server/auth.js**
- **Location:** Kedua file seed **:5-8**; Compose mount **:12-14**; login route **server/index.js:45** dan **server/auth.js:36-60**
- **Evidence:** Seed membuat akun admin memakai kredensial bersama yang disebutkan di komentar. Compose memasang semua SQL dari database sebagai skrip inisialisasi. Nilai kredensial tidak disalin ke laporan.
- **Root Cause:** Akun produksi bersama ditanam dalam seed bootstrap; seed memakai UPSERT yang mengganti hash bila file dijalankan ulang.
- **Impact:** Instalasi baru yang belum mengganti kredensial dapat dimasuki sebagai admin; konten CMS dan file dapat diubah.
- **Exploitability / Trigger Condition:** Database baru diinisialisasi atau seed dijalankan ulang, kredensial belum dirotasi, dan login dapat dijangkau.
- **Recommended Fix:** Jangan membuat akun bersama berpassword tetap pada bootstrap produksi. Gunakan proses pembuatan admin satu kali yang meminta kredensial baru, lalu verifikasi dan rotasi akun deployment yang sudah ada.
- **Alternative Fix:** Seed hanya membuat akun non-login/disabled dan mewajibkan aktivasi rahasia melalui prosedur operator.
- **Regression Risk:** Menghapus seed login dapat mengubah langkah setup awal dan perlu prosedur bootstrap admin pengganti.
- **Verification:** Inisialisasi database lokal baru dan pastikan kredensial bawaan gagal; pastikan akun yang dibuat operator dapat login dan mengelola CMS.

### SEC-003 — HTML About dirender mentah tanpa sanitasi

- **Category:** Security
- **Validation Status:** Confirmed pada jalur input ke sink.
- **Severity:** Medium (P2)
- **Priority:** P2
- **Affected File:** **src/sections/About.jsx**, **src/admin/panels/AboutPanel.jsx**, **src/lib/api.js**, **server/routes/data.js**
- **Location:** Render **About.jsx:25-26**; input admin **AboutPanel.jsx:76-79**; client save **api.js:27-39**; backend accepts/persists patch **data.js:53-86,89-128**
- **Evidence:** Konten database About masuk langsung ke innerHTML. Panel admin menerima HTML mentah dan backend menyimpan patch tanpa sanitasi konten.
- **Root Cause:** HTML kaya diterima untuk format teks tanpa allowlist tag/atribut.
- **Impact:** Penulis CMS dapat menyimpan markup/event handler aktif yang berjalan bagi pengunjung. Token admin juga tersedia di localStorage sehingga sesi admin yang melihat halaman dapat terpapar jika payload dijalankan.
- **Exploitability / Trigger Condition:** Perlu akses admin untuk menulis konten saat ini, kemudian pengunjung membuka halaman About.
- **Recommended Fix:** Gunakan format konten aman atau sanitizer allowlist saat penyimpanan/render; batasi tag dan atribut, serta validasi URL link di dalam HTML.
- **Alternative Fix:** Ganti HTML bebas dengan Markdown atau field teks yang dirender sebagai teks biasa.
- **Regression Risk:** Konten HTML lama dapat berubah tampilan jika mengandung tag/atribut di luar allowlist.
- **Verification:** Uji HTML aktif, event handler, SVG, dan skema URL berbahaya; pastikan ditolak sementara markup format yang diizinkan tetap tampil.

### SEC-004 — URL dengan skema aktif lolos normalisasi dan masuk ke sink navigasi

- **Category:** Security
- **Validation Status:** Confirmed pada input-to-sink; eksekusi membutuhkan klik.
- **Severity:** Medium (P2)
- **Priority:** P2
- **Affected File:** **src/lib/url.js**, **src/sections/Projects.jsx**, **src/components/Footer.jsx**, **src/sections/Hero.jsx**, **src/admin/panels/SiteSettingsPanel.jsx**, **src/admin/panels/ProjectsPanel.jsx**, **src/admin/panels/HeroPanel.jsx**
- **Location:** Helper **url.js:6-10**; render **Projects.jsx:116,122**, **Footer.jsx:20-25**, **Hero.jsx:52-54**; admin writes **SiteSettingsPanel.jsx:82-86**, **ProjectsPanel.jsx:65-69**, **HeroPanel.jsx:48-56**
- **Evidence:** Regex helper mempertahankan skema apa pun, bukan allowlist. Nilai digunakan sebagai href dan argumen window.open; panel admin menormalisasi lalu menyimpan URL tersebut.
- **Root Cause:** Validasi memeriksa keberadaan skema, tidak memeriksa skema aman sesuai konteks.
- **Impact:** URL seperti skema script dapat dieksekusi setelah pengunjung mengklik CTA, link proyek, atau link sosial. window.open pada Hero juga tidak membatasi opener.
- **Exploitability / Trigger Condition:** Penulis admin menyimpan URL berbahaya dan pengunjung mengklik link/CTA.
- **Recommended Fix:** Parse URL dan allowlist skema sesuai konteks—misalnya https/http, mailto, dan tel—lalu validasi kembali tepat sebelum render/navigasi. Tambahkan opsi noopener untuk window.open.
- **Alternative Fix:** Tolak URL tidak valid di backend dan tampilkan sebagai teks tanpa link.
- **Regression Risk:** URL platform khusus yang saat ini dipakai mungkin perlu ditambahkan eksplisit ke allowlist.
- **Verification:** Uji tiap konteks dengan skema aman serta javascript:, data:, vbscript:, file:, dan protokol lain; pastikan hanya skema yang disetujui dapat dinavigasi.

### SEC-005 — Endpoint login tidak memiliki throttling aplikasi

- **Category:** Security
- **Validation Status:** Confirmed tidak ada pembatasan pada jalur Express; proteksi pada proxy eksternal belum diketahui.
- **Severity:** Medium (P2)
- **Priority:** P2
- **Affected File:** **server/index.js**, **server/auth.js**
- **Location:** Middleware dan route **server/index.js:15-18,44-48**; login bcrypt **server/auth.js:36-55**; minimum password update **server/auth.js:99-103**
- **Evidence:** Route login memanggil pencarian akun dan bcrypt compare tanpa rate limiter, lockout, atau backoff di aplikasi. Perubahan password menerima panjang minimum enam karakter.
- **Root Cause:** Login tidak memiliki pembatasan per IP/per akun dan aturan password minimum lemah.
- **Impact:** Percobaan password otomatis dapat berulang dan menambah beban CPU database/server; memperbesar risiko bersama kredensial seed.
- **Exploitability / Trigger Condition:** Endpoint dapat dijangkau dari jaringan yang tidak tepercaya; mitigasi reverse proxy mungkin ada tetapi tidak bisa diverifikasi.
- **Recommended Fix:** Terapkan throttling per IP dan akun, backoff/lockout terkontrol, aturan password lebih kuat, dan monitoring login abnormal.
- **Alternative Fix:** Letakkan proteksi bot/rate limit pada ingress sebagai lapisan tambahan, tetap pertahankan pembatasan di aplikasi.
- **Regression Risk:** Rate limit terlalu ketat dapat mengunci admin sah yang salah memasukkan password.
- **Verification:** Jalankan percobaan berulang di lingkungan staging dan ukur bahwa limit berlaku serta pulih tanpa membuka bypass lintas IP/akun.

### SEC-006 — JWT berlaku tujuh hari dan logout hanya menghapus token dari browser

- **Category:** Security
- **Validation Status:** Confirmed.
- **Severity:** Medium (P2)
- **Priority:** P2
- **Affected File:** **server/auth.js**, **src/lib/auth.js**
- **Location:** TTL dan signing **server/auth.js:5-15**; logout **server/auth.js:72-74**; penyimpanan/penghapusan token **src/lib/auth.js:3,34,42-57**
- **Evidence:** JWT diberi expiry tujuh hari. Server logout mengembalikan sukses tanpa mencabut token; client menghapus salinan localStorage. Token yang dicuri tetap diverifikasi hingga kedaluwarsa.
- **Root Cause:** Sesi stateless tidak memiliki revocation atau token versioning.
- **Impact:** Token curian tetap dapat dipakai setelah logout, perubahan password, atau penghapusan salinan lokal.
- **Exploitability / Trigger Condition:** Pihak lain memperoleh Bearer token sebelum expiry.
- **Recommended Fix:** Gunakan sesi/token berumur lebih pendek dengan revocation/version check; lindungi token dari script injection. Jika beralih ke cookie HttpOnly, tambahkan perlindungan CSRF yang sesuai.
- **Alternative Fix:** Simpan denylist token aktif sampai expiry dengan TTL, jika volume dan kebutuhan sederhana mendukungnya.
- **Regression Risk:** Revocation dapat memaksa login ulang; sesi multi-tab perlu sinkronisasi.
- **Verification:** Login, salin token uji, logout atau rotasi kredensial, lalu pastikan token lama mendapat 401 pada seluruh endpoint terlindungi.

### SEC-007 — Nama kolom request disisipkan langsung ke query SQL

- **Category:** Security
- **Validation Status:** Potential; exploitabilitas belum tervalidasi pada PostgreSQL/node-postgres.
- **Severity:** Belum ditetapkan.
- **Priority:** Investigasi P2.
- **Affected File:** **server/routes/data.js**
- **Location:** Pembuatan kolom INSERT **:62-81** dan SET clause UPDATE **:101-120**
- **Evidence:** Nama tabel collection dibatasi allowlist dan nilai query diparameterkan, tetapi key JSON request dibungkus tanda kutip dan digabungkan ke query tanpa allowlist kolom atau escaping identifier.
- **Root Cause:** Parameter SQL tidak dapat menggantikan identifier; kode menerima identifier dari input klien.
- **Impact:** Pemegang token dapat mengirim key dengan kutip SQL untuk mengubah struktur query atau menyebabkan error database. Dampak di luar hak admin normal belum dibuktikan.
- **Exploitability / Trigger Condition:** Penyerang harus memiliki token admin dan mengirim request JSON yang dibuat khusus.
- **Recommended Fix:** Buat allowlist kolom per collection dan tolak key tak dikenal sebelum menyusun query.
- **Alternative Fix:** Gunakan helper identifier quoting yang teruji, tetap dengan allowlist domain.
- **Regression Risk:** Panel admin yang mengirim field tambahan atau field baru sebelum migration dapat mulai ditolak.
- **Verification:** Uji key berisi kutip/komentar SQL pada database lokal terisolasi; pastikan ditolak dan query valid tetap bekerja.

### SEC-008 — Validasi MIME upload tidak mengikat isi file dan ekstensi

- **Category:** Security
- **Validation Status:** Potential; jalur validasi lemah terkonfirmasi, eksekusi konten browser belum diuji.
- **Severity:** Belum ditetapkan.
- **Priority:** Investigasi P2.
- **Affected File:** **server/routes/upload.js**, **server/index.js**
- **Location:** Ekstensi dari nama file **upload.js:19-23**; MIME allowlist **:26-47**; static serving **server/index.js:20-21**
- **Evidence:** Filter hanya membandingkan MIME string yang dikirim klien, menerima SVG, dan ekstensi hasil upload tetap diambil dari nama file asli. File yang lolos ditempatkan di direktori publik tanpa inspeksi/re-encode isi.
- **Root Cause:** Jenis file, MIME, ekstensi, dan isi file tidak divalidasi sebagai satu kesatuan.
- **Impact:** File aktif atau MIME/ekstensi yang tidak cocok berpotensi disajikan sebagai dokumen same-origin. Besarnya risiko perlu dikonfirmasi pada respons HTTP dan browser.
- **Exploitability / Trigger Condition:** Pengguna admin mengunggah file dengan MIME yang diizinkan dan isi/ekstensi yang aktif; pengunjung membuka URL file.
- **Recommended Fix:** Validasi signature/isi file, batasi format raster yang diperlukan, re-encode gambar, dan gunakan ekstensi hasil deteksi server.
- **Alternative Fix:** Sajikan upload dari origin terpisah dengan Content-Disposition dan header MIME aman.
- **Regression Risk:** Upload SVG/ICO atau format non-raster yang saat ini digunakan bisa tidak lagi didukung.
- **Verification:** Di lingkungan lokal terisolasi, unggah file dengan MIME palsu, ekstensi HTML, SVG aktif, serta raster valid; periksa status, Content-Type, nosniff, dan perilaku browser.

### SEC-009 — Tidak ada kuota total maupun pembersihan file upload

- **Category:** Security
- **Validation Status:** Potential; ketiadaan kuota di kode terkonfirmasi, pemakaian disk aktual belum diukur.
- **Severity:** Belum ditetapkan.
- **Priority:** Investigasi P2/P3.
- **Affected File:** **server/routes/upload.js**, **compose.yaml**
- **Location:** Batas hanya per-file **upload.js:37-61**; volume persisten **compose.yaml:41-43**
- **Evidence:** Batas per file adalah 5 MB. Tidak ada limit jumlah/total ukuran file, cleanup, atau endpoint penghapusan file. Volume upload persisten.
- **Root Cause:** Validasi ukuran hanya per file dan tidak ada lifecycle/kuota penyimpanan.
- **Impact:** Admin yang kredensialnya disalahgunakan dapat memenuhi disk volume lewat unggahan berulang.
- **Exploitability / Trigger Condition:** Memerlukan autentikasi upload dan kapasitas disk yang terbatas; kondisi saat ini tidak diukur.
- **Recommended Fix:** Terapkan kuota agregat, rate limit upload, penghapusan file orphan, serta monitoring ruang disk.
- **Alternative Fix:** Simpan media pada storage dengan kuota/retention terkelola.
- **Regression Risk:** Penghapusan file dapat merusak gambar yang masih direferensikan oleh data CMS jika referensi tidak dibersihkan.
- **Verification:** Uji kuota dan cleanup pada volume uji; pastikan file terpakai tidak terhapus dan kapasitas kembali setelah cleanup.

### SEC-010 — Aplikasi memakai role PostgreSQL default yang kemungkinan superuser

- **Category:** Security
- **Validation Status:** Confirmed pada fallback Compose; role production aktual perlu divalidasi.
- **Severity:** Medium (P2)
- **Priority:** P2
- **Affected File:** **compose.yaml**, **server/db.js**
- **Location:** **compose.yaml:9-11,35**; DB connection fallback **server/db.js:5-7**
- **Evidence:** Default Compose menggunakan user PostgreSQL default untuk bootstrap DB dan koneksi aplikasi yang sama. Docker Official Image mendokumentasikan POSTGRES_USER sebagai user dengan superuser power ([referensi](https://github.com/docker-library/docs/blob/master/postgres/README.md)).
- **Root Cause:** Runtime app memakai credential/role bootstrap database tanpa akun dengan privilege minimum terpisah.
- **Impact:** Jika aplikasi dikompromikan, kelemahan query dieksploitasi, atau credential bocor, dampak database dapat meluas ke seluruh database dan administrasi DB.
- **Exploitability / Trigger Condition:** Environment menggunakan nilai default atau role app tetap diberi hak superuser.
- **Recommended Fix:** Buat role runtime terpisah dengan hanya SELECT/INSERT/UPDATE/DELETE yang diperlukan; simpan bootstrap role hanya untuk inisialisasi.
- **Alternative Fix:** Pertahankan satu user tetapi revoke privilege admin/superuser setelah provisioning dan uji semua operasi aplikasi.
- **Regression Risk:** Permission yang terlalu sempit dapat membuat endpoint CMS atau migrasi gagal.
- **Verification:** Periksa privilege role runtime dan jalankan seluruh operasi CRUD/upload pada staging tanpa privilege superuser.

### SEC-011 — Pesan error internal dikirim kembali ke klien

- **Category:** Security
- **Validation Status:** Confirmed.
- **Severity:** Low (P3)
- **Priority:** P3
- **Affected File:** **server/index.js**, **server/auth.js**, **server/routes/data.js**
- **Location:** Health response **server/index.js:33-40**; global handler **:70-75**; login **server/auth.js:62-65**; data route error **server/routes/data.js:83-85,126-129,155-157**
- **Evidence:** Handler mengirim err.message langsung dalam JSON ketika query, login, atau request gagal.
- **Root Cause:** Detail exception internal tidak dipetakan ke error publik generik.
- **Impact:** Error PostgreSQL dapat mengungkap nama relation/constraint, host DB, atau detail implementasi yang membantu reconnaissance.
- **Exploitability / Trigger Condition:** Pemanggil membuat error yang memicu exception, atau database sedang tidak tersedia pada health route.
- **Recommended Fix:** Kembalikan pesan generik dengan request ID; simpan detail di log terbatas tanpa data sensitif.
- **Alternative Fix:** Gunakan error class terkontrol yang hanya mengekspos pesan validasi.
- **Regression Risk:** Diagnosis operator lebih sulit jika log tidak menyertakan detail dan correlation ID.
- **Verification:** Picu error database/validasi di staging; pastikan response tidak memuat SQL/host/stack, sementara log operator tetap dapat dikorelasikan.

### SEC-012 — Security headers aplikasi tidak terlihat pada konfigurasi server

- **Category:** Security
- **Validation Status:** Needs Validation; reverse proxy mungkin menambahkan header.
- **Severity:** Belum ditetapkan.
- **Priority:** P3.
- **Affected File:** **server/index.js**, **vercel.json**, konfigurasi ingress di luar repo
- **Location:** Middleware **server/index.js:15-21**; konfigurasi header Vercel **vercel.json:13-22**
- **Evidence:** Express memasang CORS, parser, static files, tetapi tidak memasang CSP, nosniff, frame policy, atau HSTS. Header di vercel.json hanya CORS dan jalur Vercel tampak bukan deployment aktif.
- **Root Cause:** Kebijakan security header tidak dimiliki secara eksplisit oleh aplikasi atau konfigurasi ingress yang terlacak.
- **Impact:** Tidak ada lapisan mitigasi tambahan untuk XSS, content sniffing, clickjacking, dan downgrade pada browser jika ingress juga tidak menambahkan kebijakan tersebut.
- **Exploitability / Trigger Condition:** Header tidak disetel pada Cloudflare/Traefik atau server response aktual.
- **Recommended Fix:** Tetapkan header di satu lapisan yang jelas dan uji kompatibilitas CSP dengan inline style/script dan Google Fonts.
- **Alternative Fix:** Kelola header di Traefik/Cloudflare dengan konfigurasi versioned dan test.
- **Regression Risk:** CSP ketat dapat memblokir font eksternal, style, gambar, atau interaksi yang ada.
- **Verification:** Periksa response header dari domain publik dan LAN; uji CSP report-only terlebih dahulu sebelum enforce.

### SEC-013 — Policy Supabase lama memberi semua pengguna terautentikasi hak tulis CMS

- **Category:** Security
- **Validation Status:** Needs Validation; tidak ditemukan Supabase pada jalur runtime aktif.
- **Severity:** Belum ditetapkan.
- **Priority:** Investigasi P2 jika proyek Supabase masih aktif.
- **Affected File:** **supabase/cms_admin_setup.sql**, **supabase/hero_image_upload.sql**, **supabase/project_tags.sql**
- **Location:** Policy tabel **cms_admin_setup.sql:52-87**; Storage **:97-114** dan **hero_image_upload.sql:24-37**
- **Evidence:** Policy menilai auth.uid() tidak null untuk semua role authenticated, tanpa allowlist/admin claim. Storage update/delete juga berlaku untuk semua pengguna authenticated. Frontend/server saat ini menggunakan API lokal dan tidak mengimpor Supabase client.
- **Root Cause:** Legacy policy menyamakan status authenticated dengan hak admin.
- **Impact:** Jika migrasi dipakai pada proyek Supabase aktif dan pengguna biasa dapat mendaftar/login, akun itu dapat menulis semua konten CMS dan mengubah/menghapus file.
- **Exploitability / Trigger Condition:** Perlu Supabase aktif dengan kebijakan ini terpasang dan akun non-admin authenticated tersedia.
- **Recommended Fix:** Konfirmasi apakah Supabase masih dipakai. Jika ya, batasi operasi melalui role/claim admin yang tervalidasi dan uji policy per operasi.
- **Alternative Fix:** Hapus akses tulis client-side dan lewatkan mutasi melalui backend admin yang memvalidasi role.
- **Regression Risk:** Admin lama dapat kehilangan akses jika claim/allowlist belum diprovisikan.
- **Verification:** Periksa project Supabase aktif; uji select/insert/update/delete dengan akun anon, authenticated non-admin, dan admin.

### SEC-014 — Advisory dependency npm; keterjangkauan API rentan belum terbukti

- **Category:** Security / Dependency
- **Validation Status:** Needs Validation.
- **Severity:** Tidak ditetapkan untuk aplikasi; npm audit memberi severity upstream, bukan severity exploit aplikasi.
- **Priority:** Investigasi P2.
- **Affected File:** **package.json**, **package-lock.json**
- **Location:** Manifest **package.json:14-35**; versi terkunci antara lain **package-lock.json:1376-1377,1561-1562,3860-3861,3929-3930,4014-4015,4313-4314**
- **Evidence:** Pada 1 November 2026, npm audit root melaporkan 18 entri terdampak: 4 critical, 5 high, 9 moderate. npm audit --omit=dev melaporkan dua package produksi kritis: solid-js 1.9.14 dan transitive seroval 1.5.5. Advisory seroval mencakup masalah deserialisasi; satu advisory upstream memiliki CVSS 9.8. Pencarian source root tidak menemukan pemanggilan API deserialisasi seroval.
- **Paket yang dilaporkan:** Critical — solid-js 1.9.14, seroval 1.5.5, concurrently 10.0.4, shell-quote 1.9.0. High — vite 8.1.5, brace-expansion 5.0.9, browserslist, js-yaml, source-map-js. Moderate — @eslint-community/eslint-utils, @eslint/config-array, @eslint/eslintrc, @typescript-eslint/typescript-estree, @typescript-eslint/utils, baseline-browser-mapping, eslint, eslint-plugin-solid, minimatch. Hanya solid-js/seroval masuk hasil production-only; entri lain berada di dependency tooling/dev.
- **Root Cause:** Lockfile memuat versi dalam rentang advisory; jalur penggunaan rentan belum dipetakan ke bundel/runtime aktif.
- **Impact:** Jika aplikasi memakai API seroval terdampak dengan input tidak tepercaya, dampak upstream dapat tinggi; hal ini belum terbukti pada app client-rendered ini. Advisory lain termasuk concurrently/shell-quote berada di dev tree, sedangkan script dev saat ini memakai argumen perintah tetap.
- **Exploitability / Trigger Condition:** Bergantung pada penggunaan kode rentan, bundling, input yang dapat dikendalikan penyerang, serta konteks package. Belum tervalidasi.
- **Recommended Fix:** Petakan advisory ke module/export yang benar-benar masuk bundel/runtime, lalu rencanakan pembaruan versi yang sudah ditambal dan audit ulang.
- **Alternative Fix:** Jika jalur tidak digunakan, dokumentasikan pengecualian dengan bukti bundle/source dan tetap evaluasi upgrade saat kompatibel.
- **Regression Risk:** Upgrade Solid/Vite/tooling dapat mengubah output build atau API; perlu build dan regresi UI.
- **Verification:** Ulangi npm audit, npm ls/explain, inspeksi bundle produksi, dan uji app setelah pembaruan. Rujukan upstream: [seroval CVE-2026-104846](https://github.com/advisories/GHSA-p6vx-979v-rg4c), [seroval memory exhaustion](https://github.com/advisories/GHSA-jp82-f5mq-hwhp), [seroval script injection](https://github.com/advisories/GHSA-9wx9-5pv9-3349), [seroval deserialization DoS](https://github.com/advisories/GHSA-97r2-qh9m-474h), [shell-quote command injection](https://github.com/advisories/GHSA-pqg4-j6r4-53mv).

### SEC-015 — Parser menerima body hingga 10 MB sebelum autentikasi route

- **Category:** Security / Reliability
- **Validation Status:** Potential; dampak resource pada runtime belum diukur.
- **Severity:** Belum ditetapkan.
- **Priority:** Investigasi P2/P3.
- **Affected File:** **server/index.js**
- **Location:** Parser global **:16-18**, dipasang sebelum route autentikasi **:44-52**.
- **Evidence:** express.json dan express.urlencoded menerima body sampai 10 MB untuk seluruh endpoint. Parser dijalankan sebelum route, termasuk endpoint login; tidak ada rate limiter aplikasi global.
- **Root Cause:** Batas body global besar tidak disesuaikan dengan kebutuhan endpoint dan request body diproses sebelum pemeriksaan autentikasi route.
- **Impact:** Banyak request body berukuran besar dapat menambah alokasi memori dan CPU serta menekan server pada host dengan resource terbatas. Dampak dan throughput aktual belum diukur.
- **Exploitability / Trigger Condition:** Endpoint dapat dijangkau dari jaringan dan penyerang mengirim request besar secara paralel; limit koneksi/proxy eksternal belum diketahui.
- **Recommended Fix:** Tetapkan limit kecil khusus JSON API, pisahkan kebutuhan upload multipart, dan pasang throttling/kontrol konkurensi sebelum parsing mahal.
- **Alternative Fix:** Terapkan body-size dan connection limits di ingress serta batasi request per IP pada aplikasi.
- **Regression Risk:** Payload CMS yang sah tetapi besar dapat ditolak bila limit diturunkan terlalu jauh.
- **Verification:** Uji ukuran payload dan concurrency bertahap di staging; pantau RSS, event-loop delay, dan respons 413/rate limit. Jangan lakukan load test pada production.

### SEC-016 — Dev server aplikasi nested bind ke semua interface

- **Category:** Security / Configuration
- **Validation Status:** Potential; server nested tidak dijalankan dan exposure jaringan belum diuji.
- **Severity:** Belum ditetapkan.
- **Priority:** P3 jika aplikasi nested digunakan.
- **Affected File:** **sumur-creative/package.json**
- **Location:** Script dev **package.json:6-8**.
- **Evidence:** Script dev menjalankan Vite dengan flag --host=0.0.0.0. Root build/deploy tidak memakai aplikasi nested ini dan package lock tidak tersedia.
- **Root Cause:** Development server menerima koneksi semua interface saat script dev dijalankan.
- **Impact:** Perangkat lain pada jaringan yang dapat menjangkau port dev dapat mengakses server development/source tooling. Keterjangkauan dan versi dependency efektif belum diverifikasi.
- **Exploitability / Trigger Condition:** Developer menjalankan aplikasi nested pada jaringan yang tidak tepercaya atau port tersebut dapat dijangkau dari internet.
- **Recommended Fix:** Bind ke loopback secara default; aktifkan host exposure hanya untuk sesi kolaborasi pada jaringan tepercaya dengan pembatasan firewall.
- **Alternative Fix:** Jika dev server memang perlu diakses dari perangkat lain, gunakan reverse proxy autentikasi dan allowlist host yang ketat.
- **Regression Risk:** Preview pada perangkat LAN tidak lagi berfungsi tanpa konfigurasi eksplisit.
- **Verification:** Jalankan hanya di lingkungan lokal; pastikan listen address default localhost dan uji akses dari host lain yang ditolak.

### SEC-017 — Hop ingress ke aplikasi menggunakan HTTP pada jaringan internal

- **Category:** Security / Configuration
- **Validation Status:** Potential; route yang terlacak menggunakan HTTP, trust boundary dan konfigurasi runtime belum diperiksa.
- **Severity:** Belum ditetapkan.
- **Priority:** P3 jika jaringan internal tidak sepenuhnya tepercaya.
- **Affected File:** **opt/ingress/dynamic/profile-mamay.yml**, **docs/superpowers/specs/2026-10-24-proxmox-lxc-traefik-profile-deployment-design.md**
- **Location:** Target backend **profile-mamay.yml:13-17**; topologi TLS termination dan hop LAN **design document:34-47,67-72**.
- **Evidence:** Traefik route yang terlacak meneruskan ke URL http://192.168.0.18:3000. Dokumen menjelaskan TLS di Cloudflare Edge dan HTTP menuju backend pada LAN.
- **Root Cause:** TLS berakhir sebelum koneksi proxy terakhir ke aplikasi dan backend tidak memakai HTTPS/mTLS dalam konfigurasi yang terlacak.
- **Impact:** Jika perangkat yang tidak tepercaya dapat mengamati atau mengubah trafik LAN, token Bearer dan isi API dapat disadap atau dimodifikasi. Segmentasi jaringan aktual tidak diketahui.
- **Exploitability / Trigger Condition:** Penyerang memiliki posisi pada jaringan antara Traefik dan LXC aplikasi atau segmen LAN tidak tepercaya.
- **Recommended Fix:** Verifikasi isolasi jaringan. Jika trust boundary tidak memadai, gunakan TLS/mTLS antarahop dan validasi certificate di Traefik.
- **Alternative Fix:** Batasi port aplikasi agar hanya dapat dijangkau IP ingress dan isolasikan LXC pada VLAN/firewall khusus.
- **Regression Risk:** TLS backend memerlukan certificate, trust configuration, dan rotasi; konfigurasi yang salah dapat memutus routing.
- **Verification:** Periksa firewall/route aktif dan capture konfigurasi tanpa menangkap isi sensitif; validasi bahwa hanya ingress yang dapat menjangkau backend dan TLS aktif jika dibutuhkan.

## D. Performance Findings

### PERF-001 — Beberapa komponen mengulang GET koleksi yang sama

- **Category:** Performance
- **Validation Status:** Confirmed pada source; dampak waktu/transfer belum diukur.
- **Severity:** Low (P3)
- **Priority:** P3
- **Affected File:** **src/components/Navbar.jsx**, **src/components/Footer.jsx**, **src/components/SiteMeta.jsx**, **src/sections/Contact.jsx**, **src/sections/Skills.jsx**, **src/components/Marquee.jsx**
- **Location:** Resource settings masing-masing **Navbar.jsx:8**, **Footer.jsx:9**, **SiteMeta.jsx:7**, **Contact.jsx:9**; skills **Skills.jsx:9**, **Marquee.jsx:7**
- **Evidence:** Setiap createResource memanggil endpoint yang sama sendiri. Halaman meminta site_settings empat kali dan skills dua kali.
- **Root Cause:** Tidak ada resource/cache bersama antar komponen.
- **Impact:** Tambahan request, query PostgreSQL, dan waktu tunggu saat first render; ukuran dampak belum diukur.
- **Exploitability / Trigger Condition:** Terjadi setiap page load saat seluruh komponen aktif.
- **Recommended Fix:** Gunakan resource/query cache bersama dengan mekanisme refetch/invalidation setelah perubahan admin.
- **Alternative Fix:** Gabungkan data halaman publik dalam satu endpoint snapshot jika kontrak data stabil.
- **Regression Risk:** Cache terlalu agresif dapat menampilkan konten lama setelah admin mengubah data.
- **Verification:** Ukur request count pada Network panel sebelum/sesudah; pastikan edit admin diikuti data baru.

### PERF-002 — Render loop Three.js terus berjalan pada mode reduced motion

- **Category:** Performance
- **Validation Status:** Confirmed pada code path; CPU/GPU aktual belum diukur.
- **Severity:** Low (P3)
- **Priority:** P3
- **Affected File:** **src/components/HeroScene.jsx**
- **Location:** **:29,83-93**
- **Evidence:** prefers-reduced-motion mencegah rotasi dan pointer listener, tetapi animateFrame tetap memanggil renderer.render dan requestAnimationFrame berulang kali. Komponen hanya aktif jika pointer fine dan lebar viewport minimal 900 px (**HeroScene.jsx:16-22**).
- **Root Cause:** Reduced motion menghentikan transformasi, tetapi tidak menghentikan frame loop.
- **Impact:** GPU/CPU tetap dipakai untuk menggambar objek statis pada layar lebar dengan pointer halus; biaya baterai/performa aktual belum diukur.
- **Exploitability / Trigger Condition:** Browser memilih reduced motion, pointer fine tersedia, viewport minimal 900 px, dan komponen HeroScene dirender.
- **Recommended Fix:** Render satu frame statis lalu hentikan requestAnimationFrame saat reduced motion aktif.
- **Alternative Fix:** Hentikan loop saat tab tersembunyi dan mulai kembali saat terlihat.
- **Regression Risk:** Resize canvas atau perubahan tema perlu tetap memicu render baru.
- **Verification:** Profil browser dengan reduced motion; pastikan frame loop berhenti dan scene tetap tampil.

### PERF-003 — Endpoint koleksi membaca semua baris tanpa pagination

- **Category:** Performance
- **Validation Status:** Confirmed query tanpa batas; bottleneck belum terukur.
- **Severity:** Belum ditetapkan.
- **Priority:** P3 jika volume bertambah.
- **Affected File:** **server/routes/data.js**
- **Location:** **:25-45**
- **Evidence:** Query SELECT * tidak memakai LIMIT/cursor untuk koleksi skills, projects, experience, dan project_tags.
- **Root Cause:** API dirancang untuk dataset kecil CMS dan belum membatasi ukuran respons.
- **Impact:** Waktu query, payload, dan penggunaan memori bertambah linear dengan jumlah baris.
- **Exploitability / Trigger Condition:** Konten bertambah besar atau endpoint publik dipanggil berulang.
- **Recommended Fix:** Tetapkan batas/cursor pagination atau batas domain yang eksplisit setelah ukuran data aktual dipastikan.
- **Alternative Fix:** Cache snapshot publik dengan TTL dan invalidasi pada update admin.
- **Regression Risk:** Pagination dapat mengubah kontrak frontend yang saat ini mengharapkan semua item.
- **Verification:** Ukur query/response pada dataset realistis bertingkat; pastikan sorting dan filter UI tetap benar.

### PERF-004 — Gallery aplikasi sumur-creative memuat gambar eksternal tanpa lazy loading

- **Category:** Performance
- **Validation Status:** Potential; aplikasi nested tidak terhubung ke deployment root.
- **Severity:** Belum ditetapkan.
- **Priority:** P3 jika app dipakai.
- **Affected File:** **sumur-creative/src/components/HomeView.tsx** dan komponen view lain
- **Location:** Hero **:38-42**; gallery **:257-272**
- **Evidence:** Beberapa gambar remote dipasang tanpa loading=lazy/fetch priority. Root Docker hanya menyalin src/ root dan tidak membangun sumur-creative.
- **Root Cause:** Asset pihak ketiga dalam gallery tidak dibatasi pemuatan sesuai viewport.
- **Impact:** Jika nested app diterbitkan, request gambar di bawah fold dapat bersaing dengan hero dan menambah transfer awal. Tidak ada metrik LCP.
- **Exploitability / Trigger Condition:** Aplikasi nested dijalankan atau diterbitkan secara terpisah.
- **Recommended Fix:** Lazy-load gambar di bawah fold dan prioritaskan hanya gambar hero.
- **Alternative Fix:** Host image yang diperlukan secara lokal dan hasilkan ukuran responsif.
- **Regression Risk:** Lazy load terlalu agresif dapat menampilkan placeholder saat scroll cepat.
- **Verification:** Jalankan app nested di browser dan ukur waterfall serta LCP pada viewport mobile.

### PERF-005 — Compose tidak menetapkan batas CPU/memori per service

- **Category:** Performance / Infrastructure
- **Validation Status:** Needs Validation; batas cgroup Proxmox/Docker host dapat berlaku di luar repository.
- **Severity:** Belum ditetapkan.
- **Priority:** P3.
- **Affected File:** **compose.yaml**, **docs/superpowers/specs/2026-10-24-proxmox-lxc-traefik-profile-deployment-design.md**
- **Location:** Definisi services **compose.yaml:3-50** tidak menetapkan resource limits; dokumen menyebut LXC target dan resource baseline.
- **Evidence:** Compose mengatur restart, healthcheck, dan volume, tetapi tidak menentukan limit CPU/memori untuk app atau Postgres. Tidak ada pengukuran konsumsi aktual.
- **Root Cause:** Resource governance diserahkan pada konfigurasi host/LXC tanpa baseline atau batas service yang terdokumentasi di repo.
- **Impact:** Jika proses Node/Postgres tumbuh atau menerima burst request, satu service dapat menghabiskan porsi resource LXC dan memengaruhi service lain. Belum ada bukti kejadian atau bottleneck.
- **Exploitability / Trigger Condition:** Beban tinggi, kebocoran resource, atau request burst terjadi dan host tidak menerapkan batas efektif.
- **Recommended Fix:** Ukur memory/CPU baseline dan peak pada staging LXC; tetapkan reservation/limits yang sesuai dengan total RAM/CPU host dan kebutuhan Postgres.
- **Alternative Fix:** Pertahankan batas hanya di Proxmox cgroup, tetapi dokumentasikan dan alarm-kan limit efektif per workload.
- **Regression Risk:** Limit terlalu rendah dapat menyebabkan OOM kill dan restart loop.
- **Verification:** Jalankan beban realistis pada staging; pantau container stats, OOM events, healthcheck, dan response latency.

### Catatan pengukuran performa

Tidak ada hasil pengukuran LCP, INP, CLS, CPU, memory, throughput, atau load test; laporan ini tidak menyatakan bottleneck runtime terkonfirmasi. Aset lokal yang diperiksa berukuran sekitar 16 KB untuk hero.png dan 176 KB untuk ppTama.jpeg, tetapi ukuran bundle produksi tidak diukur karena build akan menulis dist. Komponen proyek utama sudah memakai loading=lazy untuk gambar dan memuat Three.js secara dinamis.

## E. Architecture & Code Quality Findings

### ARCH-001 — README, konfigurasi Vercel, dan deployment aktif tidak selaras

- **Category:** Architecture
- **Validation Status:** Confirmed drift dokumentasi/config; deployment Vercel aktual belum diketahui.
- **Severity:** Informational (P4)
- **Priority:** P4
- **Affected File:** **README.md**, **vercel.json**, **docs/superpowers/specs/2026-10-24-proxmox-lxc-traefik-profile-deployment-design.md**, **server/**, **src/**
- **Location:** README **:12-18,48-108**; Vercel rewrite **vercel.json:2-11**; spesifikasi aktif **design document:11-22**.
- **Evidence:** README masih menjelaskan Supabase, OpenRouter, Vercel, dan file /api. Source saat ini menggunakan Express/PostgreSQL lokal, root folder api/ tidak ada, ChatAI tidak aktif, dan GitHub Actions membangun Docker. Vercel rewrite menunjuk ke api/chat.js yang tidak ada di tree. Audit lama **opt/AUDIT-KEAMANAN.md** juga masih mengacu pada file runtime lama.
- **Root Cause:** Dokumentasi migrasi belum diselesaikan setelah perubahan arsitektur.
- **Impact:** Developer dapat mengikuti setup yang tidak menjalankan API/database yang dipakai frontend; threat model lama dapat dianggap masih aktif.
- **Exploitability / Trigger Condition:** Developer mengikuti README untuk deploy ke Vercel atau mengandalkan audit lama.
- **Recommended Fix:** Pilih deployment yang didukung, lalu selaraskan README, env var, vercel.json, dan audit historis.
- **Alternative Fix:** Tandai dokumentasi lama sebagai arsip dan dokumentasikan bahwa hanya Compose/self-hosted deployment yang didukung.
- **Regression Risk:** Perubahan dokumen/config dapat menghilangkan jalur deployment alternatif yang masih dibutuhkan.
- **Verification:** Ikuti setup terdokumentasi pada lingkungan bersih dan pastikan seluruh endpoint data/admin dapat diakses di deployment yang disebut.

### ARCH-002 — SQL bootstrap terduplikasi dan tidak ada migration runner untuk database persisten

- **Category:** Architecture
- **Validation Status:** Confirmed.
- **Severity:** Low (P3)
- **Priority:** P3
- **Affected File:** **database/01-init.sql**, **database/init.sql**, **database/02-seed.sql**, **database/seed.sql**, **compose.yaml**
- **Location:** Mount SQL **compose.yaml:12-14**; schema/seed file masing-masing.
- **Evidence:** Pemeriksaan byte comparison menunjukkan 01-init.sql identik dengan init.sql dan 02-seed.sql identik dengan seed.sql. Compose memasang seluruh folder database ke entrypoint init Postgres. Entry point image hanya menjalankan file tersebut saat data directory baru diinisialisasi; tidak ditemukan migration runner.
- **Root Cause:** Dua salinan bootstrap masih dipertahankan dan tidak ada proses migration eksplisit untuk volume yang telah ada.
- **Impact:** Perubahan schema dapat tertinggal pada volume persisten; duplikasi menimbulkan ambiguitas dan seed mengulang operasi yang sama saat database baru dibuat.
- **Exploitability / Trigger Condition:** Deploy schema baru ke volume database lama tanpa langkah migration.
- **Recommended Fix:** Pertahankan satu bootstrap baseline dan tambahkan migration bernomor/runner yang berjalan idempotent pada deploy.
- **Alternative Fix:** Jalankan migration manual melalui prosedur release terdokumentasi dengan pemeriksaan versi schema.
- **Regression Risk:** Menghapus salinan SQL tanpa memastikan file mana yang menjadi baseline dapat mengubah perilaku provisioning baru.
- **Verification:** Provision database kosong dan volume lama pada staging; pastikan schema sesuai versi aplikasi dan seed tidak mengubah kredensial yang sudah disetel.

### ARCH-003 — sumur-creative merupakan aplikasi kedua tanpa lockfile dan tidak masuk pipeline

- **Category:** Architecture
- **Validation Status:** Confirmed.
- **Severity:** Informational (P4)
- **Priority:** P4
- **Affected File:** **sumur-creative/package.json**, seluruh **sumur-creative/src/**, **Dockerfile**, **package-lock.json**
- **Location:** Manifest nested **:1-35**; root Docker hanya menyalin **src/** root **Dockerfile:11-15,32-34**.
- **Evidence:** Nested app memakai React/TypeScript, manifest sendiri, dan script sendiri; tidak ditemukan package-lock/yarn/pnpm lockfile di foldernya dan tidak dibangun oleh root Docker/CI. npm audit root tidak mencakup dependency manifest nested tersebut.
- **Root Cause:** Prototype/app kedua berada di repository yang sama tanpa workspace atau lifecycle build/dependency terdefinisi.
- **Impact:** Status dukungan, dependency aktual, reproducibility, dan cakupan audit nested app tidak jelas.
- **Exploitability / Trigger Condition:** Nested app digunakan atau diterbitkan terpisah.
- **Recommended Fix:** Tentukan apakah nested app aktif; jika ya, beri lockfile, CI dan audit sendiri; jika arsip, dokumentasikan status dan isolasi workflow.
- **Alternative Fix:** Pindahkan ke repository terpisah jika lifecycle dan pemilikannya berbeda.
- **Regression Risk:** Mengubah struktur dapat mengganggu rujukan lokal atau demo yang belum tercatat.
- **Verification:** Pastikan pipeline yang dipilih membangun dan mengaudit app yang memang didukung.

### ARCH-004 — Modul frontend nonaktif masih berada di source tree

- **Category:** Architecture
- **Validation Status:** Confirmed tidak aktif; alasan produk belum diketahui.
- **Severity:** Informational (P4)
- **Priority:** P4
- **Affected File:** **src/App.jsx**, **src/sections/ChatAI.jsx**, **src/components/ChatTicker.jsx**, **src/components/PostList.jsx**
- **Location:** Import/JSX yang dikomentari di **src/App.jsx:6-8,22-25**; ChatAI return null di **ChatAI.jsx:1-4**; PostList tidak memiliki import aktif.
- **Evidence:** Area chat dinonaktifkan pada UI utama dan file terkait masih tertinggal. Spesifikasi deployment menyatakan area AI dinonaktifkan.
- **Root Cause:** Kode lama belum dihapus atau diberi status arsip setelah fitur dinonaktifkan.
- **Impact:** Menambah permukaan pemeliharaan dan dapat membingungkan dokumentasi/security review berikutnya.
- **Exploitability / Trigger Condition:** Developer menganggap modul tersebut masih aktif atau mengaktifkannya kembali tanpa memvalidasi API terkait.
- **Recommended Fix:** Putuskan status modul lalu hapus/arsipkan dengan jelas setelah dependensi dan rujukan diverifikasi.
- **Alternative Fix:** Pertahankan sebagai backlog tetapi dokumentasikan bahwa kode tidak aktif dan tidak tercakup runtime.
- **Regression Risk:** Penghapusan terlalu cepat dapat menghilangkan fitur yang direncanakan untuk diaktifkan kembali.
- **Verification:** Setelah keputusan, telusuri import/build graph dan pastikan UI/deployment sesuai scope produk.

### ARCH-005 — Beberapa kontrol interaktif memiliki semantik keyboard/modal yang tidak lengkap

- **Category:** Architecture / Accessibility
- **Validation Status:** Confirmed pada markup; perilaku browser/screen reader belum diuji.
- **Severity:** Low (P3)
- **Priority:** P3
- **Affected File:** **src/sections/Projects.jsx**, **src/components/Button.jsx**, **src/components/WelcomeModal.jsx**, **src/sections/Contact.jsx**, beberapa komponen **sumur-creative/src/components/**
- **Location:** Anchor membungkus button **Projects.jsx:116-124** dan Button merender button **Button.jsx:18-27**; modal plain div **WelcomeModal.jsx:20-24**, **Contact.jsx:75-80**, nested modal **ArtworkModal.tsx:20-29**/**TeamModal.tsx:20-29**; tile klik nested **HomeView.tsx:119-125,257-265**.
- **Evidence:** Beberapa modal tidak memiliki role/dialog semantics, focus management, atau Escape handling. Tile gallery menggunakan div/article dengan onClick tanpa keyboard semantics. Project links membungkus native button di dalam anchor.
- **Root Cause:** Interaksi mouse dibangun tanpa elemen/semantik native yang sesuai dan tanpa pola dialog accessible.
- **Impact:** Navigasi keyboard/screen reader bisa kehilangan konteks modal atau tidak dapat mengaktifkan tile; nested interactive controls menciptakan fokus/semantik ambigu.
- **Exploitability / Trigger Condition:** Pengguna mengandalkan keyboard atau assistive technology.
- **Recommended Fix:** Gunakan button/link native untuk aksi dan dialog yang fokusnya dikelola; tambahkan Escape, focus return, dan background inert.
- **Alternative Fix:** Terapkan role/tabIndex/keyboard handlers serta aria-modal dan manajemen fokus sesuai pola dialog.
- **Regression Risk:** Perubahan interaksi dapat mengubah urutan tab dan perilaku klik; harus diuji mouse, keyboard, dan screen reader.
- **Verification:** Uji Tab/Shift+Tab/Enter/Space/Escape, focus return, dan pembacaan modal dengan screen reader.

## F. Reliability Findings

### REL-001 — Setup npm lokal tidak memuat .env dan tidak menyediakan DATABASE_URL

- **Category:** Reliability / Configuration
- **Validation Status:** Confirmed pada script/config; nilai .env sengaja tidak dibaca.
- **Severity:** Low (P3)
- **Priority:** P3
- **Affected File:** **README.md**, **package.json**, **.env.example**, **server/db.js**
- **Location:** Langkah setup **README.md:34-44**; script **package.json:6-12**; contoh env; fallback DB **server/db.js:5-7**
- **Evidence:** README meminta membuat .env lalu menjalankan npm run dev, tetapi script menjalankan Node langsung tanpa dotenv dan tidak ada dependency dotenv root. .env.example berisi POSTGRES_* untuk Compose, bukan DATABASE_URL yang dibaca server/db.js. npm test yang dijalankan tanpa DATABASE_URL menggunakan fallback lokal dan health response menjadi degraded.
- **Root Cause:** Setup lokal Compose dan setup server langsung memakai dua kontrak konfigurasi berbeda.
- **Impact:** Konfigurasi .env lokal tidak otomatis diterapkan ke backend; server jatuh ke JWT/DB default dan aplikasi menunjukkan database disconnected.
- **Exploitability / Trigger Condition:** Developer memakai npm run dev/start sesuai README tanpa mengekspor env secara terpisah.
- **Recommended Fix:** Dokumentasikan satu setup lokal yang konsisten dan sediakan DATABASE_URL; pilih pemuat env eksplisit atau perintah shell yang mengekspor env dengan aman.
- **Alternative Fix:** Minta developer memakai Docker Compose untuk menjalankan app dan database, lalu dokumentasikan setup tersebut sebagai jalur utama.
- **Regression Risk:** Menambah env loader mengubah precedence antara shell environment dan file lokal.
- **Verification:** Pada checkout bersih, ikuti setup README dan pastikan health status ok serta JWT_SECRET non-default tanpa menampilkan nilainya.

### REL-002 — Test menerima health degraded sebagai sukses dan import server juga membuka port 3000

- **Category:** Reliability
- **Validation Status:** Confirmed, termasuk hasil run.
- **Severity:** Low (P3)
- **Priority:** P3
- **Affected File:** **test/server.test.js**, **server/index.js**, **package.json**
- **Location:** Test assert **test/server.test.js:7-16,26-28**; auto listen **server/index.js:78-82**; script test **package.json:11**
- **Evidence:** Test menganggap status ok maupun degraded sebagai sukses. Run audit menghasilkan health response status degraded/database disconnected, tetapi npm test tetap exit code 0 dan melaporkan lulus. Import server/index.js saat NODE_ENV bukan test juga memulai listener port 3000; test membuat listener kedua pada 3099. Workflow deploy tidak menjalankan test atau lint.
- **Root Cause:** Test health tidak mensyaratkan database sehat dan module import memiliki side effect listener.
- **Impact:** CI/manual test dapat menyatakan deploy sehat saat database mati; test bisa gagal karena port 3000 terpakai atau memulai server tak terduga.
- **Exploitability / Trigger Condition:** Database tidak tersedia atau port 3000 dipakai saat npm test.
- **Recommended Fix:** Pisahkan app factory dari server startup, hanya listen pada entrypoint, dan jadikan status health yang diharapkan eksplisit. Tambahkan test/lint gate pada workflow setelah stabil.
- **Alternative Fix:** Jalankan test dengan env test khusus dan mock dependency, sambil tetap mencegah import memulai listener.
- **Regression Risk:** Mengubah test contract dapat mengungkap asumsi test lama; startup refactor perlu memastikan Docker entrypoint tetap mendengarkan port yang sama.
- **Verification:** Jalankan test saat database sengaja tidak tersedia dan pastikan gagal; jalankan saat database test tersedia dan pastikan tidak membuka port 3000 tambahan.

### REL-003 — updated_at tidak berubah ketika data CMS diperbarui

- **Category:** Reliability
- **Validation Status:** Confirmed pada skema dan update route.
- **Severity:** Low (P3)
- **Priority:** P3
- **Affected File:** **database/01-init.sql**, **server/routes/data.js**
- **Location:** Kolom updated_at pada schema mis. **database/01-init.sql:27,43,74,103**; route membuang updated_at dan tidak mengisinya **server/routes/data.js:101-120**
- **Evidence:** Kolom mempunyai DEFAULT NOW() saat insert tetapi tidak ditemukan trigger update. Handler PUT menghapus updated_at dari patch lalu menjalankan UPDATE tanpa mengubah kolom tersebut.
- **Root Cause:** Timestamp disediakan sebagai default insert, tetapi tidak ada trigger atau logic update.
- **Impact:** Metadata waktu modifikasi tetap menunjukkan nilai lama setelah edit konten.
- **Exploitability / Trigger Condition:** Setiap update melalui API data.
- **Recommended Fix:** Set updated_at = NOW() pada update untuk tabel yang memilikinya atau tambahkan trigger database terpusat.
- **Alternative Fix:** Hapus kolom jika tidak digunakan dan tidak dijanjikan oleh API.
- **Regression Risk:** Panel/automation yang mengandalkan timestamp bisa melihat perubahan yang sebelumnya tidak terlihat.
- **Verification:** Update record pada staging dan pastikan updated_at berubah serta created_at tidak berubah.

### REL-004 — Form kontak hanya simulasi dan membuang pesan setelah submit

- **Category:** Reliability / Functional
- **Validation Status:** Confirmed perilaku; apakah ini defect bergantung pada ekspektasi produk.
- **Severity:** Belum ditetapkan.
- **Priority:** P3.
- **Affected File:** **src/sections/Contact.jsx**
- **Location:** Handler **:14-22**; form **:35-70**
- **Evidence:** Submit mencegah default, menulis nama/email/pesan ke console browser, menampilkan pesan bahwa fitur masih demo, lalu mengosongkan form. Tidak ada fetch atau penyimpanan pesan.
- **Root Cause:** UI kontak belum terhubung ke delivery service dan perilaku demo tidak mengirim data.
- **Impact:** Jika pengunjung mengira form aktif, pesan tidak diterima. Data yang diketik juga tertinggal pada console lokal.
- **Exploitability / Trigger Condition:** Pengunjung mengirim form.
- **Recommended Fix:** Jika form memang channel kontak, sambungkan endpoint/service dan jangan log body; jika tidak, ubah UI agar jelas bahwa form belum mengirim.
- **Alternative Fix:** Arahkan ke mailto atau kanal kontak yang sudah tersedia.
- **Regression Risk:** Mengaktifkan delivery membawa kebutuhan spam protection, validasi, privasi, dan penanganan kegagalan baru.
- **Verification:** Submit form pada staging; pastikan pesan benar-benar sampai atau UI secara eksplisit menyatakan simulasi dan tidak menampilkan klaim terkirim.

### REL-005 — npm run lint gagal sebelum ESLint memeriksa source

- **Category:** Reliability / Dependency Configuration
- **Validation Status:** Confirmed, termasuk hasil run.
- **Severity:** Low (P3)
- **Priority:** P3
- **Affected File:** **package.json**, **package-lock.json**, **eslint.config.js**
- **Location:** Override **package.json:33-35**; minimatch/brace-expansion di lockfile **:1376-1377,3161-3162**; ESLint glob config **eslint.config.js:5**
- **Evidence:** npm run lint exit code 2 dengan TypeError “expand is not a function”. Lockfile memasang minimatch 3.1.5 dan brace-expansion 5.0.9 akibat override brace-expansion >=5.0.7. minimatch 3 memanggil require('brace-expansion') sebagai fungsi, sedangkan versi terkunci mengekspor object. Versi tersebut juga masih dalam rentang advisory brace-expansion sebelum 5.0.12.
- **Root Cause:** Override dependency terlalu luas dan memaksa API major baru ke pemanggil yang mengharapkan ekspor lama.
- **Impact:** Lint tidak berjalan sehingga kualitas source tidak tervalidasi; package override juga tidak menjamin versi yang sudah ditambal advisory.
- **Exploitability / Trigger Condition:** Menjalankan npm run lint pada lockfile/dependency yang terpasang saat ini.
- **Recommended Fix:** Ganti override dengan versi kompatibel yang ditambal atau update parent dependency ke versi yang mendukung API baru.
- **Alternative Fix:** Hapus override dan gunakan resolusi yang disepakati dependency tree setelah audit advisory.
- **Regression Risk:** Resolusi lockfile berubah; perlu npm ci dan audit kompatibilitas seluruh tooling.
- **Verification:** npm ci pada checkout bersih, jalankan lint sampai ESLint benar-benar memproses file, lalu jalankan npm audit ulang.

### REL-006 — Graceful shutdown dan rotasi log tidak ditentukan pada repository

- **Category:** Reliability / Infrastructure
- **Validation Status:** Needs Validation; konfigurasi Docker daemon host dapat menyediakan rotasi di luar Compose.
- **Severity:** Belum ditetapkan.
- **Priority:** P3.
- **Affected File:** **server/index.js**, **server/db.js**, **compose.yaml**
- **Location:** Server listen tanpa handler signal **server/index.js:78-82**; pool **server/db.js:9-18**; Compose services **compose.yaml:3-50** tidak mendefinisikan logging options.
- **Evidence:** Tidak ditemukan drain/close server atau pool.end saat SIGTERM. Compose tidak menetapkan konfigurasi max-size/max-file; daemon logging configuration aktual tidak tersedia.
- **Root Cause:** Penghentian proses dan lifecycle log bergantung pada perilaku default container/host.
- **Impact:** Redeploy dapat menghentikan request aktif tanpa drain, dan log dapat memenuhi storage jika daemon host tidak mengaktifkan rotasi. Kedua kondisi runtime belum dibuktikan.
- **Exploitability / Trigger Condition:** Deployment/restart terjadi saat ada request aktif atau logging terus bertambah tanpa rotasi efektif.
- **Recommended Fix:** Tambahkan shutdown handler yang berhenti menerima request, menunggu request aktif, lalu menutup pool. Tetapkan rotasi log di Compose atau validasi kebijakan daemon host.
- **Alternative Fix:** Kelola shutdown dan logging melalui supervisor/host policy dengan batas dan health checks yang teruji.
- **Regression Risk:** Timeout shutdown terlalu pendek dapat memutus request; menunggu terlalu lama dapat memperlambat deploy.
- **Verification:** Pada staging, kirim SIGTERM saat ada request uji dan pastikan drain/pool close berhasil; periksa log rotation dan storage setelah melewati ukuran limit.

## G. Dependency & Configuration Findings (snapshot sebelum remediation)

### Hasil dependency dan konfigurasi

- **npm audit root:** 18 entri package terdampak menurut npm registry: 4 critical, 5 high, 9 moderate. Ini mencakup package development dan production; angka tersebut bukan jumlah exploit aplikasi.
- **npm audit --omit=dev:** 2 entri critical, solid-js dan seroval. Tidak ditemukan pemanggilan API seroval rentan di source root. Perlakukan sebagai dependency exposure yang perlu divalidasi, bukan bug runtime terkonfirmasi.
- **Development tree:** concurrently/shell-quote mendapat critical advisory; package manifest memakai perintah statis untuk npm run dev, sehingga jalur command injection dari input pengguna tidak ditemukan. Vite 8.1.5 juga flagged, tetapi advisory yang diperiksa terkait dev tooling/Windows atau dev server dan build root bukan server publik.
- **Nested app:** sumur-creative tidak memiliki lockfile; dependency audit root tidak mencakup package manifest tersebut. Tidak ada instalasi dependency atau audit nested yang memerlukan resolve/install dilakukan.
- **Secret handling:** .gitignore mengecualikan .env/.env.* kecuali .env.example. Git hanya melacak contoh environment. File .env lokal ada, tetapi nilainya sengaja tidak dibaca. Tidak ada nilai rahasia yang disalin ke laporan.
- **Configuration:** Compose menggunakan fallback untuk password database dan JWT. Nilai fallback disamarkan; file environment production, secret manager, firewall, dan state seed database tidak tersedia.
- **CI:** workflow deploy build image, deploy, lalu health check. Workflow tidak menjalankan npm test atau npm run lint. Build validation berjalan saat deploy karena Dockerfile memanggil npm run build, tetapi build tidak dijalankan terpisah pada audit ini.

## H. Risk Prioritization (snapshot sebelum remediation)

| Urutan | Finding ID | Prioritas | Alasan ringkas |
|---:|---|---|---|
| 1 | SEC-001 | P1 | Jika JWT fallback masih dipakai, seluruh proteksi Bearer dapat dilewati. Periksa deployment tanpa menampilkan nilai secret. |
| 2 | SEC-002 | P1 | Database baru dengan password seed belum dirotasi membuka CMS admin. |
| 3 | SEC-003 | P2 | Stored XSS menyebar ke pengunjung; perlu hak tulis CMS saat ini. |
| 4 | SEC-004 | P2 | Skema URL aktif diterima dan berjalan setelah klik pengunjung. |
| 5 | SEC-005 | P2 | Login dapat dicoba berulang; dibutuhkan proteksi rate limit. |
| 6 | SEC-006 | P2 | Token curian bertahan sampai tujuh hari meski logout. |
| 7 | SEC-010 | P2 | Role DB default meningkatkan dampak kompromi aplikasi/query. |
| 8 | SEC-007, SEC-008, SEC-009, SEC-012, SEC-013, SEC-014, SEC-015, SEC-016, SEC-017, PERF-005, REL-006 | Investigasi P2/P3 | Validasi database/browser/deployment/dependency/resource diperlukan sebelum severity aplikasi ditetapkan. |
| 9 | REL-001, REL-002, REL-005 | P3 | Setup lokal dan quality gates memberi status yang salah atau tidak berjalan. |
| 10 | SEC-011, PERF-001, PERF-002, PERF-003, PERF-004, ARCH-002, ARCH-005, REL-003, REL-004 | P3 | Error detail, efisiensi, aksesibilitas, metadata, serta alur kontak perlu ditangani sesuai penggunaan fitur. |
| 11 | ARCH-001, ARCH-003, ARCH-004 | P4 | Kejelasan dokumentasi, app nested, dan modul nonaktif. |

Tidak ada CVSS aplikasi yang ditetapkan karena exposure internet, environment runtime, akun admin aktif, dan lapisan proxy belum dapat diperiksa. Angka CVSS 9.8 pada SEC-014 adalah nilai upstream advisory, bukan severity aplikasi.

## I. Recommended Remediation Plan dari audit awal

1. **Validasi deployment tanpa mengungkap secret:** pastikan JWT_SECRET bukan fallback, password admin sudah dirotasi, role DB runtime tidak superuser, port 3000 hanya dapat dijangkau jalur yang dimaksud, hop ingress sesuai trust boundary, dan backup database/upload tersedia. Ini memvalidasi SEC-001, SEC-002, SEC-010, SEC-012, dan SEC-017.
2. **Amankan konten/navigasi/upload:** sanitasi About, allowlist URL, verifikasi MIME/isi file dan ekstensi, tambah quota/cleanup. Rujuk SEC-003, SEC-004, SEC-008, SEC-009.
3. **Perkuat autentikasi dan API:** rate limit login, kebijakan password, revocation token, allowlist field SQL, batas body request, dan error response generik. Rujuk SEC-005 sampai SEC-007, SEC-011, dan SEC-015.
4. **Putuskan status legacy:** konfirmasi apakah Supabase/Vercel masih didukung sebelum mengubah policy atau konfigurasi lama. Rujuk SEC-013 dan ARCH-001.
5. **Pulihkan quality gates dan dependency:** betulkan dependency override/lint, validasi jalur advisory dan pembaruan yang ditambal, buat test health gagal saat database unavailable, jalankan lint/test di CI. Rujuk SEC-014, REL-002, dan REL-005.
6. **Rapikan reliability/maintainability dan aksesibilitas:** konfigurasi local .env, migrasi DB, updated_at, alur kontak, shutdown/log rotation, pola dialog/keyboard, modul nonaktif, dan aplikasi nested. Jika nested app dipakai, bind dev server ke localhost. Rujuk REL-001, REL-003, REL-004, REL-006, SEC-016, ARCH-002 sampai ARCH-005.
7. **Optimasi setelah pengukuran:** ukur request count, reduced-motion render loop, ukuran bundle/CWV, data volume, kebutuhan pagination, dan CPU/memori service. Rujuk PERF-001 sampai PERF-005.

Pada tahap snapshot audit awal, belum ada perbaikan. Pengguna kemudian menyetujui remediation seluruh temuan; hasil dan status tiap Finding ID dicatat di Bagian L.

## J. Testing & Verification Plan pada snapshot audit awal

Pemeriksaan yang sudah dijalankan:

| Pemeriksaan | Hasil |
|---|---|
| npm run lint | Gagal sebelum analisis source: TypeError dari pemanggilan brace-expansion/minimatch. |
| npm test | Exit 0, tetapi health response degraded/database disconnected tetap dianggap lulus; test juga memulai listener port 3000 dan 3099. |
| npm audit --json | 18 entri advisory pada lockfile root: 4 critical, 5 high, 9 moderate. |
| npm audit --omit=dev --json | 2 entri critical: solid-js dan seroval. |
| Build Vite | Tidak dijalankan karena npm run build menulis dist; pengguna mensyaratkan persetujuan jika pemeriksaan dapat mengubah file. |
| Browser, Proxmox, DB staging, load/CWV | Tidak dijalankan; tidak tersedia target staging/browser measurement dan tidak ada pengujian pada layanan publik. |

Setelah remediation disetujui, verifikasi yang disarankan:

- Jalankan tes auth dengan JWT_SECRET hilang, kuat, dan rotasi; pastikan token lama ditolak.
- Uji bootstrap database kosong tanpa kredensial admin bersama; uji role runtime dengan privilege minimum.
- Uji stored XSS/URL/upload di environment lokal terisolasi; jangan jalankan payload pada production.
- Uji SQL identifier secara terisolasi sebelum menyatakan SQL injection terkonfirmasi.
- Pastikan status health gagal pada DB disconnected dan workflow tidak deploy bila lint/test gagal.
- Jalankan npm ci, npm audit, lint, unit/integration test, dan build pada checkout bersih setelah dependency/config disetujui.
- Lakukan pemeriksaan response security headers, browser keyboard/screen reader, network waterfall, dan CWV di staging.
- Uji migration pada database kosong dan salinan volume lama sebelum deployment.

## K. Limitations & Open Questions pada snapshot audit awal

- Nilai .env lokal tidak dibaca; environment production, secret store, database aktif, akun admin, dan policy ingress/firewall tidak dapat diakses.
- Status exposure publik port 3000 tidak bisa ditetapkan dari mapping Compose saja; konfigurasi jaringan host/LXC perlu diverifikasi.
- SQL Supabase dan Vercel config tampak legacy berdasarkan source/runtime serta spesifikasi deployment, tetapi status layanan eksternal aktual tidak diketahui.
- npm audit mencatat versi terdampak, tetapi exploitability advisory seroval/build tooling terhadap bundel aktif belum dibuktikan.
- Tidak ada pengukuran bundle produksi, LCP/INP/CLS, CPU/memory, query latency, jumlah data, atau kapasitas volume.
- Build tidak dijalankan karena menulis dist. Test yang dijalankan hanya merupakan test script yang ada; tidak ada test baru ditambahkan.
- Nested sumur-creative tidak memiliki lockfile dan belum dipasang/di-audit secara independen.
- Working tree sebelum audit sudah berisi penghapusan **docs/LXC-10018-SETUP.md** dan file belum terlacak **docs/HOMELAB-SSOT.md**. Perubahan tersebut dipertahankan dan tidak dimasukkan ke deliverable audit.

### Temuan yang tidak terbukti / false positive yang ditolak

- **SQL injection melalui nilai** tidak ditemukan: nilai query memakai parameter PostgreSQL. Yang masih perlu diperiksa hanya identifier kolom dari key JSON (SEC-007).
- **SQL injection pada nama collection** tidak ditemukan: nama tabel dibatasi allowlist eksplisit.
- **Path traversal upload** tidak terbukti: nama file yang disimpan memakai prefix acak dan tidak memakai path asli sebagai lokasi.
- **CSRF konvensional** tidak ditemukan pada jalur saat ini: admin memakai Bearer token eksplisit, bukan cookie yang dikirim otomatis. CORS default terbuka tetap perlu dibatasi sesuai origin jika API privat.
- **SSRF/command injection pada backend aplikasi** tidak ditemukan dari source aktif yang diperiksa; tidak ada request server-side ke URL pengguna atau shell execution pada route.
- Claim keamanan pada audit lama untuk endpoint API chat/Supabase tidak dianggap aktif karena file/runtime tersebut tidak ditemukan atau tidak dipakai oleh root app saat ini. Temuan XSS yang juga masih ada di source aktif dinilai ulang secara terpisah pada SEC-003/SEC-004.

## L. Remediation dan verifikasi terbaru

Pengguna meminta remediation seluruh temuan setelah laporan baseline dibuat. Bagian ini mencatat perubahan yang sudah diterapkan dan keadaan validasi terbaru. Perubahan hanya dilakukan pada workspace; deployment production, database aktif, kebijakan Supabase, volume upload production, firewall, serta nilai `.env` tidak diakses atau diubah.

### Temuan tambahan saat remediation

#### SEC-018 — Prompt privat ikut terekspos pada endpoint pengaturan publik

- **Category:** Security.
- **Validation Status:** Confirmed pada kode baseline; proyeksi publik sudah diperbaiki.
- **Severity:** Low (P3); isi prompt dan sensitivitas nilai production tidak diketahui.
- **Affected File:** `server/routes/data.js`, `database/01-init.sql`, `test/server.test.js`.
- **Location:** Query publik baseline pada handler `site_settings`; kolom `ai_system_prompt` ada pada schema.
- **Evidence:** Handler baseline memakai `SELECT * FROM site_settings` untuk permintaan publik, sementara schema memuat kolom privat `ai_system_prompt`. Test saat ini memastikan query publik memakai proyeksi eksplisit dan tidak menyertakan kolom tersebut; request `includePrivate=true` memerlukan autentikasi.
- **Root Cause:** API mengembalikan semua kolom tabel tanpa pemisahan field publik dan privat.
- **Impact:** Isi prompt internal dapat dibaca tanpa login jika nilainya disimpan pada row pengaturan.
- **Exploitability / Trigger Condition:** Pemanggil mengakses endpoint publik saat kolom tersebut berisi data.
- **Recommended Fix:** Gunakan proyeksi kolom publik eksplisit dan jalur terautentikasi terpisah untuk konfigurasi privat; perubahan ini sudah diterapkan.
- **Alternative Fix:** Pindahkan rahasia/config privat ke tabel atau secret store yang tidak pernah diekspos melalui API konten publik.
- **Regression Risk:** Panel admin harus memakai jalur privat untuk menjaga kompatibilitas pengaturan internal.
- **Verification:** Test mock memeriksa SQL publik dan respons tanpa autentikasi; validasi data production tidak dilakukan.
- **Priority:** Sudah diperbaiki pada source; tinjau isi konfigurasi production saat akses tersedia.

#### SEC-019 — bcrypt mengabaikan byte password setelah batas 72 byte

- **Category:** Security.
- **Validation Status:** Confirmed pada perilaku bcrypt dan batas input baseline; aturan input sudah diperketat.
- **Severity:** Low (P3).
- **Affected File:** `server/auth.js`, `scripts/create-admin.js`, `src/admin/panels/AccountPanel.jsx`, `test/server.test.js`.
- **Location:** Validasi password pada account update dan bootstrap admin.
- **Evidence:** Pemeriksaan lokal bcryptjs menunjukkan password sepanjang 73 byte dan varian dengan byte tambahan menghasilkan kecocokan hash yang sama karena bcrypt hanya memproses 72 byte. Jalur lama menerima password lebih panjang dari batas tersebut.
- **Root Cause:** Panjang karakter JS digunakan tanpa memperhitungkan batas byte yang diterapkan bcrypt.
- **Impact:** Sufiks password setelah byte ke-72 tidak menambah kekuatan; pengguna dapat mengira bagian tersebut melindungi akun padahal tidak ikut diverifikasi.
- **Exploitability / Trigger Condition:** Admin membuat password lebih dari 72 byte dan penyerang mengetahui atau menebak 72 byte pertama.
- **Recommended Fix:** Terapkan minimal 14 code point dan maksimal 72 byte UTF-8 secara konsisten di UI, API, dan bootstrap; hash baru memakai cost 12. Perubahan ini sudah diterapkan.
- **Alternative Fix:** Gunakan algoritme password hashing dengan pre-hashing yang terdefinisi dan migrasi kredensial secara terencana.
- **Regression Risk:** Password lama yang melampaui batas perlu direset; validasi baru menolak nilai yang sebelumnya diterima.
- **Verification:** Test API menolak input di bawah minimum dan input 74 byte UTF-8; test bootstrap dan UI mengikuti batas yang sama.
- **Priority:** Source sudah diperbaiki; tinjau/reset kredensial admin lama saat operasi database tersedia.

#### SEC-020 — Batas login per email dapat mengunci admin dari IP lain

- **Category:** Security.
- **Validation Status:** Confirmed pada implementasi baseline; mitigasi source dan regression test sudah diterapkan.
- **Severity:** Medium (P2) sebelum perbaikan; exposure endpoint production tetap perlu verifikasi.
- **Affected File:** `server/auth.js`, `server/index.js`, `compose.yaml`, `test/server.test.js`.
- **Location:** Middleware login rate limit dan endpoint `POST /api/auth/login`.
- **Evidence:** Baseline memblokir semua request untuk satu email setelah 10 percobaan selama 15 menit. Request dari banyak IP yang mengetahui email admin dapat menghabiskan bucket tersebut dan membuat login benar menerima 429. Kini limiter hanya menggunakan IP klien; test membuktikan 10 percobaan salah dari satu IP dibatasi, sedangkan percobaan dari IP lain tidak mengunci login admin yang benar.
- **Root Cause:** Hard lockout diletakkan pada identifier akun yang dapat diketahui publik, bukan sumber request.
- **Impact:** Penolakan layanan sementara pada login admin melalui percobaan terdistribusi.
- **Exploitability / Trigger Condition:** Endpoint dapat dijangkau dan penyerang mengirim percobaan untuk alamat email admin dari sumber yang cukup beragam.
- **Recommended Fix:** Hindari hard lockout per akun; gunakan limit per IP yang mengambil IP dari proxy tepercaya. Perbaikan source membatasi 10 percobaan per IP per 15 menit.
- **Alternative Fix:** Tambahkan progressive delay atau challenge yang tidak membuat kredensial benar ikut terkunci.
- **Regression Risk:** Jika proxy production tidak dipercaya dengan alamat yang tepat, semua pengunjung dapat berbagi bucket IP yang sama.
- **Verification:** Test memakai forwarded IP melalui proxy loopback yang eksplisit dan menguji percobaan lintas IP. Jalur Docker/Traefik production belum diverifikasi.
- **Priority:** Sudah diperbaiki di source; verifikasi nilai peer IP aktual dan `TRUSTED_PROXY_IPS` pada deployment.

#### PERF-006 — Workflow deployment mengirim `node_modules` melalui rsync

- **Category:** Performance / Reliability.
- **Validation Status:** Confirmed dari workflow baseline; pengecualian rsync sudah ditambahkan.
- **Severity:** Low (P3).
- **Affected File:** `.github/workflows/deploy.yml`.
- **Location:** Langkah rsync pada workflow deployment.
- **Evidence:** Workflow memasang dependency sebelum sinkronisasi dan baseline rsync tidak mengecualikan `node_modules`; direktori lokal yang diperiksa berukuran sekitar 154 MB. Workflow saat ini mengecualikan `node_modules`, `dist`, `dist-ssr`, dan `uploads`.
- **Root Cause:** Sinkronisasi source tidak membatasi artefak lokal yang semestinya dibuat pada image/build target atau disimpan di volume.
- **Impact:** Transfer dan penyalinan file deployment meningkat, deploy dapat lebih lambat dan menulis ulang file dependency yang tidak digunakan.
- **Exploitability / Trigger Condition:** Runner mempunyai dependency tree terpasang dan workflow menjalankan langkah rsync.
- **Recommended Fix:** Kecualikan dependency, output build, dan data upload persisten; perubahan ini sudah diterapkan.
- **Alternative Fix:** Bangun image di runner dan deploy image/artifact immutable.
- **Regression Risk:** Target harus tetap membangun image dari source dan mempertahankan volume upload yang ada.
- **Verification:** Review exclusion list workflow; eksekusi deployment sesungguhnya tidak dilakukan.
- **Priority:** Sudah diperbaiki di workflow.

#### REL-007 — Upgrade hash login dapat menimpa perubahan password bersamaan

- **Category:** Reliability / Security.
- **Validation Status:** Confirmed saat review remediation; compare-and-swap dan regression test sudah diterapkan.
- **Severity:** Low (P3); memerlukan login hash legacy dan perubahan password admin yang bersamaan.
- **Affected File:** `server/auth.js`, `test/server.test.js`.
- **Location:** Upgrade bcrypt hash cost 10 ke cost 12 setelah login berhasil.
- **Evidence:** Update baseline yang hanya memakai admin ID dapat menulis hash dari login yang sudah memverifikasi password lama setelah endpoint account menyimpan password baru. Query kini mencocokkan ID sekaligus hash lama (`WHERE id = $2 AND password_hash = $3`). Test mensimulasikan perubahan password pada saat upgrade, memastikan hash baru tidak tertimpa dan token login yang membaca session version lama ditolak.
- **Root Cause:** Penulisan upgrade hash tidak memastikan row masih berisi hash yang sebelumnya diverifikasi.
- **Impact:** Tanpa pemeriksaan atomik, password baru dapat tertimpa hash lama pada race sempit.
- **Exploitability / Trigger Condition:** Admin mengubah kredensial ketika login lama sedang meng-upgrade hash legacy.
- **Recommended Fix:** Gunakan compare-and-swap berdasarkan hash lama dan abaikan update jika row berubah; sudah diterapkan.
- **Alternative Fix:** Serialisasi semua perubahan credential dengan row lock/transaction pada database.
- **Regression Risk:** Login lama dapat selesai tetapi token ditolak jika perubahan kredensial bersamaan; pengguna harus login kembali dengan password terbaru.
- **Verification:** Test regression mock mengubah hash dan session version sebelum update rehash; assert password baru bertahan dan token lama mendapat 401.
- **Priority:** Sudah diperbaiki di source.

#### REL-008 — Filter migrator melewatkan seluruh file migration yang tersedia

- **Category:** Reliability / Deployment.
- **Validation Status:** Confirmed pada implementasi awal dan direproduksi oleh regression test; source sudah diperbaiki.
- **Severity:** Medium (P2) sebelum perbaikan.
- **Affected File:** `scripts/migrate.js`, `server/migrationFiles.js`, `database/migrations/*.sql`, `test/server.test.js`.
- **Location:** Filter nama file di `scripts/migrate.js`; dua nama file migration berawalan 12 digit.
- **Evidence:** Migrator awal hanya menerima prefix 14 digit, sedangkan kedua migration yang tersedia memakai prefix 12 digit. Test awal mengonfirmasi hasil discovery kosong. Migrator kini memakai helper yang menerima format 12 digit yang ada dan gagal tertutup jika menemukan nama file `.sql` yang tidak sesuai format.
- **Root Cause:** Format penamaan migration tidak konsisten antara file SQL dan regex migrator; filter kosong tidak dianggap error.
- **Impact:** Pada database lama, migration `updated_at` dapat terlewat sehingga edit CMS yang mengisi kolom tersebut gagal; sinkronisasi sequence admin juga tidak berjalan.
- **Exploitability / Trigger Condition:** Deployment menggunakan database persisten yang belum memiliki kolom/sequence sesuai, sementara migration runner sebelumnya melewatkan semua file.
- **Recommended Fix:** Selaraskan pola discovery dengan konvensi migration dan jangan mengabaikan file SQL yang tak valid; perubahan ini sudah diterapkan.
- **Alternative Fix:** Ubah seluruh nama migration ke format yang didukung runner, disertai perhatian agar ID migration yang pernah diterapkan tidak berubah.
- **Regression Risk:** Perubahan konvensi nama mendatang akan gagal migration secara eksplisit sampai formatnya diperbarui.
- **Verification:** Test merah mereproduksi nol file terpilih; test hijau membuktikan kedua migration dipilih dan nama SQL malformed ditolak. SQL belum dijalankan pada database production karena Docker daemon tidak tersedia.
- **Priority:** Source dan regression test sudah diperbaiki; validasi apply migration tetap perlu pada staging sebelum production.

#### SEC-021 — Cache pengaturan privat tidak terikat pada sesi admin

- **Category:** Security / Privacy.
- **Validation Status:** Confirmed pada client sebelum perbaikan; isolasi sesi sudah diperbaiki.
- **Severity:** Low (P3).
- **Affected File:** `src/lib/api.js`, `src/lib/auth.js`, `test/api-cache.test.js`.
- **Location:** Cache `fetchCollection(..., { includePrivate: true })` dan notifikasi perubahan auth.
- **Evidence:** Cache lama memakai key bersama `site_settings:private`, sehingga sesi baru dapat menerima hasil cache sesi sebelumnya selama TTL 30 detik. Test merah menunjukkan sesi B menerima nilai privat sesi A setelah logout/login. Cache kini memakai token yang ditangkap saat request dan entri privat dibersihkan saat auth state berubah.
- **Root Cause:** Cache privat hanya dibedakan dari data publik, bukan identitas sesi.
- **Impact:** Pada browser bersama, caller setelah pergantian akun dapat melihat data privat sesi sebelumnya dari cache lokal. Endpoint API tetap memerlukan autentikasi; tidak ditemukan akses langsung tanpa token ke endpoint.
- **Exploitability / Trigger Condition:** Browser digunakan bersama dan sesi admin berubah dalam TTL cache.
- **Recommended Fix:** Ikat key cache pada sesi aktif dan bersihkan entri privat pada perubahan auth; perubahan ini sudah diterapkan.
- **Alternative Fix:** Nonaktifkan caching untuk response privat.
- **Regression Risk:** Cache antar-sesi tidak lagi dibagikan; perubahan mungkin menambah satu request saat login berbeda, tetapi tidak mengubah API server.
- **Verification:** Regression test menjalankan sesi A, logout, sesi B, lalu memastikan request B membawa token B dan menerima nilai B.
- **Priority:** Source dan regression test sudah diperbaiki.

### Status ledger seluruh temuan

| Finding ID | Status terbaru | Catatan / validasi tersisa |
|---|---|---|
| SEC-001 | Source diperbaiki | Startup gagal untuk JWT secret yang hilang/lemah/dikenal; nilai secret production dan rotasi runtime belum diperiksa. |
| SEC-002 | Bootstrap diperbaiki | Seed admin bersama dihapus dan bootstrap interaktif tersedia; akun database lama belum diperiksa/dirotasi. |
| SEC-003 | Source diperbaiki | Sanitizer allowlist digunakan di sink About; perilaku browser belum diuji manual. |
| SEC-004 | Source diperbaiki | URL memakai allowlist skema dan menolak backslash/protocol-relative; seluruh tautan eksternal belum diuji browser. |
| SEC-005 | Source diperbaiki | Batas 10 percobaan per IP per 15 menit; forwarded client IP di deployment harus diverifikasi. |
| SEC-006 | Source diperbaiki | JWT 30 menit, logout/ubah akun mengubah versi sesi yang diperiksa ke database. |
| SEC-007 | Source diperbaiki | Allowlist kolom per tabel menolak identifier dari input. |
| SEC-008 | Dimitigasi | Upload baru dibatasi 5 MB, signature raster diizinkan, nama acak, SVG ditolak, header sandbox dan guard ekstensi legacy. Isi volume upload lama masih perlu diperiksa; tidak ada penghapusan otomatis. |
| SEC-009 | Dimitigasi | Quota agregat 100 MiB/5.000 file dan 20 upload per admin per jam. Pembersihan orphan tidak dijalankan agar file CMS aktif tidak terhapus; disk volume dan kebutuhan retention perlu ditinjau. |
| SEC-010 | Provisioning diperbaiki | Migrator membuat role runtime non-superuser dengan hak tabel terbatas; migrasi dan privilege database production belum dijalankan/divalidasi. |
| SEC-011 | Source diperbaiki | Response error generik, log server memuat kode/nama error tanpa pesan database. |
| SEC-012 | Source diperbaiki | CSP, nosniff, frame, referrer, dan permissions headers ada di Express; header dari ingress/domain belum diverifikasi. |
| SEC-013 | Script diperbaiki; eksternal terbuka | SQL legacy memakai kebijakan fail-closed untuk run berikutnya; kebijakan project Supabase aktif tidak diakses atau diubah. |
| SEC-014 | Dependency diperbarui | `npm audit` penuh dan production saat pemeriksaan terakhir menunjukkan 0 advisory pada 316 dependency root. Nested app tidak tercakup. |
| SEC-015 | Source diperbaiki | JSON dibatasi 1 MiB dan form-urlencoded 10 KiB; test membuktikan request besar mendapat 413. Load/concurrency pada host tidak diukur. |
| SEC-016 | Source diperbaiki | Dev server nested bind localhost. |
| SEC-017 | Terbuka — validasi infrastruktur | Route yang dilacak masih memakai HTTP internal; isolasi segmen, firewall, dan risiko jaringan belum dapat ditentukan dari workspace. |
| SEC-018 | Source diperbaiki | Proyeksi publik mengecualikan `ai_system_prompt`; akses private membutuhkan JWT. |
| SEC-019 | Source diperbaiki | Kebijakan 14 code point/72 byte dipakai oleh API, UI, dan bootstrap; hash admin lama perlu ditinjau/reset. |
| SEC-020 | Source diperbaiki | Hard limiter per email dihapus; hanya bucket per client IP yang menolak request. |
| PERF-001 | Source diperbaiki | Cache koleksi bersama dengan invalidasi setelah mutasi. |
| PERF-002 | Source diperbaiki | Reduced-motion merender scene sekali dan tidak menjadwalkan frame loop berulang. |
| PERF-003 | Source diperbaiki | Endpoint koleksi memakai limit/offset dengan batas maksimum dan validasi. |
| PERF-004 | Source diperbaiki pada prototype | Gambar bawah fold lazy; aplikasi tetap berstatus archived dan tidak dibuild oleh root pipeline. |
| PERF-005 | Terbuka — perlu pengukuran | CPU/memori Compose tidak dibatasi karena baseline Proxmox/LXC belum diketahui; jangan menetapkan limit tanpa pengukuran. |
| PERF-006 | Workflow diperbaiki | rsync mengecualikan dependency, hasil build, dan upload persisten. |
| ARCH-001 | Dokumentasi/config diperbaiki | README/deployment diselaraskan dengan Compose; konfigurasi Vercel lama dihapus. |
| ARCH-002 | Struktur diperbaiki | Duplikasi bootstrap SQL dihapus; migration runner dan migration bernomor ditambahkan. Integrasi database tidak dijalankan karena Docker daemon tidak tersedia. |
| ARCH-003 | Ditangani melalui status scope | `sumur-creative` dinyatakan archived/unsupported, dependency tak terpakai dibersihkan dan dev host dibatasi; lockfile/build tidak dibuat. Perlu workflow terpisah bila diaktifkan lagi. |
| ARCH-004 | Source diperbaiki | Modul frontend terverifikasi tidak aktif dihapus. |
| ARCH-005 | Source diperbaiki | Semantik dialog, focus/Escape, navigasi keyboard, dan accessible names diperbaiki; browser/screen reader belum dijalankan. |
| REL-001 | Dokumentasi/config diperbaiki | Setup self-hosted dan kontrak environment diselaraskan; test menggunakan URL DB lokal palsu yang tidak terhubung. |
| REL-002 | Source/test/workflow diperbaiki | Import app tidak membuka listener; test mock memeriksa status sehat/degraded; lint/test menjadi gate workflow. |
| REL-003 | Source/schema diperbaiki | Update API menyetel `updated_at`; migration menambah/menyelaraskan kolom terkait. |
| REL-004 | Source diperbaiki sesuai pilihan pengguna | Form mengarahkan ke WhatsApp yang telah dikonfigurasi, tidak mencatat pesan ke console; browser/popup diblokir belum diuji manual. |
| REL-005 | Dependency/config diperbaiki | Override dependency yang merusak lint diganti; lint selesai tanpa warning. |
| REL-006 | Source/config diperbaiki | Shutdown drain dan tutup pool; rotasi log Compose ditentukan. Sinyal/rotasi pada container production belum diuji. |
| REL-007 | Source/test diperbaiki | Rehash menggunakan compare-and-swap untuk mencegah menimpa perubahan password yang bersamaan. |
| REL-008 | Source/test diperbaiki; staging belum dijalankan | Helper migrasi menemukan dua file aktif dan menolak nama SQL malformed; apply migration production belum diverifikasi. |
| SEC-021 | Source/test diperbaiki | Cache settings privat memakai scope token dan dibersihkan pada auth-state changes; server API tetap melakukan auth. |

### Hasil verifikasi remediation

| Pemeriksaan | Hasil terbaru |
|---|---|
| `npm test` | Lulus. Test memakai mock database dan alamat koneksi `127.0.0.1:1`; mencakup auth/rate limit lintas IP, batas password, projection settings, pagination, upload SVG nyata di direktori sementara, file PNG yang aman, race upgrade password, discovery/malformed migration names, dan isolasi cache privat antar-sesi. |
| `npm run lint` | Lulus tanpa warning pada pemeriksaan terakhir. |
| Production build | Lulus pada build terakhir ke `/tmp/mamaysporto-prepush-build.DAQRrc`; output termasuk chunk Three.js 518,36 kB mentah / 129,65 kB gzip dan warning threshold 500 kB. Ini bukan pengukuran LCP/INP/CLS atau bukti bottleneck runtime. |
| `npm ci --ignore-scripts` | Lulus; dependency tree direkonstruksi dari lockfile tanpa lifecycle scripts, 0 vulnerability dilaporkan. |
| `npm audit --json` | 0 vulnerability dari 316 entri dependency root pada waktu pemeriksaan. |
| `npm audit --omit=dev --json` | 0 vulnerability dari dependency root yang diaudit. |
| `node --check` untuk `server/`, `scripts/`, `test/` | Lulus. |
| `docker compose config --quiet` | Lulus dengan dummy values; hanya validasi interpolasi/config, bukan menjalankan migrasi atau container. |
| `git diff --check` | Lulus. |
| Code review terpisah | Review pre-push menemukan bug discovery migration dan cache privat lintas sesi; kedua perbaikan diterapkan dan review follow-up menyetujui keduanya. Risiko environment LXC dan akun admin lama tetap perlu konfirmasi operator. |

### Prioritas sisa kerja operasional

1. **Sebelum/ketika deploy:** validasi `JWT_SECRET`, rotasi akun admin lama, jalankan migrator pada staging, lalu periksa role runtime efektif. Rujuk SEC-001, SEC-002, SEC-010.
2. **Ingress dan jaringan:** pastikan Express menerima alamat client yang berbeda melalui peer Traefik yang benar, batasi port app ke ingress, dan evaluasi hop HTTP internal berdasarkan trust boundary aktual. Rujuk SEC-005, SEC-017.
3. **Data persisten:** periksa file upload lama dan usage volume sebelum memutuskan cleanup; cek konfigurasi Supabase hanya jika project tersebut masih aktif. Rujuk SEC-008, SEC-009, SEC-013.
4. **Validasi browser:** uji sanitizer/About, tautan, dialog keyboard/focus, serta fallback WhatsApp ketika popup diblokir. Rujuk SEC-003, SEC-004, ARCH-005, REL-004.
5. **Baseline resource:** ukur CPU/memori dan perilaku LXC saat beban representatif sebelum memilih limit; ukur CWV di browser nyata. Rujuk PERF-005 dan catatan PERF-001–004.
6. **Prototype nested:** tetap keluarkan `sumur-creative` dari release yang didukung sampai lockfile, build, dan audit terpisah tersedia.

### Ringkasan severity seluruh inventaris

Angka berikut menghitung tingkat risiko temuan ketika diidentifikasi, termasuk temuan yang kini telah diperbaiki. Angka ini bukan jumlah vulnerability yang masih aktif.

| Severity | Jumlah ID | Status ringkas |
|---|---:|---|
| Critical (P0) | 0 | Tidak ada temuan aplikasi kritis yang tervalidasi. |
| High (P1) | 2 | SEC-001 dan SEC-002 diperbaiki pada source/bootstrap; secret serta akun database production tetap perlu diverifikasi. |
| Medium (P2) | 7 | Perbaikan source diterapkan; SEC-017 dan sejumlah status runtime masih perlu pemeriksaan infrastruktur. |
| Low (P3) | 14 | Perbaikan source/config diterapkan atau mitigasi dengan batas dijelaskan; validasi browser/volume/deployment tercatat di ledger. |
| Informational (P4) | 3 | Dokumentasi dan scope aplikasi nested ditangani; nested prototype tetap tidak didukung. |
| Severity tidak ditetapkan | 14 | Kandidat atau risiko yang severity aplikasinya belum dapat dinilai; sebagian membutuhkan akses dan pengukuran runtime. |
| **Total** | **40** | 33 temuan baseline + 7 temuan tambahan dari remediation/review. |

### Batas akhir audit/remediation

- Angka severity pada ringkasan awal serta Sections C–K adalah snapshot sebelum perbaikan. Total inventaris setelah review remediation adalah 40 ID: 33 temuan awal ditambah SEC-018, SEC-019, SEC-020, SEC-021, PERF-006, REL-007, dan REL-008.
- Tidak ditemukan temuan Critical yang tervalidasi. Risiko High baseline pada secret fallback dan seed admin diperbaiki pada source; penggunaan secret dan akun database production masih perlu konfirmasi operator.
- Temuan source yang sudah diperbaiki tidak membuktikan bahwa deployment production telah menerima versi baru atau bahwa data/secret lama telah dirotasi.
- Docker daemon tidak dapat dihubungi dari workspace sehingga tidak ada integrasi PostgreSQL/migration apply, Docker image build, browser/e2e, aksesibilitas screen reader, CWV, atau beban LXC yang dijalankan.
- File lokal `.env` tidak dibaca. Perubahan lokal yang sudah ada sebelum tugas—penghapusan `docs/LXC-10018-SETUP.md` dan file `docs/HOMELAB-SSOT.md`—dipertahankan tanpa perubahan terkait audit.

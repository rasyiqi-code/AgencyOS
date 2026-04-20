# AgencyOS: The Hybrid Agency Platform

[English Version](README.en.md)

> **Visi**: Menciptakan "Sistem Operasi Bisnis" yang memungkinkan agensi berjalan sebagai Hybrid Agency (AI + Manusia).
> **Filosofi**: Async First. AI Augmented. Zero-bloat. Transparansi.

---

## 🏗️ 1. Arsitektur & Peran Pengguna

### A. Klien (User)
*   **Akses**: Dashboard Klien (`/dashboard`)
*   **Status**: Terimplementasi.
*   **Fitur**: Ringkasan proyek, integrasi chatbot, pencatatan feedback, pembayaran termin.

### B. Arsitek (Super Admin)
*   **Akses**: Panel Admin (`/admin`)
*   **Status**: Terimplementasi (Lanjutan).
*   **Fitur**: Manajemen proyek, manajemen keuangan (faktur/pesanan), pengaturan sistem (kunci AI, pembayaran), Tiket Support, Manajemen Afiliasi.

### C. Squad Lead (Mitra)
*   **Akses**: Portal Squad (`/squad`)
*   **Status**: Terimplementasi (Beta).
*   **Fitur**: Profil skill, lamaran misi (proyek), manajemen portofolio.

### D. Agen AI (CredibleBot)
*   **Mesin**: Genkit (Google Gemini)
*   **Status**: Produksi.
*   **Fitur**: Rotasi API Key otomatis (Load Balancing), pembuatan PRD, konsultasi estimasi harga.

---

## 🛠️ 2. Teknologi (Tech Stack)

### Frontend
- **Framework**: Next.js 16.1.4 (App Router)
- **UI Library**: React 19, Tailwind CSS 4, Shadcn UI
- **Manajemen State**: Zustand
- **Ikon**: Lucide React

### Backend & Database
- **Otentikasi**: Stack Auth
- **Database**: PostgreSQL dengan Prisma ORM 7.2.0
- **Penyimpanan**: AWS S3 (via `@aws-sdk/client-s3`) / Cloudflare R2
- **Pembayaran**: Midtrans / Creem (Otomatis Penuh)

### Integrasi AI
- **Framework**: Genkit AI
- **Model**: Gemini 2.0 Flash (Utama), Gemini 1.5 Flash (Cadangan)
- **Logika**: Rotasi kunci dinamis via `prisma.systemKey`

---

## ✅ 3. Fitur Utama (Siap Pakai)

### Bisnis Inti
- [x] **AI Quote Calculator**: Estimasi harga dinamis berdasarkan fitur & kompleksitas (`components/quote-calculator.tsx`).
- [x] **Sistem Pembayaran Fleksibel**: Mendukung **One-time** & **Subskripsi (Retainer)** via Midtrans/Creem.
- [x] **Manajemen Proyek Admin**: Dashboard lengkap dengan alur kerja jasa (Projects/Estimates) (`app/admin/pm`).
- [x] **Generator Faktur PDF**: Pembuatan invoice otomatis dengan dukungan multi-termin (`components/checkout/invoice-document.tsx`).
- [x] **Manajemen Pesanan Digital**: Alur penjualan aset (Asset-based) dengan pengiriman file otomatis dan aktivasi lisensi.
- [x] **Generator Konten AI**: Pembuatan Layanan & Produk otomatis via Genkit AI (`app/api/genkit`).

### Pertumbuhan & Pemasaran
- [x] **Sistem Promosi Dinamis**: Manajemen penawaran khusus, diskon terbatas, dan kode kupon dengan tampilan masonry grid yang elegan (`app/(public)/promosi`).
- [x] **Sistem Afiliasi**: Portal afiliasi lengkap dengan pelacakan referral, komisi, dan permintaan pembayaran (`app/affiliate`).
- [x] **Marketing Suite**: Manajemen aset pemasaran, banner, dan sistem testimoni (`app/admin/marketing`).
- [x] **Mesin Produk Digital**: Sistem penjualan produk digital (template/plugin) dengan manajemen lisensi (`app/admin/products`).
- [x] **Sistem Pop-up Dinamis**: Manajemen pop-up marketing yang dapat dikontrol dari panel admin (`app/api/public/popups`).

### Infrastruktur
- [x] **Smart Portfolio Preview**: Sistem deteksi blokir iframe otomatis dengan fallback proxy rendering untuk preview situs eksternal yang mulus (`lib/portfolios/actions.ts`).
- [x] **Rotasi Kunci Sistem**: Manajemen kunci API LLM dengan redundansi (`app/genkit/ai.ts`).

- [x] **Media Library 2.0**: Manajemen file canggih dengan folder, pencarian, dan tampilan toggle (`components/admin/media`).
- [x] **Integrasi Cloudflare R2**: Penyimpanan aset produksi yang dapat diskalakan dan hemat biaya.
- [x] **Keamanan Kelas Enterprise**: Header Content Security Policy (CSP) & Optimasi Gambar (Next.js 16).
- [x] **PWA & Web Push**: Dukungan instalasi native & notifikasi web push untuk update status (`components/pwa`).
- [x] **API Verifikasi Lisensi**: Endpoint publik untuk verifikasi lisensi (termasuk **activation limits** per-device) di aplikasi pihak ketiga.
- [x] **Optimasi SEO & Sitemap**: Sitemap dinamis dengan multi-locale alternates dan caching performa tinggi (`app/sitemap.ts`).
- [x] **Manajemen Kurs Mata Uang**: Sistem konversi IDR/USD otomatis dengan integrasi kurs riil (`lib/server/currency-service.ts`).
- [x] **Skrip Deployment Produksi**: Setup Docker tersedia (`Dockerfile` & `docker-compose.yml`).

---

## ⚡ 4. Fitur Enterprise & Lanjutan

- [x] **Orkestrasi Gateway Pembayaran**: Konfigurasi dinamis Midtrans & Creem melalui database tanpa deploy ulang.
- [x] **Sistem Webhook Eksternal**: Memicu event otomatis ke SaaS pihak ketiga (Zapier/Make) untuk alur kerja terintegrasi.
- [x] **Manajemen Lead & Kontak**: Sistem pelacakan prospek dan inquiry publik yang terintegrasi di admin panel.
- [x] **Sistem Changelog**: Modul untuk mempublikasikan update fitur dan rilis produk secara transparan.
- [x] **Kontrol Tim Admin**: Manajemen akses internal untuk tim administrasi dengan kendali terpusat.
- [x] **Identitas GitHub OAuth**: Sinkronisasi profil Squad Lead melalui GitHub untuk verifikasi kredibilitas.
- [x] **Kotak Masuk Klien Aman**: Saluran komunikasi internal terenkripsi khusus di dalam Dashboard Klien.

---

## 🚀 5. Panduan Cepat (Quick Start)

1.  **Instalasi**: `bun install`
2.  **Env**: Atur `.env` berdasarkan `prisma/schema.prisma` (DATABASE_URL, STACK_API_KEY).
3.  **Database**:
    *   **Lokal Native**: `bun prisma migrate dev`
    *   **Lokal Docker**: `docker compose -f docker-compose.dev.yml up -d db`
4.  **Dev Server**: `bun dev`

---

## 🚢 5. Deployment (Dokploy / VPS)
Lihat panduan lengkap di **`DEPLOY.md`**.
*   **One-Click Deploy**: Gunakan `docker-compose.yml` (Aplikasi + DB).
*   **Manual Deploy**: Gunakan `Dockerfile` (Hanya Aplikasi) + Managed DB.

---

## 🛠️ 6. Referensi Perintah (Cheat Sheet)

### 🐳 Manajemen Docker
| Aksi | Perintah |
| :--- | :--- |
| **Mulai DB Lokal** | `docker compose -f docker-compose.dev.yml up -d db` |
| **Stop DB Lokal** | `docker compose -f docker-compose.dev.yml down` |
| **Tes Prod Lokal** | `docker compose up --build` |
| **Bersihkan Docker** | `docker system prune -a` |

### 🗄️ Database (Prisma)
| Aksi | Perintah |
| :--- | :--- |
| **Buka GUI DB** | `bunx prisma studio` |
| **Migrasi Dev** | `bun prisma migrate dev --name <nama_migrasi>` |
| **Reset DB** | `bun prisma migrate reset` |
| **Generate Client** | `bun x prisma generate` |
| **Seed Data** | `bun prisma db seed` |

### 🚀 Persiapan Deployment
```bash
# Komit perubahan
git add .
git commit -m "chore: readiness for deployment"
git push
```
---

## ⚖️ Lisensi
Proyek ini dilisensikan di bawah **Lisensi MIT** - lihat berkas [LICENSE](LICENSE) untuk detailnya.

<div align="center">
  <img src="public/logo.png" alt="AgencyOS Logo" width="120" />
  
  <h1>AgencyOS</h1>
  <h3>Website Untuk Agency</h3>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
  
  **Visi**: Merevolusi cara agensi bekerja melalui integrasi cerdas antara AI dan keahlian manusia dalam satu ekosistem terpadu.
</div>

---

## 📖 Apa itu AgencyOS?

**AgencyOS** adalah platform "Business Operating System" modern yang dirancang khusus untuk agensi masa depan. Dengan filosofi *Async-First* dan *AI-Augmented*, platform ini memungkinkan agensi Anda berjalan lebih efisien melalui otomatisasi cerdas, manajemen proyek yang transparan, dan sistem pembayaran yang terintegrasi penuh.

### 🌟 Nilai Utama
- 🤖 **AI Augmented**: Meningkatkan produktivitas dengan bantuan Agen AI (CredibleBot).
- ⚡ **Async First**: Komunikasi dan alur kerja yang tidak harus real-time, memungkinkan skalabilitas tinggi.
- 💎 **Luxury Aesthetic**: Antarmuka premium dengan "Luxury Dark Studio" branding yang memikat klien.
- 🛠️ **Zero-Bloat**: Hanya fitur yang benar-benar Anda butuhkan untuk menjalankan bisnis agensi.

---

## 🏗️ Arsitektur & Peran Pengguna

| Peran | Deskripsi | Akses |
| :--- | :--- | :--- |
| **Klien** | Fokus pada pemantauan proyek, feedback, dan pembayaran. | `/dashboard` |
| **Arsitek (Admin)** | Kendali penuh atas operasional, keuangan, dan pengaturan AI. | `/admin` |
| **Squad Lead** | Partner/Freelancer yang mengerjakan misi (proyek). | `/squad` |
| **CredibleBot** | Agen AI yang membantu PRD, estimasi, dan rotasi API Key. | `Genkit AI` |

---

## 🛠️ Tech Stack Modern

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | **Next.js 16 (App Router)**, React 19, Tailwind CSS 4, Zustand |
| **Backend** | **PostgreSQL** dengan **Prisma ORM 7.2.0** |
| **Integrasi AI** | **Genkit AI** (Google Gemini 2.0 Flash & 1.5 Flash) |
| **Otentikasi** | **Stack Auth** (Enterprise Ready) |
| **Pembayaran** | **Midtrans** & **Creem.io** (Automated Reconciliation) |
| **Storage** | **AWS S3** / **Cloudflare R2** |

---

## ✅ Fitur Utama

### 💎 Core Experience
- [x] **AI Quote Calculator**: Estimasi harga dinamis berbasis fitur & kompleksitas.
- [x] **Smart Portfolio Preview**: Deteksi blokir iframe dengan fallback proxy rendering.
- [x] **Dynamic Promotions**: Manajemen promo dengan tampilan masonry grid yang elegan.
- [x] **Project Life Cycle**: Alur kerja dari estimasi, kontrak, hingga pengiriman.

### 📈 Growth & Revenue
- [x] **Affiliate Engine**: Portal referral lengkap dengan pelacakan komisi otomatis.
- [x] **Digital Asset Store**: Penjualan template/plugin dengan manajemen lisensi otomatis.
- [x] **Marketing Suite**: Popup dinamis, banner, dan sistem testimoni terpusat.
- [x] **Automated Invoicing**: Generator PDF faktur dengan dukungan multi-termin.

### ⚙️ Infrastructure & Security
- [x] **LLM Key Rotation**: Load balancing API key untuk menghindari limitasi.
- [x] **Media Library 2.0**: Manajemen file canggih dengan folder dan pencarian.
- [x] **PWA & Web Push**: Notifikasi status proyek langsung ke perangkat pengguna.
- [x] **Enterprise Security**: Header CSP ketat dan optimasi gambar mutakhir.

---

## 🚀 Panduan Cepat (Quick Start)

### 1. Persiapan Environment
Salin template environment dan sesuaikan nilainya:
```bash
cp .env.example .env
# Jika menggunakan Docker
cp .env.example .env.docker
```

### 2. Instalasi & Setup
```bash
bun install
bun prisma migrate dev
bun prisma db seed
bun dev
```

---

## 🚢 Deployment (Dokploy / VPS)

AgencyOS siap dideploy menggunakan Docker. Lihat panduan lengkap di [DEPLOY.md](DEPLOY.md).

```bash
# Production build via Docker
docker compose up --build -d
```

---

## 🛠️ Referensi Perintah (Cheat Sheet)

### 🐳 Docker
| Perintah | Deskripsi |
| :--- | :--- |
| `docker compose -f docker-compose.dev.yml up -d db` | Mulai Database lokal |
| `docker system prune -a` | Bersihkan sisa Docker |

### 🗄️ Database (Prisma)
| Perintah | Deskripsi |
| :--- | :--- |
| `bunx prisma studio` | Buka GUI Database |
| `bun prisma db seed` | Masukkan data awal (Seeding) |

---

## ⚖️ Lisensi
Proyek ini dilisensikan di bawah **Lisensi MIT**. Dibuat dengan ❤️ untuk ekosistem agensi masa depan.

---

<div align="center">
  <a href="README.en.md">English Version</a> | <a href="DEPLOY.md">Deployment</a> | <a href="mailto:support@crediblemark.com">Support</a>
</div>

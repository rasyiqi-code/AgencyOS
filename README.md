# AgencyOS: The Hybrid Agency Platform

> **Vision**: Menciptakan "Sistem Operasi Bisnis" yang memungkinkan agensi berjalan sebagai Hybrid Agency (AI + Human).
> **Filosofi**: Async First. AI Augmented. Squad Based. Transparency.

---

## 🏗️ 1. Arsitektur & Peran (User Roles)

### A. The Client (User)
*   **Akses**: Dashboard Klien (`/dashboard`)
*   **Status**: Terimplementasi (Basic). Menggunakan Stack Auth untuk manajemen sesi.
*   **Fitur**: Project overview, integrasi chatbot, pencatatan feedback.

### B. The Architect (Super Admin)
*   **Akses**: Admin Panel (`/admin`)
*   **Status**: Terimplementasi (Advanced).
*   **Fitur**: Management proyek, manajemen keuangan (invoices/orders), pengaturan sistem (AI keys, payment settings).

### C. The Squad Lead (Developer)
*   **Akses**: Squad Portal (`/squad`)
*   **Status**: Tahap Awal (WIP).
*   **Fitur**: Mission board sederhana, manajemen profil.

### D. The AI Agent (CredibleBot)
*   **Engine**: Genkit (Google Gemini)
*   **Status**: Produksi.
*   **Fitur**: Rotasi API Key otomatis (Load Balancing), PRD generation, konsultasi estimasi harga.

---

## 🛠️ 2. Tech Stack (Actual Implementation)

### Frontend
- **Framework**: Next.js 16.1.4 (App Router)
- **Library UI**: React 19, Tailwind CSS 4, Shadcn UI
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend & Database
- **Auth**: Stack Auth (Migration from NextAuth selesai)
- **Database**: PostgreSQL with Prisma ORM 7.2.0
- **Storage**: AWS S3 (via `@aws-sdk/client-s3`)
- **Payments**: Midtrans / Resend (Draft)

### AI Integration
- **Framework**: Genkit AI
- **Models**: Gemini 2.0 Flash (Primary), Gemini 1.5 Flash (Fallback)
- **Logic**: Dynamic key rotation via `prisma.systemKey`

---

## ✅ 3. Fitur Terimplementasi (Ready to Use)
- [x] **AI Quote Calculator**: Estimasi harga dinamis berdasarkan fitur & kompleksitas (`components/quote-calculator.tsx`).
- [x] **Admin Project Management**: Full Dashboard with Search, Filtering, Pagination, & Assignment (`app/admin/pm`).
- [x] **System Key Rotation**: Manajemen LLM API keys dengan redundansi (`app/genkit/ai.ts`).
- [x] **Support Ticket System**: Sistem tiket support dengan integrasi database (`prisma/schema.prisma`).
- [x] **Invoice PDF Generator**: Pembuatan invoice otomatis (`components/checkout/invoice-document.tsx`).
- [x] **Conditional Floating Chat**: Widget chat pintar yang menyesuaikan konteks halaman.

---

## 🚧 4. Apa yang Belum? (Missing/WIP)
- [ ] **GitHub Full Integration**: Integrasi repo activity baru sebatas UI mockup, perlu koneksi API GitHub yang fungsional.
- [ ] **Squad Wallet & Payout**: Model database sudah ada, namun UI withdrawal dan integrasi payout gateway belum aktif.
- [ ] **Visual Feedback Pinning**: Fitur mengomentari langsung pada layar staging (mockup di `feedback-board.tsx`).
- [ ] **Automated Testing Suite**: Kerangka pengujian ada, namun unit test untuk logika pricing & AI flow masih minim.
- [ ] **Production Deployment Script**: Docker setup tersedia, namun workflow CI/CD penuh masih dalam pengembangan.

---

## 🚀 5. Cara Menjalankan

1.  **Install**: `pnpm install`
2.  **Env**: Setup `.env` berdasarkan `prisma.schema` (DATABASE_URL, STACK_API_KEY).
3.  **Database**: `npx prisma migrate dev`
4.  **Dev Server**: `pnpm dev`
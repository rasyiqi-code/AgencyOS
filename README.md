# Agency OS: SoloDev Async Platform

> **Motto**: "Code More, Talk Less."  
> **Core Value**: Transparansi Total & Self-Service.

Platform ini bertujuan untuk menghapus kebutuhan komunikasi sinkron (Zoom, Telepon, Chat intens) antara Developer dan Klien, mengubah jasa pengembangan aplikasi menjadi pengalaman seperti belanja produk SaaS.

---

## 1. User Roles
- **Admin (Saya)**: Mengelola project, approval brief, update progress, deploy hasil.
- **Client**: Membuat brief (bantuan AI), tracking progress, payment, feedback visual.
- **AI Agent**: Bertindak sebagai Project Manager & Business Analyst (Phase 2).

---

## 2. Fitur Utama & Roadmap

### ✅ Tahap 1: The "Digital Receptionist" (MVP) - *Current Phase*
Fokus: Menghilangkan administrasi manual.
- [x] **Auth**: Login/Register via **Stack Auth** (Google/Email).
- [x] **Dashboard**: Project List & Status Tracker.
- [x] **Project Creation**: Form brief project sederhana.
- [x] **Database**: Self-hosted PostgreSQL dengan **Prisma 7** & Docker.

### 🚧 Tahap 2: The "AI Integration" (Next)
Fokus: Menghilangkan meeting kick-off.
- [ ] **AI Consultant**: Chatbot untuk interview kebutuhan klien.
- [ ] **Auto-PRD**: Generate dokumen requirements otomatis.
- [ ] **Dynamic Pricing**: Estimasi harga berbasis kompleksitas fitur.

### 🔮 Tahap 3: The "Full Autopilot"
Fokus: Menghilangkan revisi chat & support.
- [ ] **Contextual Feedback**: Komen langsung di atas screenshot/preview (seperti Vercel comments).
- [ ] **Codebase Chat**: RAG (Retrieval-Augmented Generation) untuk tanya jawab teknis otomatis.

---

## 3. Tech Stack (Phase 1 Implemented)

### Core
- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Bun
- **Styling**: Tailwind CSS v4 + Shadcn/UI (New York Style)

### Backend & Data
- **Database**: PostgreSQL (Self-Hosted via Docker)
- **ORM**: Prisma v7.2 (via `@prisma/adapter-pg`)
- **Authentication**: Stack Auth (`@stackframe/stack`)

### DevOps
- **Containerization**: Docker & Docker Compose
- **Target Deployment**: VPS (Ubuntu/Linux)

---

## 4. Cara Menjalankan (Local Development)

### Prerequisite
- Docker Engine & Docker Compose
- Bun (`curl -fsSL https://bun.sh/install | bash`)

### Steps
1. **Clone Repo & Install Dependencies**
   ```bash
   git clone <repo_url>
   cd agency-os
   bun install
   ```

2. **Setup Environment Variables**
   Copy `.env.example` ke `.env` (atau buat manual) dan isi:
   ```env
   DATABASE_URL="postgresql://postgres:postgres_password_change_me@localhost:5432/agency_os?schema=public"
   NEXT_PUBLIC_STACK_PROJECT_ID="your_stack_project_id"
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_stack_key"
   STACK_SECRET_SERVER_KEY="your_stack_secret"
   ```

3. **Start Database (Docker)**
   ```bash
   sudo docker compose up -d db
   ```

4. **Run Migrations**
   ```bash
   bunx prisma migrate dev
   ```

5. **Start App**
   ```bash
   bun run dev
   ```
   Buka `http://localhost:3000` di browser.
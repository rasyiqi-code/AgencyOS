# AgencyOS: The Hybrid Agency Platform

[Bahasa Indonesia](README.md)

> **Vision**: Creating a "Business Operating System" that allows agencies to run as a Hybrid Agency (AI + Human).
> **Philosophy**: Async First. AI Augmented. Zero-bloat. Transparency.

---

## 🏗️ 1. Architecture & User Roles

### A. Client (User)
*   **Access**: Client Dashboard (`/dashboard`)
*   **Status**: Implemented.
*   **Features**: Project summary, chatbot integration, feedback logging, milestone payments.

### B. Architect (Super Admin)
*   **Access**: Admin Panel (`/admin`)
*   **Status**: Implemented (Advanced).
*   **Features**: Project management, financial management (Invoices/Orders), system settings (AI keys, payments), Support Tickets, Affiliate Management.

### C. Squad Lead (Partner)
*   **Access**: Squad Portal (`/squad`)
*   **Status**: Implemented (Beta).
*   **Features**: Skill profile, mission application (projects), portfolio management.

### D. AI Agent (CredibleBot)
*   **Engine**: Genkit (Google Gemini)
*   **Status**: Production.
*   **Features**: Automatic API Key rotation (Load Balancing), PRD generation, price estimation consultation.

---

## 🛠️ 2. Technology (Tech Stack)

### Frontend
- **Framework**: Next.js 16.1.4 (App Router)
- **UI Library**: React 19, Tailwind CSS 4, Shadcn UI
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend & Database
- **Authentication**: Stack Auth
- **Database**: PostgreSQL with Prisma ORM 7.2.0
- **Storage**: AWS S3 (via `@aws-sdk/client-s3`) / Cloudflare R2
- **Payments**: Midtrans / Creem (Fully Automated)

### AI Integration
- **Framework**: Genkit AI
- **Models**: Gemini 2.0 Flash (Primary), Gemini 1.5 Flash (Backup)
- **Logic**: Dynamic key rotation via `prisma.systemKey`

---

## ✅ 3. Key Features (Ready to Use)

### Core Business
- [x] **AI Quote Calculator**: Dynamic price estimation based on features & complexity (`components/quote-calculator.tsx`).
- [x] **Flexible Payment System**: Supports **One-time** & **Subscription (Retainer)** via Midtrans/Creem.
- [x] **Admin Project Management**: Dedicated dashboard for service workflows (Projects/Estimates) (`app/admin/pm`).
- [x] **PDF Invoice Generator**: Automatic invoice generation with multi-milestone support (`components/checkout/invoice-document.tsx`).
- [x] **Digital Asset Management**: Asset-based sales flow with automated file delivery and license activation.
- [x] **AI Content Generator**: Automated Service & Product creation via Genkit AI (`app/api/genkit`).
- [x] **AI Content Generator**: Automated Service & Product creation via Genkit AI (`app/api/genkit`).

### Growth & Marketing
- [x] **Affiliate System**: Complete affiliate portal with referral tracking, commissions, and payout requests (`app/affiliate`).
- [x] **Marketing Suite**: Management of marketing assets, banners, and testimonial systems (`app/admin/marketing`).
- [x] **Digital Product Engine**: System for selling digital products (templates/plugins) with license management (`app/admin/products`).
- [x] **Dynamic Pop-up System**: Marketing pop-up manager controllable via the admin panel (`app/api/public/popups`).

### Infrastructure
- [x] **System Key Rotation**: LLM API key management with redundancy (`app/genkit/ai.ts`).
- [x] **Media Library 2.0**: Advanced file management with folders, search, and toggle views (`components/admin/media`).
- [x] **Cloudflare R2 Integration**: Scalable and cost-effective production asset storage.
- [x] **Enterprise-Grade Security**: Content Security Policy (CSP) headers & Image Optimization (Next.js 16).
- [x] **PWA & Web Push**: Native installation support & web push notification system for status updates (`components/pwa`).
- [x] **License Verification API**: Public endpoint for verifying licenses (including per-device **activation limits**) in third-party applications.
- [x] **SEO & Sitemap Optimization**: Dynamic sitemaps with multi-locale alternates and high-performance caching (`app/sitemap.ts`).
- [x] **Currency Exchange Management**: Automated IDR/USD conversion system with real-time rate integration (`lib/server/currency-service.ts`).
- [x] **Production Deployment Scripts**: Docker setup available (`Dockerfile` & `docker-compose.yml`).

---

## ⚡ 4. Enterprise & Advanced Features

- [x] **Payment Gateway Orchestration**: Dynamic configuration of Midtrans & Creem via the database without redeploys.
- [x] **External Webhook System**: Trigger automated events to third-party SaaS (Zapier/Make) for integrated workflows.
- [x] **Lead & Contact Management**: Integrated system for tracking prospects and public inquiries in the admin panel.
- [x] **Changelog System**: Module to transparently publish feature updates and product releases.
- [x] **Admin Team Control**: Internal management for administrative teams with centralized access control.
- [x] **GitHub OAuth Identity**: Sync Squad Lead profiles via GitHub to verify technical credibility.
- [x] **Secure Client Inbox**: Encrypted internal communication channel dedicated within the Client Dashboard.

---

## 🚀 5. Quick Start

1.  **Installation**: `bun install`
2.  **Env**: Set up `.env` based on `prisma/schema.prisma` (DATABASE_URL, STACK_API_KEY).
3.  **Database**:
    *   **Local Native**: `bun prisma migrate dev`
    *   **Local Docker**: `docker compose -f docker-compose.dev.yml up -d db`
4.  **Dev Server**: `bun dev`

---

## 🚢 5. Deployment (Dokploy / VPS)
See the full guide in **`DEPLOY.md`**.
*   **One-Click Deploy**: Use `docker-compose.yml` (App + DB).
*   **Manual Deploy**: Use `Dockerfile` (App only) + Managed DB.

---

## 🛠️ 6. Command Reference (Cheat Sheet)

### 🐳 Docker Management
| Action | Command |
| :--- | :--- |
| **Start Local DB** | `docker compose -f docker-compose.dev.yml up -d db` |
| **Stop Local DB** | `docker compose -f docker-compose.dev.yml down` |
| **Test Local Prod** | `docker compose up --build` |
| **Clean Docker** | `docker system prune -a` |

### 🗄️ Database (Prisma)
| Action | Command |
| :--- | :--- |
| **Open DB GUI** | `bunx prisma studio` |
| **Dev Migration** | `bun prisma migrate dev --name <migration_name>` |
| **Reset DB** | `bun prisma migrate reset` |
| **Generate Client** | `bun x prisma generate` |
| **Seed Data** | `bun prisma db seed` |

### 🚀 Deployment Preparation
```bash
# Commit changes
git add .
git commit -m "chore: readiness for deployment"
git push
```

---

## ⚖️ License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

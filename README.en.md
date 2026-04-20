<div align="center">
  <img src="https://raw.githubusercontent.com/rasyiqi-code/AgencyOS/master/public/logo.png" alt="AgencyOS Logo" width="120" />
  
  # AgencyOS
  ### The Ultimate Hybrid Business Operating System
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
  
  **Vision**: Revolutionizing agency operations through intelligent integration of AI and human expertise in a unified ecosystem.
</div>

---

## 📖 What is AgencyOS?

**AgencyOS** is a modern "Business Operating System" specifically engineered for the agencies of tomorrow. Guided by an *Async-First* and *AI-Augmented* philosophy, this platform empowers your agency to scale efficiently through intelligent automation, transparent project management, and fully integrated payment systems.

### 🌟 Core Values
- 🤖 **AI Augmented**: Boost productivity with the assistance of dedicated AI Agents (CredibleBot).
- ⚡ **Async First**: Decoupled communication and workflows for maximum scalability and freedom.
- 💎 **Luxury Aesthetic**: Premium "Luxury Dark Studio" branding designed to impress high-ticket clients.
- 🛠️ **Zero-Bloat**: Focused exclusively on the features essential for running a world-class agency.

---

## 🏗️ Architecture & User Roles

| Role | Description | Access |
| :--- | :--- | :--- |
| **Client** | Focused on project tracking, feedback, and seamless payments. | `/dashboard` |
| **Architect (Admin)** | Full operational, financial, and AI configuration control. | `/admin` |
| **Squad Lead** | Verified partners/freelancers executing high-impact missions. | `/squad` |
| **CredibleBot** | AI agent managing PRDs, estimations, and API Key rotation. | `Genkit AI` |

---

## 🛠️ Modern Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | **Next.js 16 (App Router)**, React 19, Tailwind CSS 4, Zustand |
| **Backend** | **PostgreSQL** with **Prisma ORM 7.2.0** |
| **AI Integration** | **Genkit AI** (Google Gemini 2.0 Flash & 1.5 Flash) |
| **Authentication** | **Stack Auth** (Enterprise Ready) |
| **Payments** | **Midtrans** & **Creem.io** (Fully Automated Reconciliation) |
| **Storage** | **AWS S3** / **Cloudflare R2** |

---

## ✅ Key Features

### 💎 Core Experience
- [x] **AI Quote Calculator**: Dynamic price estimation based on features & complexity.
- [x] **Smart Portfolio Preview**: Automated iframe block detection with fallback proxy rendering.
- [x] **Dynamic Promotions**: Elegant masonry grid display for special offers and discounts.
- [x] **Project Life Cycle**: Complete workflow from estimation to contract and delivery.

### 📈 Growth & Revenue
- [x] **Affiliate Engine**: Comprehensive referral portal with automated commission tracking.
- [x] **Digital Asset Store**: Sell templates/plugins with automated license management.
- [x] **Marketing Suite**: Dynamic popups, banners, and centralized testimonial systems.
- [x] **Automated Invoicing**: Multi-milestone PDF invoice generator.

### ⚙️ Infrastructure & Security
- [x] **LLM Key Rotation**: Dynamic API key load balancing to ensure 100% uptime.
- [x] **Media Library 2.0**: Advanced file management with nested folders and search.
- [x] **PWA & Web Push**: Real-time project status notifications directly to user devices.
- [x] **Enterprise Security**: Strict CSP headers and cutting-edge image optimization.

---

## 🚀 Quick Start

### 1. Environment Preparation
Copy the environment template and configure the values:
```bash
cp .env.example .env
# For Docker usage
cp .env.example .env.docker
```

### 2. Installation & Setup
```bash
bun install
bun prisma migrate dev
bun prisma db seed
bun dev
```

---

## 🚢 Deployment (Dokploy / VPS)

AgencyOS is production-ready and Docker-optimized. See the full guide at [DEPLOY.md](DEPLOY.md).

```bash
# Production build via Docker
docker compose up --build -d
```

---

## 🛠️ Command Reference (Cheat Sheet)

### 🐳 Docker
| Command | Description |
| :--- | :--- |
| `docker compose -f docker-compose.dev.yml up -d db` | Start local database |
| `docker system prune -a` | Clean up Docker resources |

### 🗄️ Database (Prisma)
| Command | Description |
| :--- | :--- |
| `bunx prisma studio` | Open Database GUI |
| `bun prisma db seed` | Seed initial data |

---

## ⚖️ License
This project is licensed under the **MIT License**. Built with ❤️ for the future of agency ecosystems.

---

<div align="center">
  [Bahasa Indonesia](README.md) | [Documentation](DOCS.md) | [Support](mailto:support@crediblemark.com)
</div>

# Migrasi Next.js → TanStack Start — Status

## Progres Keseluruhan: ~32%

- **Rute Next.js (lama):** 90
- **Rute TanStack Start (baru):** 29 (termasuk layout/__root)
- **Sisa:** ~61 rute belum dimigrasikan

---

## ✅ Sudah Dimigrasikan (21 rute)

### Global
| Rute | File | Status |
|------|------|--------|
| Root Layout | `__root.tsx` | ✅ Semua provider (Query, Currency, Hexclave, I18n), 404, PWA |

### Publik
| Rute | File | Status |
|------|------|--------|
| `/` (Landing) | `index.tsx` | ✅ Landing lengkap dgn semua section |
| `/view-design/$slug` | `view-design.$slug.tsx` | ✅ Layout preview |
| `/handler/$` | `handler.$.tsx` | ✅ Hexclave auth handler |
| `/price-calculator` | `price-calculator.index.tsx` | ✅ Kalkulator harga utama |
| `/price-calculator/$id` | `price-calculator.$id.tsx` | ✅ Detail hasil estimasi harga |
| `/services` | `services.index.tsx` | ✅ Katalog layanan lengkap |
| `/services/$slug` | `services.$slug.tsx` | ✅ Detail spesifikasi layanan |
| `/products` | `products.index.tsx` | ✅ Galeri produk digital |
| `/products/$slug` | `products.$slug.tsx` | ✅ Detail pembelian produk digital |
| `/portfolio` | `portfolio.tsx` | ✅ Galeri hasil kerja/desain |
| `/promosi` | `promosi.tsx` | ✅ Daftar promo aktif & newsletter |

### Dashboard
| Rute | File | Status |
|------|------|--------|
| Layout | `dashboard.tsx` | ✅ Sidebar + header |
| `/dashboard/` | `dashboard.index.tsx` | ✅ Overview, mission card, finance widget |
| `/dashboard/my-products` | `dashboard.my-products.tsx` | ✅ License list |
| `/dashboard/support` | `dashboard.support.tsx` | ✅ Ticket list |

### Affiliate
| Rute | File | Status |
|------|------|--------|
| Layout | `affiliate.tsx` | ✅ |
| `/affiliate/` | `affiliate.index.tsx` | ✅ Stats + links manager |
| `/affiliate/join` | `affiliate.join.tsx` | ✅ Benefits + join |

### Squad
| Rute | File | Status |
|------|------|--------|
| Layout | `squad.tsx` | ✅ |
| `/squad/` | `squad.index.tsx` | ✅ Mission board + invitations |
| `/squad/active` | `squad.active.tsx` | ✅ Active missions |
| `/squad/profile` | `squad.profile.tsx` | ✅ Profile display |
| `/squad/missions` | `squad.missions.tsx` | ✅ |
| `/squad/onboarding` | `squad.onboarding.tsx` | ✅ |

### Support
| Rute | File | Status |
|------|------|--------|
| Layout | `support.tsx` | ✅ |
| `/support` | `support.index.tsx` | ✅ |

### Admin
| Rute | File | Status |
|------|------|--------|
| Layout | `admin.tsx` | ✅ Auth guard + admin role |
| `/admin` | `admin.index.tsx` | ✅ |

---

## ❌ Belum Dimigrasikan (~69 rute)

### Admin — System Settings (11)
- `admin/system/currency`
- `admin/system/email`
- `admin/system/integrations`
- `admin/system/keys`
- `admin/system/payment`
- `admin/system/pricing`
- `admin/system/seo`
- `admin/system/seo/pages`
- `admin/system/settings`
- `admin/system/storage`
- `admin/system/webhooks`

### Admin — Project Management (5)
- `admin/pm`
- `admin/pm/[id]`
- `admin/pm/projects`
- `admin/pm/services`
- `admin/pm/services/[id]/edit`
- `admin/pm/services/new`

### Admin — Finance (6)
- `admin/finance`
- `admin/finance/orders`
- `admin/finance/digital-orders`
- `admin/finance/quotes`
- `admin/finance/invoices`
- `admin/finance/subscriptions`

### Admin — Marketing (10)
- `admin/marketing`
- `admin/marketing/affiliates`
- `admin/marketing/assets`
- `admin/marketing/bonuses`
- `admin/marketing/coupons`
- `admin/marketing/leads`
- `admin/marketing/payouts`
- `admin/marketing/popups`
- `admin/marketing/promotions`
- `admin/marketing/push`
- `admin/marketing/subscribers`

### Admin — Lainnya (8)
- `admin/clients`
- `admin/digital-sales`
- `admin/licenses`
- `admin/media`
- `admin/portfolio`
- `admin/products`
- `admin/support`
- `admin/support/[id]`
- `admin/team`
- `admin/testimonials`

### Dashboard Client (7)
- `dashboard/inbox`
- `dashboard/billing`
- `dashboard/quotes`
- `dashboard/missions`
- `dashboard/missions/[id]`
- `dashboard/services`
- `dashboard/settings`
- `dashboard/support/[id]`
- `dashboard/support/new`

### Publik Transaksional (10)
- `checkout/[id]`
- `invoices/[id]`
- `digital-invoices/[id]`
- `verify/[id]`

### Publik Informasi (10)
- `contact`
- `docs`
- `experts`
- `privacy`
- `terms`
- `client-dashboard`
- `submit-testimonial`

### Lainnya
- `squad/missions/[id]`
- `squad/profile/edit`
- `dashboard/support/[id]`
- `dashboard/support/new`
- `affiliate/dashboard`
- `affiliate/payouts`
- `affiliate/resources`

---

## 🔧 Blocker Saat Ini

**SSR rendering crash** — `use-intl` ENVIRONMENT_FALLBACK error karena `NextIntlClientProvider` tidak menyediakan context selama SSR di TanStack Start. Landing page tidak merender konten (cuma `<!--$--><!--/$-->`).

Solusi sedang dikerjakan: patching `use-intl` atau ganti pendekatan i18n.

---

## 📊 Ringkasan Teknis

| Aspek | Status |
|-------|--------|
| Build (`vite build`) | ✅ Sukses |
| 404 handler | ✅ |
| Auth guards | ✅ (beforeLoad) |
| Server functions | ✅ (auth, dashboard, support, licenses, squad, i18n, settings) |
| Hexclave integration | ✅ (layouts + handler) |
| i18n infrastructure | ✅ (I18nProvider, server function, en/id) |
| Tailwind v4 | ✅ |
| TanStack Query | ✅ (QueryProvider) |
| PWA | ✅ (lazy components) |
| RSS Feed | ❌ (belum) |
| Image optimization | ❌ (masih `next/image`) |
| API routes | ❌ (masih di `app/api/`) |

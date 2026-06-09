# Analisis Bug, Fitur Prematur, & Boros RAM/CPU — AgencyOS

> **Generated:** 2026-06-09
> **Scope:** Full-stack Next.js 16 + Prisma + PostgreSQL + Genkit AI

---

## Daftar Isi

1. [🔴 Critical](#-critical)
2. [🟠 High](#-high)
3. [🟡 Medium](#-medium)
4. [🟢 Low](#-low)
5. [Database Index Issues](#database-index-issues)
6. [Rekomendasi Prioritas](#-rekomendasi-prioritas)

---

## 🔴 Critical

### C1. `app/api/projects/route.ts:31` — [SELESAI] Load Semua User dari Auth Provider

**Masalah:** `hexclaverServerApp.listUsers()` dipanggil tiap request, mengunduh **semua user** dari external auth provider. Untuk agency dengan ribuan user, ini 5-10MB+ JSON per request.

```typescript
// Baris 31: Load ALL users
const allUsers = await hexclaverServerApp.listUsers();

// Baris 32-38: JS-side filtering (case-insensitive substring match)
matchedUserIds = allUsers.filter((u) =>
    (u.displayName && u.displayName.toLowerCase().includes(query.toLowerCase()))
).map((u) => u.id);

// Baris 100-109: N+1 API calls — 1 request per project tanpa clientName
stackUsers = await Promise.all(
    uniqueUserIds.map(async (id) => {
        return await hexclaverServerApp.getUser(id);
    })
);
```

**Dampak:** RAM 5-10MB+ per request + O(n) external API calls + JS filtering inefisien.

**Fix:** Ganti dengan DB-level search atau indexed user cache.

---

### C2. `app/genkit/flows/support.ts:28-31` — [SELESAI] Query DB Tanpa Cache Tiap Chat

**Masalah:** Setiap pesan support chat trigger Prisma query ambil semua active services. Service jarang berubah (mungkin seminggu sekali), tapi query jalan tanpa cache.

```typescript
const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { title: true, description: true, price: true, currency: true }
});
```

**Dampak:** 200+ query DB/menit untuk 10 user aktif. Service jarang berubah.

**Fix:** Bungkus dengan `unstable_cache` TTL 3600s atau cache di module level.

---

### C3. `lib/integrations/midtrans.ts:53-88` + `creem.ts:76-95` — [SELESAI] Singleton Credential Kedaluarsa

**Masalah:** Midtrans & Creem instance dibuat sekali (singleton). Saat admin update kredensial di panel, instance tetap pakai config lama sampai server restart.

```typescript
let snapInstance: MidtransSnap | null = null;
export async function getSnap(): Promise<MidtransSnap> {
    if (!snapInstance) {
        const config = await paymentGatewayService.getMidtransConfig();
        snapInstance = new MidtransLib.Snap({ ... });
    }
    return snapInstance; // ← selalu return instance lama
}

// Fungsi reset ada tapi TIDAK PERNAH dipanggil otomatis
export function resetMidtransInstances() { snapInstance = null; }
```

**Dampak:** **Silent payment failure** setelah admin update kredensial sampai restart server.

**Fix:** Auto-reset instance via webhook config update atau validasi tiap X jam.

---

### C4. `lib/server/marketing.ts` + `leads.ts` + `changelog.ts` — [SELESAI] 7+ Fungsi Tanpa Pagination

**Masalah:** Banyak fungsi `findMany()` tanpa `take` limit. Data akan bertambah terus seiring waktu.

| File | Fungsi | Baris |
|------|--------|-------|
| `lib/server/marketing.ts` | `getCoupons()` | 6 |
| `lib/server/marketing.ts` | `getSubscribers()` | 138 |
| `lib/server/marketing.ts` | `getPromotions()` | 163 |
| `lib/server/marketing.ts` | `getBonuses()` | 77 |
| `lib/server/leads.ts` | `getLeads()` | 22 |
| `lib/server/changelog.ts` | `getChangelogs()` | 3 |
| `lib/server/testimonials.ts` | `getAllTestimonials()` | 30 |
| `app/api/admin/affiliates/route.ts` | affiliate list | 22 |
| `app/api/admin/marketing/assets/route.ts` | asset list | 18 |

**Dampak:** OOM server saat tabel tumbuh. CPU/Database full scan.

**Fix:** Tambahkan `take: 50` + cursor/offset pagination di semua fungsi.

---

### C5. `lib/integrations/storage.ts:100-106` — [SELESAI] File Di-Load ke Memory 2x Before Upload

**Masalah:** File diubah ke `ArrayBuffer` lalu dikonversi lagi ke `Buffer` — dua kopi di memory.

```typescript
if (fileOrBuffer instanceof File) {
    const arrayBuffer = await fileOrBuffer.arrayBuffer(); // Kopi 1
    buffer = Buffer.from(arrayBuffer);                     // Kopi 2
}
// S3 client bisa buat kopi ke-3 internally
await client.send(new PutObjectCommand({ Body: buffer }));
```

**Dampak:** File 500MB → ~1.5GB RAM. Risiko OOM.

**Fix:** Pakai streaming via `@aws-sdk/lib-storage` Upload.

---

### C6. `prisma/schema.prisma` — [SELESAI] 5 Model Tanpa Index

**Masalah:** Model berikut tidak memiliki index sama sekali → full table scan tiap query.

- `PopUp` (line 502)
- `Lead` (line 524)
- `MarketingBonus` (line 258)
- `MarketingAsset` (line 423)
- `Promotion` (line 564)

**Dampak:** Setiap query ke tabel ini scan seluruh baris. Makin besar data, makin lambat.

**Fix:** Tambahkan `@@index([isActive])` dan index komposit sesuai pola query.

---

### C7. `components/chat/interface.tsx:92-115` — [SELESAI] Array Map Tiap Streaming Chunk

**Masalah:** Streaming chat update `setMessages` dengan `prev.map(...)` tiap chunk. 100 chunks = 100 array baru + 100 re-render + scroll effect.

```typescript
// Baris 110-114: Full array map pada setiap chunk
setMessages(prev => prev.map(m =>
    m.id === assistantId
        ? { ...m, content: accumulatedContent }
        : m
));
```

**Dampak:** O(n²) re-render untuk satu streamed message. Layout thrashing dari smooth scroll tiap chunk.

**Fix:** Gunakan `useRef` untuk mutate langsung + throttle re-render 50-100ms.

---

## 🟠 High

### H1. `components/landing/hero-content.tsx:346-471` — [SELESAI] Animasi Infinite Framer Motion

**Masalah:** SVG decorative path animation dengan `repeat: Infinity`. Jalan 60fps terus-menerus.

```tsx
<motion.path
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{
        repeat: isMobile ? 0 : Infinity,
        repeatType: "loop",
        repeatDelay: 1
    }}
/>
```

**Dampak:** 5-15% CPU core terus-menerus untuk efek dekoratif.

**Fix:** Hapus `repeat: Infinity` atau pakai `useReducedMotion()`.

---

### H2. `components/landing/section-stats.tsx:176-203` — [SELESAI] setInterval + AnimatePresence Rotasi SVG

**Masalah:** `setInterval` 2 detik rotasi 17 SVG logo via `AnimatePresence`. Setiap rotasi create/destroy DOM node.

```tsx
useEffect(() => {
    const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % TECH_STACK.length);
    }, 2000);
    return () => clearInterval(timer);
}, []);
```

**Dampak:** 300+ cycle per 10 menit. Masing-masing create SVG + animasi masuk/keluar.

**Fix:** Kurangi interval, gunakan CSS transition, atau non-aktifkan saat tab hidden.

---

### H3. `lib/config/genkit-stream.ts:51-53` — [SELESAI] setTimeout 100ms Sebelum Close Stream

**Masalah:** Tiap stream response nunggu 100ms artificial delay sebelum `controller.close()`.

```typescript
finally {
    setTimeout(() => {
        controller.close();
    }, 100);
}
```

**Dampak:** 100 detik kumulatif wasted connection time per 1000 request. Connection hold socket + buffer.

**Fix:** Hapus delay, close stream langsung.

---

### H4. `lib/config/genkit-stream.ts:18` — [SELESAI] new TextEncoder() Tiap Chunk

**Masalah:** `TextEncoder` adalah stateless & reusable, tapi dibuat baru tiap chunk.

```typescript
function enqueue(data) {
    const out = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(out)); // ← tiap chunk
}
```

**Dampak:** 500× alokasi objek per stream. GC pressure.

**Fix:** Buat sekali di module scope.

---

### H5. `lib/store/sidebar-store.ts:12-23` — [SELESAI] persist Write Tanpa Debounce

**Masalah:** Zustand `persist` middleware write ke `localStorage` sinkron tiap toggle sidebar, tanpa debounce/throttle.

```typescript
export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            isCollapsed: false,
            toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
        }),
        { name: "sidebar-storage" }
    )
);
```

**Dampak:** `JSON.stringify` + `localStorage.setItem` tiap toggle. Saat rapid toggle (resize, animasi), block main thread.

**Fix:** Gunakan `partialize` + debounce write.

---

### H6. `lib/store/floating-chat-store.ts:17-20` — [SELESAI] Function Refs Berubah Tiap State Change

**Masalah:** Arrow functions didefinisikan inline di Zustand `create`. Tiap state change, seluruh store object (termasuk method) dibuat ulang → komponen yang subscribe dapat ref baru → break `React.memo`.

```typescript
export const useFloatingChat = create<FloatingChatStore>((set) => ({
    openChat: (mode = 'ai') => set({ ... }),
    closeChat: () => set({ ... }),
    toggleChat: () => set((state) => ({ ... })),
    setIsMenuOpen: (open) => set({ ... }),
}));
```

**Dampak:** 6+ komponen re-render tak perlu per toggle.

**Fix:** Ekstrak method ke luar `create()` atau gunakan `useStore` dengan selector.

---

### H7. `hooks/use-safe-user.ts:11-16` — [SELESAI] Object Spread Tiap Render

**Masalah:** Spread seluruh user object + conditional create tiap render tanpa `useMemo`.

```typescript
const mockUserFallback = user?.profileImageUrl === "" ? {
    ...user,
    displayName: user.displayName || undefined,
    primaryEmail: user.primaryEmail || undefined,
    profileImageUrl: undefined
} : undefined;
```

**Dampak:** Alokasi objek baru tiap render. `useUser()` dari Stack Auth return new reference tiap render.

**Fix:** Bungkus dengan `useMemo([user?.profileImageUrl])`.

---

### H8. `components/admin/marketing/promotions-manager.tsx:50-60` — [SELESAI] Single Form State Full Re-render

**Masalah:** Tiap keystroke bikin object baru via spread → full form re-render (termasuk semua input, button, badge).

```tsx
const [formData, setFormData] = useState({ ... });
// ...
onChange={(e) => setFormData({ ...formData, title: e.target.value })}
```

**Dampak:** ~10 subtree reconciliation/detik. Pola yang sama di `seo-settings-form.tsx`, `general-settings-form.tsx`, `push-manager.tsx`.

**Fix:** Gunakan individual `useState` per field atau `useRef` + uncontrolled.

---

### H9. `lib/server/cloudflare-rendering.ts:80-93` — [SELESAI] 3× Regex Pass Atas Full HTML String

**Masalah:** Tiga regex pass terpisah scan seluruh HTML string yang bisa megabyte besar.

```typescript
enhancedHtml = enhancedHtml.replace(/(href|src)="\/(...)/g, ...);
enhancedHtml = enhancedHtml.replace(/(href|src)="(https?:\/\/...)/g, ...);
enhancedHtml = enhancedHtml.replace(/url\(['"]?([^'")]+...)/g, ...);
```

**Dampak:** 3× full scan + 3× string alokasi per page view.

**Fix:** Gabung dalam single pass dengan callback function.

---

## 🟡 Medium

### M1. [SELESAI] Fungsi Reset Instance Tidak Pernah Dipanggil

| File | Fungsi | Baris |
|------|--------|-------|
| `lib/integrations/midtrans.ts` | `resetMidtransInstances()` | 93-97 |
| `lib/integrations/creem.ts` | `resetCreemInstance()` | 100-103 |

**Kategori:** Fitur prematur — dead code. Tidak ada webhook, cron, atau revalidation yang memanggilnya.

---

### M2. `app/genkit/ai.ts:13-75` — [SELESAI] Double Caching

**Masalah:** `inFlightRequests` Map + `unstable_cache` dari Next.js melakukan hal yang sama. Map tidak pernah shrink dan redundant.

```typescript
const inFlightAIRequests = new Map<string, Promise<unknown>>();
// Cek Map dulu, baru panggil unstable_cache
if (inFlightAIRequests.has(cacheKey))
    return inFlightAIRequests.get(cacheKey);
inFlightAIRequests.set(cacheKey, request);
// finally { inFlightAIRequests.delete(cacheKey); }
```

Plus Async IIFE wrapping yang hanya tambah microtask:
```typescript
const request = (async () => {
    return unstable_cache(async () => { ... }, [cacheKey], { revalidate: 3600 })();
})();
```

**Kategori:** Over-engineering. Extra Map ops + extra microtask tiap call.

---

### M3. `app/genkit/flows/` — [SELESAI] Duplicate Zod Schema di 3 Files

**Masalah:** Schema didefinisikan 2× (di `defineFlow` + `ai.generate`) untuk estimator, product-generator, service-generator.

```typescript
outputSchema: z.object({ title: z.string(), ... })  // di defineFlow
output: { schema: z.object({ title: z.string(), ... }) }  // di ai.generate — SAMA
```

**Dampak:** Memory double. Risiko divergen di masa depan.

---

### M4. `app/genkit/flows/service-generator.ts:39-108` — [SELESAI] Prompt + Schema Boros Token

**Masalah:** Prompt ~1800 chars instruksi + schema 60+ line Zod dikirim tiap API call. Schema duplikat (lihat M3).

**Dampak:** 10k+ token per call. $1.50 wasted per 100 request untuk boilerplate.

**Fix:** Cache prompt sebagai constant di luar handler, hapus duplicate schema.

---

### M5. `lib/server/pricing-service.ts:43-49` — [SELESAI] 4× Upsert Query

**Masalah:** Saving pricing config menjalankan 4 upsert queries terpisah dalam transaction, padahal cukup 1 row dengan JSON value.

```typescript
const ops = [
    prisma.systemSetting.upsert({ where: { key: KEYS.BASE_RATE }, ... }),
    prisma.systemSetting.upsert({ where: { key: KEYS.MULT_LOW }, ... }),
    prisma.systemSetting.upsert({ where: { key: KEYS.MULT_MED }, ... }),
    prisma.systemSetting.upsert({ where: { key: KEYS.MULT_HIGH }, ... }),
];
```

**Dampak:** 4× DB writes + 4× transaction overhead. Bandingkan dengan `payment-gateway-service.ts` yang simpan JSON di 1 row.

---

### M6. `lib/server/affiliates.ts:5-37` — [SELESAI] Memory Leak Potensial

**Masalah:** `inFlightAffiliateRequests` Map tidak punya TTL. Jika promise never resolves (DB hang), entry tetap di Map forever.

```typescript
const inFlightAffiliateRequests = new Map<string, Promise<any>>();
// finally { inFlightAffiliateRequests.delete(referralCode); }
// ^ Tidak jalan jika promise never resolve/reject
```

---

### M7. `app/api/admin/products/route.ts:73` — [SELESAI] Push Broadcast dengan Empty Array

```typescript
await broadcastPushNotification([], {  // Empty array!
    title: "Produk Baru Rilis! 🔥",
    body: `${name} kini tersedia...`,
    ...
});
```

**Dampak:** Trigger seluruh push machinery (pool init, Promise.all, array copies) untuk no-op.

---

### M8. `app/api/marketing/track/route.ts:34-54` — [SELESAI] Race Condition Duplicate Referral

**Masalah:** TOCTOU — dua request concurrent bisa lolos `findFirst` lalu `create` duplikat.

**Fix:** Unique constraint `@@unique([affiliateId, visitorId])` + handle error.

---

### M9. `lib/server/payment-service.ts:13-19` — [SELESAI] Hardcoded Fallback Rate 15000 IDR/USD

```typescript
const fallbackRate = 15000;
// Bisa over/under-charge jika rate aktual sudah berbeda
```

**Fix:** Simpan last known rate di DB, atau gunakan rata-rata historical rate.

---

### M10. `lib/server/marketing.ts:150-159` — [SELESAI] Ambil Coupon Termuda, Bukan Terbaik

```typescript
return await prisma.coupon.findFirst({
    where: { isActive: true, ... },
    orderBy: { createdAt: "desc" },  // ← ambil yang termuda
});
```

**Dampak:** Bisa kasih user diskon paling kecil karena tidak sorting by value.

---

### M11. `lib/integrations/storage.ts:42-49` — [SELESAI] Log Credential ke Console

```typescript
console.log("[Storage] Initializing R2 Client", {
    bucketName,
    accessKeyId: accessKeyId?.slice(0, 4) + '...',
    secretLength: secretAccessKey?.length,
});
```

**Dampak:** Ekspos bucket name + partial key + secret length di production log.

---

### M12. `components/providers/currency-provider.tsx:81-83` — [SELESAI] Return null Sampai mounted

```tsx
if (!mounted) { return null; }
```

**Dampak:** Layout shift + full subtree re-render setelah mount. Child components render 2×.

---

## 🟢 Low

### L1. `lib/utils/crypto.ts:18-25` — [SELESAI] String Concatenation O(n²)

```typescript
for (let i = 0; i < length; i++) {
    result += chars[crypto.randomInt(0, chars.length)];
}
```

**Fix:** Gunakan array + `join('')`.

---

### L2. `proxy.ts:60,87` — [SELESAI] console.log di Middleware

Console.log di middleware yang jalan tiap request. I/O waste di production.

---

### L3. `proxy.ts:62-68` — [SELESAI] AbortController Timeout Leak

Jika `fetch` throw synchronous, `clearTimeout` tidak pernah jalan → dangling timer.

---

### L4. `app/genkit/flows/consultant.ts:82-84` — [SELESAI] Loop `shift()` O(n²)

```typescript
while (historyMessages.length > 0 && historyMessages[0].role !== 'user') {
    historyMessages.shift(); // O(n) each iteration → O(n²)
}
```

---

### L5. `lib/config/db.ts:16-18` — [SELESAI] parseInt Tanpa Validasi

```typescript
const poolMax = process.env.DATABASE_POOL_SIZE
    ? parseInt(process.env.DATABASE_POOL_SIZE, 10)
    : ...
```

Jika env var = `"0"` atau `"abc"`, pool size jadi 0 atau NaN → connection starvation.

---

### L6. `components/landing/typing-hero-title.tsx:49` — [SELESAI] Nested setTimeout Tidak di-cleanup

```typescript
setTimeout(() => setIsDeleting(true), 1800); // Tidak ada cleanup
```

Orphan timer terus jalan meski component unmount.

---

### L7. `components/admin/support/chat-console.tsx:38-44` — [SELESAI] filter/find Tiap Render Tanpa useMemo

```typescript
const selectedTicket = tickets.find(t => t.id === selectedTicketId);
const filteredTickets = tickets.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) // tiap keystroke
);
```

---

## Database Index Issues

### [SELESAI] Missing Indexes pada `prisma/schema.prisma`

| Model | Missing Index | Query Pattern |
|-------|--------------|---------------|
| `Notification` | `@@index([userId, isRead])` | Mark all as read |
| `DigitalOrder` | `@@index([userEmail, status])` | Subscription check |
| `ReferralUsage` | `@@index([affiliateId, visitorId])` | Deduplication (juga perlu unique) |
| `Estimate` | `@@index([prompt])` | Filter "Instant Quote Calculator" |
| `SystemKey` | `@@index([provider, isActive])` | API key validation |
| `Order` | `@@index([userId, status])` | User order listing |
| `Changelog` | `@@index([status])` | Published only filter |
| `Testimonial` | `@@index([isActive])` | Active testimonials |
| `SquadProfile` | `@@index([status])` | Admin filtering |
| `MissionApplication` | `@@index([status])` | Status filtering |
| `AffiliateProfile` | `@@index([status])` | Admin filtering |

---

## 🔴 Round 2 — TINGGI (Belum Diperbaiki)

### R2-C1. `listUsers()` Masih Dipanggil di 8+ Lokasi

**Masalah:** bug.md C1 hanya fix `projects/route.ts`. Tapi `hexclaverServerApp.listUsers()` masih dipanggil di banyak tempat lain.

| Lokasi | File | Baris |
|--------|------|-------|
| API Experts | `app/api/experts/route.ts` | 29 |
| API Admin Users | `app/api/admin/users/route.ts` | 12 |
| Halaman Service | `app/(public)/services/[slug]/page.tsx` | 68 |
| Halaman Admin Clients | `app/admin/clients/page.tsx` | 15 |
| Halaman Admin Team | `app/admin/team/page.tsx` | 36 |
| Halaman Admin Projects | `app/admin/pm/projects/page.tsx` | 49 |
| Server Action Quotes | `app/actions/quotes.ts` | 87 |
| (dan beberapa lainnya) | | |

**Dampak:** Tiap call = 5-10MB+ JSON per request + N+1 API calls. Untuk halaman publik seperti `services/[slug]`, beban server tinggi tanpa kontrol akses.

**Fix:** Cache hasil `listUsers()`, ganti DB-level lookup, atau implementasi pagination.

---

### R2-C2. `handler/[...hexclave]/page.tsx:7-8` — Console.log Ekspos Token Auth

```typescript
console.log("HANDLER PARAMS:", params);
console.log("HANDLER SEARCH PARAMS:", searchParams);
```

**Masalah:** Mencetak semua parameter URL (termasuk token auth, callback URL, dll) ke server log tiap request ke handler.

**Dampak:** **Security — ekspos data sensitif** di production log. Potensi penyalahgunaan jika log bocor.

**Fix:** Hapus `console.log` atau filter sensitive keys.

---

### R2-C3. `checkout/route.ts:313-315` — Error Response Ekspos Detail Internal

```typescript
return NextResponse.json({
    error: error instanceof Error ? error.message : "Internal Error",
    debugSteps,
    details: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
}, { status: 500 });
```

**Masalah:** Mengembalikan `debugSteps` + full error details ke client. Bisa expose internal logic, stack trace, variable values.

**Dampak:** **Security — information disclosure.**

**Fix:** Hapus `debugSteps` dan `details` dari response production. Log saja di server.

---

### R2-C4. `api/admin/licenses/route.ts:18` — Pagination Hilang

```typescript
return await prisma.license.findMany({
    orderBy: { createdAt: 'desc' }
});
```

**Masalah:** `license.findMany()` tanpa `take` limit — sama persis seperti C4 yang sudah diperbaiki di file lain tapi terlewat.

**Dampak:** OOM server saat jumlah license besar (ribuan).

**Fix:** Tambahkan `take: 50` + pagination.

---

### R2-C5. `prisma/schema.prisma` — Model `Service`, `Product`, `Coupon` Masih Tanpa Index

| Model | Index Diperlukan | Query Pattern |
|-------|-----------------|---------------|
| `Service` | `@@index([isActive, visibility])` | `findMany({ where: { isActive: true, visibility: 'PUBLIC' } })` |
| `Service` | `@@index([category])` | Filter kategori |
| `Product` | `@@index([isActive])`, `@@index([type])` | Filter produk aktif/tipe |
| `Coupon` | `@@index([isActive])` | `findFirst({ where: { isActive: true } })` |
| `DigitalOrder` | `@@index([createdAt])` | `findFirst({ orderBy: { createdAt: 'desc' } })` |
| `MarketingSubscriber` | `@@index([createdAt])` | `findMany({ orderBy: { createdAt: 'desc' } })` |

**Dampak:** Full table scan tiap query. Makin besar data, makin lambat.

---

### R2-C6. `lib/server/popups.ts:6-29` — PopUp Queries Tanpa `take` Limit

```typescript
export async function getPopUps() {
    return await prisma.popUp.findMany({ orderBy: { createdAt: "desc" } });
}
export async function getActivePopUps() {
    return await prisma.popUp.findMany({ where: { isActive: true }, ... });
}
```

**Masalah:** Terlewat dari batch fix C4. Dua fungsi `findMany()` tanpa `take` limit.

**Dampak:** Full table scan + OOM potensial saat data PopUp membesar.

**Fix:** Tambahkan `take: 100`.

---

### R2-C7. Banyak Endpoint Publik Kurang `Cache-Control` Headers

| Endpoint | Data |
|----------|------|
| `app/api/services/route.ts` | Services (jarang berubah) |
| `app/api/testimonials/route.ts` | Testimonials (jarang berubah) |
| `app/api/marketing/promotions/route.ts` | Promotions (jarang berubah) |
| `app/api/experts/route.ts` | Experts (jarang berubah) |
| `app/api/public/popups/route.ts` | PopUps (punya `revalidate` tapi tanpa response header) |

**Masalah:** Browser/CDN tidak bisa cache response, tiap request hit server.

**Fix:** Tambahkan `Cache-Control: public, max-age=3600` di response.

---

## 🟠 Round 2 — SEDANG

### R2-M1. `import * as LucideIcons` di 3 File — Tree-Shaking Mati

| File | Baris |
|------|-------|
| `components/checkout/checkout-summary.tsx` | 5 |
| `components/checkout/digital-checkout-summary.tsx` | 5 |
| `components/admin/marketing/bonuses-manager.tsx` | 11 |

**Masalah:** Import namespace (`* as`) mencegah tree-shaking. Semua icon dari Lucide React masuk ke bundle meski cuma dipakai 2-3 icon.

**Dampak:** Bundle +150-200KB wasted.

**Fix:** Ganti `import * as LucideIcons` → `import { Layers, PlusCircle } from "lucide-react"`.

---

### R2-M2. ReactMarkdown Tidak Lazy-Loaded

| Lokasi | Baris |
|--------|-------|
| `components/chat/interface.tsx` | 3 |
| `components/ui/floating-chat.tsx` | 12 |
| `components/chat/chat-message.tsx` | 5 |

**Masalah:** `react-markdown` (~35KB gzipped) di-import di Client Components. Masuk ke semua client bundle meski tidak semua halaman pakai markdown.

**Fix:** Gunakan `next/dynamic` untuk lazy-loading:
```tsx
const ReactMarkdown = dynamic(() => import('react-markdown'));
```

---

### R2-M3. `push-manager.tsx` — Single Form State Spread Tiap Keystroke

**Lokasi:** `components/admin/marketing/push-manager.tsx:15-18,94,105,116`

**Masalah:** Sama persis seperti H8 (promotions-manager.tsx) yang sudah diperbaiki pake `useRef`, tapi `push-manager.tsx` masih pake `setFormData({ ...formData, title: e.target.value })` → full form re-render tiap keystroke.

**Dampak:** ~10 subtree reconciliation/detik saat mengetik.

**Fix:** Copy pola dari `PromotionDialog` — ganti ke `useRef` + `defaultValue`.

---

### R2-M4. `service-worker-registrar.tsx:69-74` — setInterval Tidak di-cleanup

```typescript
setInterval(() => {
    registration.update();
}, 60 * 60 * 1000);
```

**Masalah:** Interval dibuat tanpa cleanup. Jika komponen remount, interval baru dibuat tanpa hapus yang lama → **memory leak**.

**Fix:** Pindahkan ke `useEffect` + return `clearInterval`.

---

### R2-M5. `key={index}` di 5 Komponen

| Lokasi | Baris |
|--------|-------|
| `components/landing/section-stats.tsx` | 193 |
| `components/ui/dynamic-list-input.tsx` | 53 |
| `components/ui/dynamic-addon-input.tsx` | 66 |
| `components/marketing/affiliate-sidebar-navigation.tsx` | 36 |
| `components/dashboard/missions/daily-log-feed.tsx` | 183 |

**Masalah:** Index sebagai key → React tidak bisa bedain elemen saat list berubah (reorder/filter).

**Dampak:** Bug UI — wrong element reconciliation, stale state.

**Fix:** Ganti dengan unique ID dari data.

---

### R2-M6. 3 API Routes Lagi Tanpa Pagination

| Lokasi | Baris | Tabel |
|--------|-------|-------|
| `app/api/marketing/assets/route.ts` | 14-17 | MarketingAsset |
| `app/api/services/route.ts` | 16-19 | Service |
| `app/api/dashboard/tickets/route.ts` | 23-35 | Ticket |

**Fix:** Tambahkan `take: 50`.

---

### R2-M7. Dockerfile — `bun install --production` di Runner Stage Tidak Perlu

**Lokasi:** `Dockerfile:68-73`

**Masalah:** Standalone output Next.js sudah include node_modules di `.next/standalone`. Install ulang di runner stage = layer tambahan ~200MB.

**Fix:** Hapus langkah `bun install --production` di runner stage.

---

### R2-M8. `next.config.ts:49-52` — Wildcard `*.r2.dev` Terlalu Luas

```typescript
{
    protocol: 'https',
    hostname: '*.r2.dev',
    pathname: '/**',
}
```

**Masalah:** Wildcard `*.r2.dev` termasuk subdomain milik orang lain. Attacker bisa serve image via `attacker.r2.dev` yang akan di-optimasi Next.js.

**Fix:** Ganti dengan hostname spesifik bucket.

---

## 🟢 Round 2 — RENDAH

### R2-L1. `lib/server/push.ts:74-75` — Double `.filter()` Iterasi

```typescript
const successful = results.filter((r) => r.success).length;
const expired = results.filter((r) => r.expired).length;
```

**Fix:** Gabung jadi 1× `.reduce()`.

---

### R2-L2. `console.log` di Server Files

| File | Baris | Isi |
|------|-------|-----|
| `lib/server/webhook-trigger.ts` | 6, 27 | Ekspos URL webhook |
| `lib/server/currency-service.ts` | 101, 140 | Debug log fetch rates |
| `lib/server/payment-gateway-service.ts` | 83, 95 | Config saved |
| `lib/server/cloudflare-rendering.ts` | 125, 181 | Ekspos URL yang di-render |

**Fix:** Hapus atau ganti `console.debug`.

---

### R2-L3. `console.log` di Client Components

| File | Baris | Isi |
|------|-------|-----|
| `components/ui/floating-chat.tsx` | 290, 301 | User state + mode switching |
| `components/public/push-notification-banner.tsx` | 7 | Module-level log |

**Fix:** Hapus.

---

### R2-L4. `package.json` — Dependency `"sheet": "^0.2.0"` Tidak Dipakai

Semua import Sheet dari `@/components/ui/sheet` yang pakai `@radix-ui/react-dialog`, bukan package `sheet`.

**Fix:** Hapus dari dependencies.

---

### R2-L5. `next.config.ts:25` — `lodash` di `optimizePackageImports` Tapi Tidak Ada

`lodash` tidak ada di dependencies, tapi tercantum di `optimizePackageImports`. Tidak error, tapi config inconsistent.

**Fix:** Hapus `'lodash'` dari array.

---

### R2-L6. `app/api/marketing/assets/route.ts` — Auth Check Kurang Strict

Endpoint cek user login aja, tidak cek role affiliate/admin.

**Fix:** Tambahkan role check.

---

## 💡 Rekomendasi Prioritas — Round 2

### Segera (Security + RAM)

1. **Bersihin `listUsers()` di 8 lokasi lain (R2-C1)** — dampak paling besar, udah ada preseden fix
2. **Hapus `console.log(params)` di handler (R2-C2)** — security issue serius
3. **Fix error response checkout (R2-C3)** — information disclosure
4. **Tambah index di Service, Product, Coupon (R2-C5)** — full table scan tiap query
5. **Pagination di licenses, popups, assets, services, tickets (R2-C4 + R2-M6)**

### Performa

6. **Fix `push-manager.tsx` ke useRef (R2-M3)** — copy pola dari PromotionsDialog yang udah beres
7. **Ganti `import * as LucideIcons` (R2-M1)** — hemat 150-200KB bundle
8. **Lazy-load ReactMarkdown (R2-M2)** — hemat 35KB di bundle awal
9. **Cleanup setInterval SW registrar (R2-M4)** — cegah memory leak
10. **Ganti `key={index}` (R2-M5)** — cegah bug UI

### Cleanup

11. **Hapus console.log server/client (R2-L2 + R2-L3)**
12. **Hapus dependency sheet tidak dipakai (R2-L4)**
13. **Cache-Control headers di endpoint publik (R2-C7)**
14. **Fix push.ts double filter (R2-L1)**

---

## 🔴 Round 3 — API REDUNDAN

### R3-C1. 5 Endpoint Dead Code (Tak Dipakai Siapa Pun)

| Endpoint | File | Method | Keterangan |
|----------|------|--------|------------|
| `/api/deploy` | `app/api/deploy/route.ts` | POST | Fitur deployment trigger — tidak ada UI yang panggil |
| `/api/admin/users` | `app/api/admin/users/route.ts` | GET | Tidak ada komponen panggil, tapi masih `listUsers()` → boros RAM |
| `/api/admin/licenses/[id]` | `app/api/admin/licenses/[id]/route.ts` | DELETE | License di-regenerate via server action, bukan API |
| `/api/marketing/coupon/promotion` | `app/api/marketing/coupon/promotion/route.ts` | GET | Tidak ada UI yang panggil |
| `/api/proxy/asset` | `app/api/proxy/asset/route.ts` | GET | Mungkin digantikan oleh `/api/storage/proxy` |

**Dampak:** Dead code = maintenance burden + waste disk space + kebingungan developer.

**Fix:** Hapus 5 file route + bersihin referensi.

---

### R3-C2. 3 Endpoint Broken (Dipanggil Tapi Route-nya Tidak Ada → 404)

| Endpoint yang Dipanggil | Caller | Baris |
|-------------------------|--------|-------|
| `/api/squad/payout` | `components/squad/payout-request-form.tsx` | 43 |
| `/api/squad/missions/apply` | `components/squad/mission-application-form.tsx` | 31 |
| `/api/storage` (tanpa `/media`) | `app/admin/pm/[id]/preview-uploader.tsx` | 30 |

**Dampak:** Setiap panggilan return 404. User dapat error silent. ~18 calls/hari sia-sia.

**Fix:** Buat route yang hilang atau arahkan caller ke endpoint yang benar.

---

### R3-C3. Duplikasi CRUD Product — API Route vs Server Action

**Masalah:** Product CRUD diimplementasi 2× secara paralel.

| Operasi | Server Action (`digital-products.ts`) | API Route (`/api/admin/products`) |
|---------|---------------------------------------|-----------------------------------|
| Create | `createDigitalProduct()` | `POST /api/admin/products` |
| Read | `getDigitalProducts()` | `GET /api/admin/products` |
| Read by slug | `getDigitalProductBySlug()` | — |
| Update | `updateDigitalProduct()` | `PATCH /api/admin/products/[id]` |
| Delete | `deleteDigitalProduct()` | `DELETE /api/admin/products/[id]` |

**Duplikasi serupa juga ditemukan di:**
- **Estimates delete** — `quotes.ts:deleteQuote()` vs `DELETE /api/estimates/[id]`
- **System keys** — `system-keys.ts:createAgencyKey()` vs `POST /api/system/keys`

**Dampak:** 2 code path untuk 1 fungsi. Bug bisa diperbaiki di satu tempat tapi masih ada di tempat lain. Server Action lebih aman (type-safe, zero HTTP overhead).

**Fix:** Pilih Server Action, hapus API route. Pindahkan push notification dari API route ke Server Action.

---

### R3-C4. 3 Endpoint Marketing Assets untuk 1 Entitas

| Endpoint | Level Akses | Perbedaan |
|----------|-------------|-----------|
| `/api/marketing/assets` | Authenticated user | Semua active assets |
| `/api/public/marketing/assets` | Public + CORS headers | Hanya `banner_widget` type, field terbatas |
| `/api/admin/marketing/assets` | Admin only | Semua assets, dengan pagination |

**Dampak:** 3 endpoint hampir identik. Perubahan logika harus di 3 tempat.

**Fix:** Merge jadi 1 endpoint dengan query parameter `?type=banner_widget&scope=public|user|admin`.

---

### R3-C5. Payment Status — 2 Endpoint Terpisah

| Endpoint | Fungsi |
|----------|--------|
| `/api/payment/status` | Cek status pembayaran order reguler |
| `/api/digital-payment/status` | Cek status pembayaran digital order |

**Dampak:** Logika identik, beda tabel Prisma. Duplikasi kode.

**Fix:** Unified jadi 1 endpoint dengan parameter `?type=digital|regular`.

---

### R3-C6. Checkout — 2 Endpoint dengan Validasi Kupon Dobel

| Client-side | Server-side |
|-------------|-------------|
| `POST /api/marketing/coupon/validate` (client validasi dulu) | Lalu validasi ULANG di `POST /api/checkout` atau `POST /api/digital-checkout` |

**Dampak:** Validasi kupon dilakukan 2× per transaksi. 400 calls/hari redundant.

**Fix:** Hapus validasi client-side. Cukup sertakan `{ couponCode }` di body checkout. Validasi server-side sudah ada.

---

### R3-C7. Sequential Call Patterns (Bisa Di-batch)

**Pattern #1 — Floating Chat Mount (2 calls sequential)**
`components/ui/floating-chat.tsx:90-116`
```
fetch("/api/system/keys/status") → lalu → fetch("/api/system/contact")
```
**Dampak:** 2 TCP koneksi + 2 response parsing. Bisa jadi 1.

**Pattern #2 — Affiliate Resources Page (3 calls)**
`app/affiliate/(dashboard)/resources/page.tsx:31-49`
```
fetch("/api/public/agency-info") → lalu → fetch("/api/marketing/affiliate/stats") → lalu → fetch("/api/marketing/assets")
```
**Dampak:** 3× latency + 3× parsing. Bisa jadi 1 call.

**Pattern #3 — Checkout (2 calls, validasi dobel)**
`components/checkout/payment-sidebar.tsx:76,101`
```
POST /api/marketing/coupon/validate → lalu → POST /api/checkout
```
**Dampak:** Validasi kupon 2×. Lihat R3-C6.

---

### R3-C8. Endpoint dengan `listUsers()` (RAM Boros)

| Endpoint | File | Baris |
|----------|------|-------|
| `/api/admin/users` | `app/api/admin/users/route.ts` | 12 |
| `/api/experts` | `app/api/experts/route.ts` | 29 |

Dua endpoint ini masih panggil `hexclaverServerApp.listUsers()` — lihat R2-C1. Selain jadi dead code (admin/users), juga boros RAM.

---

## 🟠 Round 3 — SEDANG

### R3-M1. `app/api/marketing/assets/route.ts` — Auth Check Kurang Strict

Hanya cek user login, tidak cek role. User biasa bisa lihat semua marketing assets.

---

### R3-M2. Banyak Endpoint Publik Tanpa `Cache-Control` Header

| Endpoint | Data |
|----------|------|
| `/api/services` | Services (jarang berubah) |
| `/api/testimonials` | Testimonials (jarang berubah) |
| `/api/marketing/promotions` | Promotions (jarang berubah) |
| `/api/experts` | Experts (jarang berubah) |
| `/api/public/popups` | PopUps (punya `revalidate` tapi tanpa response header) |

**Dampak:** Browser/CDN tidak bisa cache. Tiap navigasi → hit server.

**Fix:** Tambahkan `Cache-Control: public, max-age=3600` di response.

---

## 💡 Rekomendasi Prioritas — Round 3

### Segera

1. **Fix 3 broken endpoints (R3-C2)** — 404 setiap dipanggil, user experience broken
2. **Hapus duplikasi Product CRUD (R3-C3)** — pilih Server Action, hapus API route
3. **Hapus 5 dead code endpoints (R3-C1)** — bersihin kode tak terpakai
4. **Hapus validasi kupon client-side (R3-C6)** — cukup sekali di server checkout

### Performa

5. **Batch floating-chat sequential calls (R3-C7)** — 1 composite endpoint
6. **Unify payment status endpoints (R3-C5)** — 1 endpoint dengan parameter type
7. **Merge marketing assets endpoints (R3-C4)** — 1 endpoint dengan query filter
8. **Cache-Control headers (R3-M2)** — hemat server load

### Cleanup

9. **Fix auth check marketing assets (R3-M1)**
10. **Hapus `listUsers()` dari experts + admin/users (R3-C8)** — overlap dengan R2-C1

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

### C1. `app/api/projects/route.ts:31` — Load Semua User dari Auth Provider

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

### C2. `app/genkit/flows/support.ts:28-31` — Query DB Tanpa Cache Tiap Chat

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

### C3. `lib/integrations/midtrans.ts:53-88` + `creem.ts:76-95` — Singleton Credential Kedaluarsa

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

### C4. `lib/server/marketing.ts` + `leads.ts` + `changelog.ts` — 7+ Fungsi Tanpa Pagination

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

### C5. `lib/integrations/storage.ts:100-106` — File Di-Load ke Memory 2x Sebelum Upload

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

### C6. `prisma/schema.prisma` — 5 Model Tanpa Index

**Masalah:** Model berikut tidak memiliki index sama sekali → full table scan tiap query.

- `PopUp` (line 502)
- `Lead` (line 524)
- `MarketingBonus` (line 258)
- `MarketingAsset` (line 423)
- `Promotion` (line 564)

**Dampak:** Setiap query ke tabel ini scan seluruh baris. Makin besar data, makin lambat.

**Fix:** Tambahkan `@@index([isActive])` dan index komposit sesuai pola query.

---

### C7. `components/chat/interface.tsx:92-115` — Array Map Tiap Streaming Chunk

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

### H1. `components/landing/hero-content.tsx:346-471` — Animasi Infinite Framer Motion

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

### H2. `components/landing/section-stats.tsx:176-203` — setInterval + AnimatePresence Rotasi SVG

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

### H3. `lib/config/genkit-stream.ts:51-53` — setTimeout 100ms Sebelum Close Stream

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

### H4. `lib/config/genkit-stream.ts:18` — new TextEncoder() Tiap Chunk

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

### H5. `lib/store/sidebar-store.ts:12-23` — persist Write Tanpa Debounce

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

### H6. `lib/store/floating-chat-store.ts:17-20` — Function Refs Berubah Tiap State Change

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

### H7. `hooks/use-safe-user.ts:11-16` — Object Spread Tiap Render

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

### H8. `components/admin/marketing/promotions-manager.tsx:50-60` — Single Form State Full Re-render

**Masalah:** Tiap keystroke bikin object baru via spread → full form re-render (termasuk semua input, button, badge).

```tsx
const [formData, setFormData] = useState({ ... });
// ...
onChange={(e) => setFormData({ ...formData, title: e.target.value })}
```

**Dampak:** ~10 subtree reconciliation/detik. Pola yang sama di `seo-settings-form.tsx`, `general-settings-form.tsx`, `push-manager.tsx`.

**Fix:** Gunakan individual `useState` per field atau `useRef` + uncontrolled.

---

### H9. `lib/server/cloudflare-rendering.ts:80-93` — 3× Regex Pass Atas Full HTML String

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

### M1. Fungsi Reset Instance Tidak Pernah Dipanggil

| File | Fungsi | Baris |
|------|--------|-------|
| `lib/integrations/midtrans.ts` | `resetMidtransInstances()` | 93-97 |
| `lib/integrations/creem.ts` | `resetCreemInstance()` | 100-103 |

**Kategori:** Fitur prematur — dead code. Tidak ada webhook, cron, atau revalidation yang memanggilnya.

---

### M2. `app/genkit/ai.ts:13-75` — Double Caching

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

### M3. `app/genkit/flows/` — Duplicate Zod Schema di 3 Files

**Masalah:** Schema didefinisikan 2× (di `defineFlow` + `ai.generate`) untuk estimator, product-generator, service-generator.

```typescript
outputSchema: z.object({ title: z.string(), ... })  // di defineFlow
output: { schema: z.object({ title: z.string(), ... }) }  // di ai.generate — SAMA
```

**Dampak:** Memory double. Risiko divergen di masa depan.

---

### M4. `app/genkit/flows/service-generator.ts:39-108` — Prompt + Schema Boros Token

**Masalah:** Prompt ~1800 chars instruksi + schema 60+ line Zod dikirim tiap API call. Schema duplikat (lihat M3).

**Dampak:** 10k+ token per call. $1.50 wasted per 100 request untuk boilerplate.

**Fix:** Cache prompt sebagai constant di luar handler, hapus duplicate schema.

---

### M5. `lib/server/pricing-service.ts:43-49` — 4× Upsert Query

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

### M6. `lib/server/affiliates.ts:5-37` — Memory Leak Potensial

**Masalah:** `inFlightAffiliateRequests` Map tidak punya TTL. Jika promise never resolves (DB hang), entry tetap di Map forever.

```typescript
const inFlightAffiliateRequests = new Map<string, Promise<any>>();
// finally { inFlightAffiliateRequests.delete(referralCode); }
// ^ Tidak jalan jika promise never resolve/reject
```

---

### M7. `app/api/admin/products/route.ts:73` — Push Broadcast dengan Empty Array

```typescript
await broadcastPushNotification([], {  // Empty array!
    title: "Produk Baru Rilis! 🔥",
    body: `${name} kini tersedia...`,
    ...
});
```

**Dampak:** Trigger seluruh push machinery (pool init, Promise.all, array copies) untuk no-op.

---

### M8. `app/api/marketing/track/route.ts:34-54` — Race Condition Duplicate Referral

**Masalah:** TOCTOU — dua request concurrent bisa lolos `findFirst` lalu `create` duplikat.

**Fix:** Unique constraint `@@unique([affiliateId, visitorId])` + handle error.

---

### M9. `lib/server/payment-service.ts:13-19` — Hardcoded Fallback Rate 15000 IDR/USD

```typescript
const fallbackRate = 15000;
// Bisa over/under-charge jika rate aktual sudah berbeda
```

**Fix:** Simpan last known rate di DB, atau gunakan rata-rata historical rate.

---

### M10. `lib/server/marketing.ts:150-159` — Ambil Coupon Termuda, Bukan Terbaik

```typescript
return await prisma.coupon.findFirst({
    where: { isActive: true, ... },
    orderBy: { createdAt: "desc" },  // ← ambil yang termuda
});
```

**Dampak:** Bisa kasih user diskon paling kecil karena tidak sorting by value.

---

### M11. `lib/integrations/storage.ts:42-49` — Log Credential ke Console

```typescript
console.log("[Storage] Initializing R2 Client", {
    bucketName,
    accessKeyId: accessKeyId?.slice(0, 4) + '...',
    secretLength: secretAccessKey?.length,
});
```

**Dampak:** Ekspos bucket name + partial key + secret length di production log.

---

### M12. `components/providers/currency-provider.tsx:81-83` — Return null Sampai mounted

```tsx
if (!mounted) { return null; }
```

**Dampak:** Layout shift + full subtree re-render setelah mount. Child components render 2×.

---

## 🟢 Low

### L1. `lib/utils/crypto.ts:18-25` — String Concatenation O(n²)

```typescript
for (let i = 0; i < length; i++) {
    result += chars[crypto.randomInt(0, chars.length)];
}
```

**Fix:** Gunakan array + `join('')`.

---

### L2. `proxy.ts:60,87` — console.log di Middleware

Console.log di middleware yang jalan tiap request. I/O waste di production.

---

### L3. `proxy.ts:62-68` — AbortController Timeout Leak

Jika `fetch` throw synchronous, `clearTimeout` tidak pernah jalan → dangling timer.

---

### L4. `app/genkit/flows/consultant.ts:82-84` — Loop `shift()` O(n²)

```typescript
while (historyMessages.length > 0 && historyMessages[0].role !== 'user') {
    historyMessages.shift(); // O(n) each iteration → O(n²)
}
```

---

### L5. `lib/config/db.ts:16-18` — parseInt Tanpa Validasi

```typescript
const poolMax = process.env.DATABASE_POOL_SIZE
    ? parseInt(process.env.DATABASE_POOL_SIZE, 10)
    : ...
```

Jika env var = `"0"` atau `"abc"`, pool size jadi 0 atau NaN → connection starvation.

---

### L6. `components/landing/typing-hero-title.tsx:49` — Nested setTimeout Tidak di-cleanup

```typescript
setTimeout(() => setIsDeleting(true), 1800); // Tidak ada cleanup
```

Orphan timer terus jalan meski component unmount.

---

### L7. `components/admin/support/chat-console.tsx:38-44` — filter/find Tiap Render Tanpa useMemo

```typescript
const selectedTicket = tickets.find(t => t.id === selectedTicketId);
const filteredTickets = tickets.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) // tiap keystroke
);
```

---

## Database Index Issues

### Missing Indexes pada `prisma/schema.prisma`

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

## 💡 Rekomendasi Prioritas

### Segera (Critical Impact)

1. **Matikan query DB uncached di support chat (C2)** — `unstable_cache` TTL 3600s
2. **Fix singleton Midtrans/Creem (C3)** — auto-reset saat config diupdate
3. **Pagination semua `findMany()` (C4)** — `take: 50` minimal
4. **Refactor chat streaming (C7)** — useRef + throttle update
5. **Index 5 model tanpa index (C6)** — `PopUp`, `Lead`, `MarketingBonus`, `MarketingAsset`, `Promotion`

### High Impact

6. **Hentikan `listUsers()` di project search (C1)** — ganti DB-level search
7. **Konversi file upload ke streaming (C5)** — `@aws-sdk/lib-storage`
8. **Hapus `repeat: Infinity` decorative animation (H1, H2)** — atau `useReducedMotion()`
9. **Fix `TextEncoder` per chunk (H4)** — buat sekali
10. **Hapus `setTimeout(100ms)` sebelum close stream (H3)** — close langsung

### Cleanup

11. **Hapus duplicate Zod schema (M3)** — cukup di satu tempat
12. **Hapus/reset dead code reset functions (M1)**
13. **Push notification dengan empty array (M7)** — skip jika no subscribers
14. **Fix race condition referral tracking (M8)** — unique constraint

# Creem Payment Integration Guide

Platform ini menggunakan **Creem** sebagai gerbang pembayaran utama untuk transaksi internasional (USD) menggunakan kartu kredit. Creem bertindak sebagai *Merchant of Record* (MoR), menangani kepatuhan pajak global secara otomatis.

## 1. Konfigurasi Sistem

Integrasi dikelola melalui Admin Panel di `/admin/system/payment`. Parameter yang diperlukan adalah:

- **API Key**: Kunci API dari dashboard Creem (biasanya diawali `creem_...`).
- **Store ID**: ID Toko Anda di Creem (biasanya diawali `sto_...`). Penting: Header `x-store-id` wajib disertakan dalam setiap permintaan API.
- **Webhook Secret**: Digunakan untuk verifikasi integritas data yang dikirim oleh Creem ke server kita.
- **Environment**: Switch Mode (TEST/LIVE) menentukan endpoint mana yang akan digunakan.

## 2. Implementasi Teknis

### Helper Integrasi
Lokasi: `lib/integrations/creem.ts`

Kami menggunakan SDK `@creem_io/nextjs` (atau direct API) dengan beberapa modifikasi khusus (*monkey-patching*) untuk mengatasi batasan SDK:

- **Automatic Header Injection**: Helper secara otomatis menyertakan `x-api-key` dan `x-store-id`.
- **Custom Product Creation**: Metode `products.create` telah dimodifikasi untuk menggunakan permintaan manual guna memastikan kompatibilitas penuh dengan skema API Creem terbaru (snake_case).

### Penanganan Order
Sistem membedakan dua jenis order berdasarkan awalan ID:

1.  **Layanan & Kalkulator (`ORDER-`)**
    - Data diambil dari model `Order`.
    - Webhook memicu pembaruan status Proyek menjadi "queue".
2.  **Produk Digital (`DIGI-`)**
    - Data diambil dari model `DigitalOrder`.
    - Webhook memicu `completeDigitalOrder` untuk pembuatan lisensi otomatis.

### Produk Dinamis (Dynamic Products)
Untuk invoice dengan harga kustom (seperti kalkulator harga), sistem akan membuat produk Creem secara dinamis saat checkout diinisialisasi. ID produk ini disimpan dalam metadata order untuk digunakan kembali jika klien melakukan percobaan pembayaran ulang.

## 3. Alur Webhook & Smart Check

Endpoint Webhook: `/api/payment/creem/webhook`

Untuk memastikan pengalaman pengguna yang mulus meskipun ada keterlambatan notifikasi webhook, kami mengimplementasikan fitur **Smart Check**:

- **Status Polling**: Endpoint `/api/digital-payment/status` (untuk produk digital) dan `/api/payment/status` (untuk layanan) akan melakukan kueri langsung ke API Creem jika status pembayaran masih "pending".
- **Aktivasi Instan**: Jika API Creem menyatakan checkout "completed" atau "paid", sistem akan segera mengaktifkan produk/proyek tanpa menunggu webhook.

## 4. Troubleshooting (Common Issues)

### 403 Forbidden
Jika Anda menemui error 403 saat inisialisasi pembayaran, pastikan:
1.  **Store ID** sudah benar di database.
2.  API Key yang digunakan sesuai dengan mode (Test Key untuk Test Mode).

### Webhook Verification Failed
Pastikan **Webhook Secret** di platform sesuai dengan yang ada di dashboard Creem bagian Developer -> Webhooks.

---

*Terakhir diperbarui: 14 Februari 2026*

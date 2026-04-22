# AgencyOS Recurring & Hybrid Billing System

Dokumen ini menjelaskan arsitektur dan alur kerja sistem penagihan berulang (Recurring Billing) dan tagihan hibrida (Hybrid Billing) di dalam AgencyOS.

## 1. Konsep Dasar

Sistem ini dirancang untuk mendukung skenario penagihan yang kompleks tanpa memerlukan integrasi API langganan yang kaku dari Payment Gateway (seperti Midtrans Subscription API).

**Skenario yang Didukung:**
- **Single Payment (Sekali Bayar):** Klien membayar sekali untuk layanan.
- **Recurring Payment (Berlangganan):** Klien membayar layanan setiap bulan/tahun.
- **Hybrid Billing (Campuran):** Klien membeli layanan *Sekali Bayar*, namun menambahkan *Add-on* yang ditagih secara *Bulanan* atau *Tahunan*.

## 2. Alur Transaksi Awal (Bulan Pertama)

Saat klien melakukan *checkout* melalui katalog layanan, sistem menghitung total tagihan bulan pertama (`totalAmount`) dengan menjumlahkan:
1. Harga dasar layanan (Service Base Price).
2. Harga Add-on One-Time.
3. Harga Add-on Berlangganan (Monthly/Yearly).

Sistem akan menyimpan rincian transaksi ini dalam bentuk deskripsi (teks `summary`) di dalam entitas `Estimate` dan `Project`.
Jika ada komponen berlangganan, sistem otomatis mengaktifkan status `subscriptionStatus` pada Project menjadi `pending` (atau `active` setelah dibayar), dan mencatat tanggal kadaluarsa (`subscriptionEndsAt`) yakni 30 hari ke depan.

*File terkait: `app/api/store/order/route.ts`*

## 3. Sistem Perpanjangan (Renewal) Cerdas

Masalah utama dari Hybrid Billing adalah menentukan "Berapa tagihan di bulan kedua?". Jika sistem mengambil nilai `totalAmount` dari bulan pertama, maka biaya *One-Time* akan ikut tertagih kembali.

### Smart Parser Logic
AgencyOS menggunakan *parser* cerdas di sisi server yang membaca *Summary* transaksi bulan sebelumnya. Algoritmanya bekerja sebagai berikut:
1. Mengabaikan harga layanan utama jika tipenya `one_time`.
2. Menyertakan harga layanan utama jika tipenya `monthly` atau `yearly`.
3. Membaca baris teks Add-on di dalam *Summary* (contoh: `+ Maintenance ($50 Monthly)`).
4. Mengekstrak nominal harga *hanya* jika baris tersebut memiliki kata kunci `Monthly` atau `Yearly`.
5. Menghasilkan `recurringAmount` (Tagihan Berulang) murni tanpa biaya awal.

*File terkait: `app/dashboard/(client)/billing/actions.ts` dan `app/admin/finance/subscriptions/page.tsx`*

## 4. Admin Subscriptions Dashboard

Admin memiliki kendali penuh atas siklus langganan melalui halaman khusus:
- **URL:** `/admin/finance/subscriptions`
- **Fitur:** 
  - Melihat daftar klien aktif dan *past due*.
  - Melihat estimasi tagihan bulan depan yang sudah dihitung oleh *Smart Parser*.
  - Men-generate *Renewal Invoice* secara manual dengan menekan tombol **Renew**. Admin dapat mengubah nominal tagihan (misal: jika klien *downgrade* Add-on) dan mengubah deskripsi *invoice* sebelum diterbitkan.

## 5. Client-Side Auto-Renewal (Self-Service)

Untuk mengurangi beban operasional Admin, AgencyOS menerapkan pendekatan *Self-Service* bagi klien.

1. **Deteksi Otomatis (H-7):** Saat klien masuk ke halaman `/dashboard/billing`, sistem memeriksa apakah `subscriptionEndsAt` akan habis dalam 7 hari ke depan.
2. **Peringatan & Tombol Action:** Jika masuk masa tenggang, sistem menampilkan kotak peringatan (Unpaid Bills) beserta estimasi tagihan bulan depan dan tombol **"Perpanjang Sekarang"**.
3. **On-the-fly Generation:** Saat klien menekan tombol tersebut, sistem secara instan (melalui Server Action) membuat `Estimate` baru dengan nominal langganan yang akurat, mengubah status langganan, dan langsung me-redirect klien ke Midtrans Checkout.
4. **Pembayaran:** Setelah klien membayar, Webhook akan menggeser `subscriptionEndsAt` ke 30 hari berikutnya, mengulang siklus otomatis ini.

*File terkait:*
- *Client Page: `app/dashboard/(client)/billing/page.tsx`*
- *Client Component: `components/dashboard/billing/unpaid-bills.tsx`*

---
*Dokumentasi ini dibuat secara otomatis untuk rilis fitur Hybrid Billing AgencyOS.*

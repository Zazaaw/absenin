# Absenin

Pengingat absensi MagangHub yang nggak bisa dicuekin, plus laporan harian yang dirangkai dari cerita singkat. Bukan produk Kemnaker.

| Folder | Isi |
|---|---|
| `extension/` | Ekstensi Chrome (Manifest V3): pengingat, layar pembuka, panel generate, 11 tema, onboarding. Baca [extension/README.md](extension/README.md). |
| `src/`, `public/`, `supabase/` | Web: landing page, dashboard, admin, API proxy. Next.js 16 (App Router, Tailwind v4), style kit p441z, GSAP + Lenis. |
| `scripts/` | Playwright: screenshot ekstensi asli, rekam video demo, verifikasi end-to-end, bungkus zip. |

## Web

## Jalankan (mode lokal, tanpa Supabase)

```bash
npm install
npm run shots     # sekali: screenshot ekstensi asli ke public/shots (butuh: npx playwright install chromium)
npm run dev       # http://localhost:3000
```

Mode lokal menyimpan data di `.data/db.json` (dibuat otomatis, berisi akun contoh):

| Akun | Email | Sandi | Peran |
|---|---|---|---|
| Admin | admin@absenin.local | admin123 | admin |
| Demo | demo@absenin.local | demo123 | user, punya lisensi pro |

Tanpa `OPENAI_API_KEY`, endpoint generate memakai template cadangan dan menandainya `offline`, jadi seluruh alur bisa dites tanpa biaya.

## Halaman

| Rute | Isi |
|---|---|
| `/` | Landing page: hero, marquee tema, statistik, fitur, cara kerja (sticky scroll), showcase tema interaktif, screenshot parallax, harga, FAQ, CTA |
| `/daftar`, `/login` | Akun |
| `/dashboard` | Lisensi (kode, kuota harian, perangkat), aktivasi trial, cara pasang, pemakaian terakhir |
| `/admin` | KPI, grafik 14 hari, buat lisensi, tabel lisensi (perpanjang, lepas perangkat, cabut), pengguna (role), log, konfigurasi jarak jauh |
| `/checkout` | Placeholder pembayaran (gerbang pembayaran belum tersambung) |
| `/privasi` | Kebijakan privasi |

## API untuk ekstensi

| Endpoint | Auth | Fungsi |
|---|---|---|
| `POST /api/license/activate` | body `key`, `deviceId` | Verifikasi lisensi, ikat perangkat, kembalikan paket, masa berlaku, kuota |
| `GET /api/license/status` | `Authorization: Bearer <key>` | Sisa kuota hari ini |
| `POST /api/generate` | `Authorization: Bearer <key>` | Proxy ke OpenAI. Cek lisensi, kuota harian, catat pemakaian |
| `GET /api/config` | - | Pengumuman, versi minimum, kuota default |

Kunci OpenAI hanya ada di env server. Ekstensi memegang kode lisensi saja.

## Pindah ke Supabase (project kamu sendiri)

1. Buat project Supabase, jalankan `supabase/schema.sql` di SQL Editor.
2. Salin `.env.example` ke `.env.local`, isi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `APP_SECRET`.
3. Daftar lewat `/daftar` (Supabase Auth), lalu jadikan admin: `update public.profiles set role = 'admin' where email = '...'`.
4. Data layer otomatis berpindah ke Supabase begitu env terisi (`src/lib/db/index.ts`).

## Keamanan dan operasional

- **Rate limit** per IP (di memori proses): login 10/10 menit, daftar 5/jam, trial 3/jam, aktivasi 20/10 menit, generate 30/10 menit, telemetri 60/jam, beta 5/jam. Pindahkan ke Redis kalau nanti jalan di beberapa instance (`src/lib/ratelimit.ts`).
- **Versi minimum ekstensi**: diatur admin di konfigurasi jarak jauh. Ekstensi mengirim `X-Extension-Version`; versi lama ditolak 426 saat generate dan diberi tahu saat aktivasi.
- **Ikatan perangkat**: aktivasi dari perangkat berbeda dicatat sebagai `device-change` (tampil di dashboard pengguna selama 7 hari dan di admin).
- **Telemetri** `POST /api/telemetry`: kejadian anonim dari ekstensi (deteksi kalender gagal, generate error, isi form gagal, versi lama). Opt-out di pengaturan ekstensi > Lanjutan. Tidak pernah berisi isi laporan.
- **Syarat layanan dan refund** di `/syarat`; pendaftaran wajib centang persetujuan.

## SEO

- Metadata lengkap (title, description, keywords, canonical, Open Graph, Twitter) di `layout.tsx`; gambar OG dibuat otomatis di `app/opengraph-image.tsx`.
- `sitemap.xml` dan `robots.txt` dari `app/sitemap.ts` dan `app/robots.ts` (admin, dashboard, checkout, API tidak diindeks).
- JSON-LD: `SoftwareApplication` + `FAQPage` di landing, `Article` + `FAQPage` di artikel blog.
- Blog `/blog` dengan artikel panduan laporan MagangHub (`src/lib/blog.ts`); tambah artikel baru dengan menambah entri di `POSTS`.
- Bagian "Pengguna pertama": angka asli dari database dan form beta tester (`POST /api/beta`, daftar di admin).

## Script

| Perintah | Fungsi |
|---|---|
| `npm run shots` | Screenshot ekstensi asli dengan Playwright (popup, splash, pengaturan, panel di halaman MagangHub tiruan) |
| `npm run pack` | Bungkus `extension/` ke `public/downloads/absenin.zip` dan sinkron `extension/shared` ke `public/ext` (otomatis saat build) |
| `npm run demo` | Rekam video demo `public/demo.webm` dari ekstensi asli (layar pembuka, panel, generate, isi form); butuh dev server jalan |
| `node scripts/verify.mjs` | Uji alur daftar, trial, aktivasi, generate, lisensi salah, lalu screenshot landing, admin, dashboard ke `.verify/` |

## Yang belum

- Gerbang pembayaran (Midtrans atau Xendit). Halaman checkout masih mengarahkan ke aktivasi manual oleh admin.
- Email transaksional (kirim kode lisensi).
- Pengiriman ke Chrome Web Store: butuh kebijakan privasi di URL publik (sudah ada di `/privasi`) dan ikon promosi.

<!-- Dibuat oleh Faiz Hazim Hawari · skill-typography -->

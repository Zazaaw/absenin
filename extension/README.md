# Absenin · Ekstensi Chrome

![Popup](../public/shots/popup-sore.png)

Ekstensi Chrome yang mengingatkan absensi harian di MagangHub (monev.maganghub.kemnaker.go.id), lalu membantu menulis uraian aktivitas, pembelajaran, dan kendala dari cerita singkat.

## Tema dan mode malam

- Tema default **Sore**: senja plum gelap, amber, koral; maskot matahari kecil yang nungguin jam 16.00.
- **Simpel**: netral, tanpa maskot, abu hangat dengan aksen biru-abu.
- Tema gelap nyaman dengan aksen kontras: **Bara** (arang dan oranye bara), **Robo** (slate dan mint neon), **Astro** (navy pekat dan biru langit), **Baro si beruang** (kayu gelap, hijau daun, madu), **Hiu** (navy dan teal), **Harimau** (hutan gelap dan lime).
- Tema terang: **Tegas** (hitam dan kuning safety, tanpa maskot), **Sawit**, **Momo si kucing**, **Kaktus** (pastel).
- Tiap tema punya palet sendiri, versi mode malam, dan karakter dengan empat ekspresi (senang, gelisah, layu, tidur). Teks pengingat ikut nama maskotnya.
- **Mode malam** pastel gelap: otomatis jam 18.00 sampai 06.00, atau dipaksa terang atau gelap. Diatur di Pengaturan > Tampilan.

## Suara, shortcut, badge

- **Suara chime** di layar pembuka: Marimba lembut, Lonceng, Retro 8-bit, atau Drum pendek. "Otomatis ikut tema" memilihkan yang cocok (Robo retro, Bara drum, Hiu lonceng, dan seterusnya). Tombol "Dengar" di pengaturan memutar contoh.
- **Shortcut** `Alt+M` membuka MagangHub plus panel cerita dari tab mana pun. Ubah di `chrome://extensions/shortcuts`.
- **Badge streak** di ikon toolbar: angka streak, hijau kalau laporan hari ini beres, oranye kalau belum, abu di hari libur. Bisa dimatikan.
- **Ikon kehadiran** di kalender popup ikut tema: bunga, centang, petir, bintang, api, ombak, cap kaki.

## Tebak cerita dari riwayat Chrome

Opsional, mati secara bawaan. Kalau dinyalakan di Pengaturan > Gaya laporan, Chrome meminta izin membaca riwayat. Ekstensi membaca kunjungan hari ini (sejak jam 06.00) di laptop, mengelompokkannya jadi aktivitas (GitHub, Google Sheets, Canva, meeting, dan seterusnya), dan menaruh satu kalimat tebakan di kotak cerita. Kamu lihat dan ubah dulu sebelum Generate. Tidak ada riwayat yang dikirim ke mana pun; yang dikirim ke OpenAI hanya teks cerita yang ada di kotak saat kamu klik Generate.

## Yang dilakukan

- Jam pengingat (default 16.00, Senin sampai Jumat) menembak notifikasi Windows dan membuka Chrome dalam mode fullscreen. Yang muncul duluan adalah layar pembuka (animasi 4 detik plus chime 5 detik), baru pindah ke halaman Riwayat. Layar pembuka dan suara bisa dimatikan di pengaturan.
- Pengingat terjadwal sengaja diam kalau laporan hari itu sudah terkirim atau hari itu libur. Tombol "Tes pengingat sekarang" di pengaturan selalu menembak apa pun statusnya, dan bagian "Tes dan log" menampilkan kejadian terakhir (alarm bunyi, dilewati, notifikasi gagal) untuk memeriksa kenapa pengingat diam.
- Kalau belum diisi, pengingat diulang tiap 10 menit (bisa diubah). Berhenti otomatis saat laporan terkirim, atau saat kamu tandai sendiri.
- Panel di pojok kanan bawah halaman MagangHub: ceritain dikit (atau tebak dari riwayat), pilih gaya laporan, klik Generate. Hasilnya tiga kolom yang bisa diedit dan disalin, lalu "Isi ke form". Kamu yang centang pernyataan dan klik "Simpan dan Kirim". Ekstensi tidak pernah menekan tombol kirim.
- Popup ekstensi: kebun bulan ini (satu ikon tema per hari terkirim), streak, dan tombol cepat.
- Script Task Scheduler supaya Chrome tetap terbuka pada jam pengingat walau sedang ditutup.

## Pasang

1. Buka `chrome://extensions`, nyalakan **Developer mode** di kanan atas.
2. Klik **Load unpacked**, pilih folder `extension` ini.
3. Tab panduan terbuka otomatis: tempel kode lisensi dari dashboard Absenin, pilih maskot, set jam, tes pengingat.
4. Buka halaman MagangHub Riwayat satu kali supaya status hari ini terbaca.

## Task Scheduler (opsional tapi disarankan)

Ekstensi hanya hidup selama Chrome berjalan. Supaya Chrome dibuka otomatis pada jam pengingat:

1. Buka folder `scheduler`.
2. Klik kanan `pasang-task.ps1`, pilih **Run with PowerShell**. Default jam 16.00. Untuk jam lain, dari PowerShell: `.\pasang-task.ps1 -Jam "15:30"`.
3. Untuk melepas: `hapus-task.ps1`.

Script ini membuka Chrome ke halaman Riwayat dan membawanya ke depan. Setelah Chrome hidup, ekstensi yang melanjutkan pengingat dan fullscreen.

## Panduan pertama kali dan pengaturan

Saat pertama dipasang, tab panduan 4 langkah terbuka: tempel kode lisensi, pilih maskot, set jam dan tes pengingat, selesai. Bisa diulang dari Pengaturan > "Jalankan panduan lagi". Pengaturan dibagi lima tab: Akun, Pengingat, Tampilan, Laporan, Lanjutan; hal yang jarang disentuh (API key sendiri, alamat server, log, gaya tambahan, Task Scheduler) dilipat.

## Mode akun (lisensi) dan web

Sejak v0.2 ekstensi punya dua mode di Pengaturan > Akun dan lisensi:

- **Lisensi Absenin** (bawaan): ekstensi cuma memegang kode lisensi. Generate dikirim ke server (web di root repo, lihat README utama) yang memegang kunci AI, memeriksa kuota harian, dan mencatat pemakaian. Alamat server bawaan `http://localhost:3000`, bisa diubah.
- **API key OpenAI sendiri** (lanjutan): perilaku lama, kunci disimpan lokal.

Web-nya (landing page, dashboard, admin, API) ada di root repo; folder ini hanya ekstensinya.

## Keamanan API key (mode key sendiri)

- Key disimpan di `chrome.storage.local` ekstensi ini, tidak di-sync ke akun Google.
- Hanya service worker ekstensi yang memegang key dan hanya mengirimnya ke `api.openai.com`. Halaman MagangHub dan popup tidak pernah menerimanya.
- Siapa pun yang bisa membuka profil Chrome di laptop ini tetap bisa membacanya lewat DevTools ekstensi. Kunci laptop saat ditinggal.
- Jangan commit atau bagikan folder profil Chrome. Folder ekstensi ini sendiri tidak berisi key.

## Cara kerja deteksi status

Content script membaca ikon di sel tanggal hari ini pada kalender: hijau berarti terkirim dan disetujui, biru berarti menunggu mentor, abu kosong berarti belum diisi, hitam berarti libur. Pembacaannya berbasis warna, jadi kalau MagangHub mengubah tampilan, deteksi bisa meleset. Cadangannya:

- Klik "Simpan dan Kirim" terdeteksi dan menandai hari ini terkirim.
- Tombol "Udah kukirim sendiri" di popup untuk menandai manual.
- Hari libur tambahan bisa diisi di pengaturan.

## Struktur

```
manifest.json          izin dan daftar file
background.js          alarm, notifikasi, buka tab, panggilan OpenAI
content/content.js     deteksi status, panel generate, isi form
popup/                 buku harian: maskot, kebun, streak
options/               pengaturan 5 tab: akun, pengingat, tampilan, laporan, lanjutan
onboarding/            panduan pertama kali
shared/                util, gaya laporan, 12 tema + maskot (themes.js), chime, idle
splash/                layar pembuka sebelum halaman MagangHub
scheduler/             script Task Scheduler Windows
icons/                 ikon ekstensi
```

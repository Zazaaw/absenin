export const SITE = {
  name: "Absenin",
  tagline: "Absen MagangHub, diingetin sampai beres.",
  version: "0.2.0",
};

export const PLANS = [
  {
    id: "trial", nama: "Coba dulu", harga: "Rp0", periode: "7 hari", deskripsi: "Semua fitur, tanpa kartu. Buat ngerasain dulu, kayak tester parfum.",
    fitur: ["Pengingat fullscreen + layar pembuka + chime", "6 generate laporan per hari", "11 tema dan mode malam", "Tebak dari riwayat Chrome", "Tanpa kartu kredit"],
    cta: "Mulai trial", featured: false,
  },
  {
    id: "pro", nama: "Pro", harga: "Rp25.000", periode: "per bulan", deskripsi: "Buat satu peserta magang yang nggak mau kena tegur. Lagi.",
    fitur: ["Semua di trial", "Kuota generate lebih besar", "Prioritas saat server ramai", "Riwayat laporan 90 hari", "Dukungan lewat chat"],
    cta: "Ambil Pro", featured: true,
  },
  {
    id: "tim", nama: "Tim / Kampus", harga: "Rp15.000", periode: "per orang / bulan", deskripsi: "Minimal 10 orang. Buat kampus atau perusahaan yang punya banyak anak magang dan satu pembimbing yang capek nagih.",
    fitur: ["Semua di Pro", "Admin lihat kepatuhan tim", "Lisensi massal sekali klik", "Faktur bulanan", "Onboarding bareng"],
    cta: "Hubungi kami", featured: false,
  },
] as const;

export const FAQ = [
  { q: "Apakah ini aplikasi resmi dari Kemnaker atau MagangHub?", a: "Bukan. Absenin adalah asisten pribadi yang berjalan di Chrome kamu sendiri. Tidak ada hubungan dengan Kemnaker, dan tidak mengubah apa pun di sistem MagangHub." },
  { q: "Apakah laporannya dikirim otomatis?", a: "Tidak, dan tidak akan. Ekstensi mengisi tiga kolom dari cerita yang kamu tulis, lalu kamu membaca, mencentang pernyataan, dan menekan Simpan dan Kirim sendiri. Tombol kirim tidak pernah ditekan oleh ekstensi. Kalau ada yang bilang bisa, itu bukan kami." },
  { q: "Apakah teksnya mengarang kegiatan?", a: "Tidak. AI hanya mengembangkan cerita singkat yang kamu beri. Kalau kamu menulis 'rekap data absensi', hasilnya tentang itu. Yang tidak kamu lakukan, tidak akan ditulis. Jadi tetap harus kerja, maaf." },
  { q: "Ke mana data saya pergi?", a: "Cerita singkat yang kamu ketik dikirim ke server Absenin, diteruskan ke penyedia AI, lalu hasilnya kembali ke kamu. Riwayat Chrome dibaca di laptop kamu saja; yang terkirim hanya satu kalimat rangkuman yang kamu lihat dulu. Kunci AI tidak pernah ada di ekstensi." },
  { q: "Kalau Chrome lagi ketutup, pengingatnya masih jalan?", a: "Ekstensi hanya hidup selama Chrome hidup. Ada script Task Scheduler Windows yang membuka Chrome ke MagangHub pada jam pengingat, lalu ekstensi melanjutkan." },
  { q: "Bagaimana kalau tampilan MagangHub berubah?", a: "Pembacaan status kalender bisa meleset. Kami perbarui dari server tanpa kamu harus install ulang, dan selalu ada tombol manual 'udah kukirim sendiri' sebagai cadangan." },
  { q: "Bisa pakai di dua laptop?", a: "Satu lisensi terikat ke satu perangkat aktif. Pindah laptop boleh kapan saja; perangkat lama otomatis lepas. Nggak ada drama." },
] as const;

export const THEME_ORDER = ["sore", "simpel", "bara", "robo", "astro", "beruang", "hiu", "harimau", "tegas", "sawit", "kucing", "kaktus"];

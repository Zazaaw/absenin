// Artikel blog: pintu masuk dari Google. Satu artikel ditulis utuh, sisanya bisa ditambah.
export interface Post { slug: string; title: string; description: string; date: string; readMin: number; sections: { h: string; p: string[] }[]; faq?: { q: string; a: string }[] }

export const POSTS: Post[] = [
  {
    slug: "cara-mengisi-laporan-harian-maganghub",
    title: "Cara Mengisi Laporan Harian MagangHub (Uraian Aktivitas, Pembelajaran, Kendala) Tanpa Pusing",
    description: "Panduan lengkap mengisi laporan harian di MagangHub Kemnaker: arti tiap kolom, contoh isian 100 karakter lebih, kesalahan yang bikin ditolak mentor, dan cara supaya nggak pernah telat lagi.",
    date: "2026-10-28",
    readMin: 7,
    sections: [
      { h: "Kenapa laporan harian MagangHub sering telat", p: [
        "Form-nya sebenarnya sederhana: tiga kolom teks, satu pilihan kehadiran, satu centang pernyataan. Yang bikin telat bukan form-nya, tapi jamnya. Laporan harus diisi di hari yang sama, biasanya sore setelah kerja, persis saat energi sudah habis dan yang kepikiran cuma pulang.",
        "Ditambah aturan minimal 100 karakter per kolom. Kalau kamu menulis 'rekap data', sistem menolak. Jadi banyak peserta menunda sampai malam, lalu lupa, lalu besoknya status kalendernya jadi 'Belum Diisi' dan mentor yang nagih.",
      ] },
      { h: "Arti tiga kolom di form Tambah Laporan", p: [
        "Uraian aktivitas: apa yang kamu kerjakan hari ini, urut dari pagi. Sebut pekerjaannya secara konkret: modul apa, data apa, rapat soal apa. Mentor membaca kolom ini untuk memastikan kamu benar-benar mengerjakan sesuatu yang relevan.",
        "Pembelajaran yang diperoleh: bukan ulangan kolom pertama. Tulis satu hal yang kamu sadari atau kuasai dari kegiatan itu. Contoh: 'belajar membaca log server secara sistematis', bukan 'belajar banyak hal'.",
        "Kendala yang dialami: hambatan beserta cara kamu mengatasinya. Jangan tulis 'tidak ada kendala'; itu tanda laporan asal-asalan. Kendala kecil pun sah: akses server terputus, data belum lengkap, menunggu konfirmasi rekan.",
      ] },
      { h: "Contoh isian yang lolos 100 karakter dan enak dibaca mentor", p: [
        "Uraian aktivitas: 'Hari ini saya memperbaiki bug pada modul login di sistem absensi, menelusuri penyebab sesi yang kedaluwarsa lebih cepat dari seharusnya, lalu menguji ulang alur masuk di lingkungan staging bersama mentor.' (205 karakter)",
        "Pembelajaran: 'Saya belajar membaca log server secara sistematis untuk menemukan akar masalah, serta memahami pentingnya pengujian di staging sebelum perubahan dibawa ke server produksi.' (171 karakter)",
        "Kendala: 'Akses ke server staging sempat terputus karena konfigurasi jaringan kantor. Saya mengatasinya dengan berkoordinasi ke tim IT dan memakai koneksi cadangan.' (158 karakter)",
        "Polanya: satu kalimat apa yang dikerjakan, satu kalimat detail, satu kalimat hasil. Tiga kalimat hampir selalu lewat 100 karakter tanpa dipanjang-panjangkan.",
      ] },
      { h: "Kesalahan yang bikin laporan ditolak atau ditegur", p: [
        "Menyalin laporan kemarin. Mentor membandingkan hari ke hari; kalimat yang sama tiga hari berturut-turut kelihatan jelas. Ubah minimal pekerjaan utamanya dan kendalanya.",
        "Menulis dalam bahasa gaul atau singkatan chat. Form ini dibaca orang kantor; pakai bahasa yang rapi tapi tidak perlu kaku.",
        "Mengarang kegiatan yang tidak dilakukan. Selain tidak jujur, ini mudah ketahuan saat mentor bertanya detailnya di evaluasi.",
        "Mencentang pernyataan 'telah meninjau' tanpa membaca ulang. Banyak kesalahan ketik dan kalimat terpotong terkirim karena kolom tidak dibaca lagi.",
      ] },
      { h: "Supaya nggak pernah telat lagi", p: [
        "Pasang pengingat di jam yang sama setiap hari kerja, sebelum pulang, misalnya 16.00. Bukan alarm biasa yang gampang di-swipe, tapi sesuatu yang membuka halaman MagangHub-nya langsung.",
        "Catat kegiatan sepanjang hari dalam satu baris: 'benerin bug login, meeting mentor soal deploy'. Sore tinggal dikembangkan jadi tiga paragraf.",
        "Kalau mau dibantu: Absenin adalah ekstensi Chrome yang jam 16.00 membawa Chrome ke depan, membuka halaman Riwayat MagangHub, lalu merangkai tiga kolom dari satu baris cerita yang kamu tulis. Tombol Simpan dan Kirim tetap kamu yang tekan, jadi kamu tetap membaca dan bertanggung jawab atas isinya. Tujuh hari pertama gratis.",
      ] },
    ],
    faq: [
      { q: "Berapa minimal karakter tiap kolom laporan MagangHub?", a: "100 karakter per kolom: uraian aktivitas, pembelajaran yang diperoleh, dan kendala yang dialami." },
      { q: "Apakah laporan MagangHub bisa diisi untuk hari sebelumnya?", a: "Tergantung periode dan kebijakan mentor. Di kalender, hari yang terlewat ditandai 'Belum Diisi'. Isi secepatnya dan beri tahu mentor." },
      { q: "Apa yang ditulis di kolom kendala kalau tidak ada kendala?", a: "Tulis hambatan kecil yang nyata beserta cara mengatasinya, misalnya data yang belum lengkap atau akses yang terlambat. Hindari 'tidak ada kendala'." },
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

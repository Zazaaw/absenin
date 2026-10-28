import type { Metadata } from "next";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/pricing-faq";

export const metadata: Metadata = {
  title: "Syarat Layanan dan Kebijakan Refund",
  description: "Ketentuan pemakaian Magang Diary, batas tanggung jawab, lisensi satu perangkat, dan refund 7 hari.",
  alternates: { canonical: "/syarat" },
};

const SECTIONS: [string, string][] = [
  ["1. Apa itu Magang Diary", "Magang Diary adalah ekstensi Chrome dan layanan web yang membantu peserta magang mengingat jadwal pengisian laporan di MagangHub dan merangkai tiga kolom laporan dari cerita singkat yang ditulis peserta. Magang Diary bukan produk Kementerian Ketenagakerjaan atau MagangHub dan tidak berafiliasi dengan keduanya."],
  ["2. Tanggung jawab atas isi laporan", "Teks yang dihasilkan dirangkai dari cerita yang kamu tulis sendiri. Kamu wajib membaca, memperbaiki bila perlu, lalu mengirimnya sendiri lewat tombol Simpan dan Kirim di MagangHub. Isi laporan, kebenarannya, dan akibatnya sepenuhnya tanggung jawab kamu. Magang Diary tidak pernah menekan tombol kirim dan tidak menjamin laporan diterima oleh mentor atau sistem MagangHub."],
  ["3. Lisensi", "Satu kode lisensi berlaku untuk satu orang dan satu perangkat aktif. Pindah perangkat diperbolehkan; perangkat sebelumnya otomatis dilepas dan perpindahan dicatat. Membagikan kode lisensi ke orang lain, menjualnya kembali, atau memakainya untuk layanan lain dapat membuat lisensi dicabut tanpa refund."],
  ["4. Kuota dan ketersediaan", "Setiap lisensi punya kuota generate per hari sesuai paket. Layanan bergantung pada penyedia AI pihak ketiga dan pada tampilan situs MagangHub; keduanya bisa berubah sewaktu-waktu. Kami berusaha memperbarui secepatnya, tetapi tidak menjanjikan layanan bebas gangguan. Saat gangguan, fitur pengingat tetap berjalan dan generate memakai template cadangan."],
  ["5. Refund", "Kamu boleh minta refund penuh dalam 7 hari sejak pembayaran pertama, apa pun alasannya, lewat email halo@magangdiary.id dengan email akun kamu. Refund diproses maksimal 7 hari kerja ke rekening atau metode pembayaran asal. Perpanjangan bulan berikutnya tidak bisa di-refund setelah periode berjalan lebih dari 7 hari. Lisensi yang dicabut karena pelanggaran pasal 3 tidak di-refund."],
  ["6. Harga dan perubahan", "Harga dapat berubah. Perubahan tidak berlaku untuk periode yang sudah dibayar. Kami memberi tahu lewat email minimal 14 hari sebelum harga baru berlaku untuk perpanjangan."],
  ["7. Data", "Pengumpulan dan pemakaian data dijelaskan di Kebijakan Privasi. Singkatnya: cerita singkat yang kamu ketik diteruskan ke penyedia AI, isi laporan tidak disimpan di server, riwayat Chrome dibaca di laptop kamu saja."],
  ["8. Penghentian", "Kamu bisa berhenti kapan saja dengan tidak memperpanjang. Kami bisa menghentikan layanan ke akun yang melanggar ketentuan ini, dengan pemberitahuan lewat email kecuali pelanggarannya berupa penyalahgunaan yang membahayakan pengguna lain."],
  ["9. Batas tanggung jawab", "Sejauh diizinkan hukum, tanggung jawab Magang Diary terbatas pada jumlah yang kamu bayarkan dalam 1 bulan terakhir. Kami tidak bertanggung jawab atas teguran, penilaian magang, atau kerugian lain yang timbul dari laporan yang kamu kirim."],
  ["10. Kontak", "Pertanyaan, refund, dan penghapusan data: halo@magangdiary.id. Ketentuan ini berlaku sejak 28 Oktober 2026 dan bisa diperbarui; versi terbaru selalu ada di halaman ini."],
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <BlurFade>
          <PageHeader title="Syarat Layanan dan Kebijakan Refund" subtitle="Sepuluh pasal, bahasa manusia. Yang paling penting: laporan tetap kamu yang kirim, dan refund 7 hari tanpa tanya-tanya." />
          <div className="space-y-8">
            {SECTIONS.map(([h, p]) => (
              <section key={h}><h2 className="text-h5 font-bold tracking-tight">{h}</h2><p className="mt-2 max-w-[65ch] text-body text-muted-foreground">{p}</p></section>
            ))}
          </div>
        </BlurFade>
      </main>
      <Footer />
    </>
  );
}

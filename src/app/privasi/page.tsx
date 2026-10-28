import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/pricing-faq";

export const metadata = { title: "Kebijakan Privasi", description: "Apa yang dikumpulkan Absenin, apa yang tidak, dan cara menghapus data.", alternates: { canonical: "/privasi" } };

const SECTIONS = [
  ["Apa yang dikumpulkan", "Saat kamu menekan Generate, ekstensi mengirim cerita singkat yang kamu ketik, gaya laporan yang dipilih, nama panggilan (kalau diisi), dan tiga laporan terakhir yang sudah terkirim sebagai konteks. Server mencatat waktu, jumlah token, dan status berhasil atau gagal untuk menghitung kuota dan biaya. Isi laporan tidak disimpan di server."],
  ["Riwayat Chrome", "Fitur Tebak dari riwayat Chrome mati secara bawaan. Kalau kamu menyalakannya, riwayat kunjungan hari ini dibaca di laptop kamu sendiri dan dirangkum jadi satu kalimat. Hanya kalimat itu yang mungkin terkirim, dan kamu melihatnya dulu di kotak cerita sebelum menekan Generate."],
  ["Kunci AI", "Kunci penyedia AI disimpan di server Absenin. Ekstensi hanya memegang kode lisensi. Permintaan dari ekstensi dibatasi kuota per hari per lisensi."],
  ["Apa yang tidak dilakukan", "Ekstensi tidak pernah menekan tombol Simpan dan Kirim. Ekstensi tidak membaca halaman lain selain monev.maganghub.kemnaker.go.id, dan tidak mengubah data di sistem MagangHub."],
  ["Hapus data", "Minta penghapusan akun dan log pemakaian lewat email halo@absenin.id. Data dihapus dalam 7 hari kerja."],
  ["Hubungan dengan Kemnaker", "Absenin bukan produk resmi Kementerian Ketenagakerjaan atau MagangHub, dan tidak berafiliasi dengan keduanya."],
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <BlurFade>
          <PageHeader title="Kebijakan Privasi" subtitle="Singkat, jujur, dan dalam bahasa manusia. Diperbarui 27 Oktober 2026." />
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

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import DotPattern from "@/components/effects/dot-pattern";
import { AmbientGrid } from "@/components/effects/ambient";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
// Satu aksen serif italic, dipakai sekali: kata yang berputar di hero.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--font-serif-accent", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Absenin: pengingat absensi dan laporan harian MagangHub", template: "%s · Absenin" },
  description: "Ekstensi Chrome yang mengingatkan laporan harian MagangHub jam 16.00 dan merangkai uraian aktivitas, pembelajaran, dan kendala dari cerita singkatmu. Tombol kirim tetap kamu yang tekan. Trial 7 hari gratis.",
  keywords: ["MagangHub", "laporan harian MagangHub", "cara mengisi laporan MagangHub", "absensi MagangHub", "uraian aktivitas magang", "pengingat laporan magang", "ekstensi Chrome magang", "Kemnaker magang"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: { canonical: "/" },
  openGraph: { title: "Absenin: laporan MagangHub selesai sebelum kamu lupa", description: "Pengingat jam 16.00 yang nggak bisa dicuekin, plus tiga kolom laporan dirangkai dari cerita singkatmu.", type: "website", locale: "id_ID", siteName: "Absenin" },
  twitter: { card: "summary_large_image", title: "Absenin", description: "Laporan MagangHub selesai sebelum kamu lupa." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${jakarta.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="pointer-events-none fixed inset-0 z-0 text-neutral-400/60">
            <DotPattern width={20} height={20} cx={1} cy={1} cr={1} className="[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]" />
          </div>
          <AmbientGrid />
          <div className="relative z-20 flex min-h-full flex-1 flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}

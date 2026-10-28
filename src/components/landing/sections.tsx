"use client";

import { AlarmClock, Sparkles as SparkIcon, History, Flower2, Palette, Lock, Keyboard, Volume2 } from "lucide-react";
import { HoverCard } from "@/components/effects/hover-card";
import { Marquee } from "@/components/effects/marquee";
import { NumberTicker } from "@/components/effects/number-ticker";
import { Reveal, Parallax } from "@/components/effects/parallax";
import BlurFade from "@/components/effects/blur-fade";
import { Mascot, useThemes } from "./mascot";
import { Shot } from "./shot";
import { THEME_ORDER } from "@/lib/site";

export function SectionHead({ overline, title, sub }: { overline: string; title: string; sub?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-overline font-bold uppercase text-muted-foreground">{overline}</p>
      <h2 className="mt-3 text-h3 font-extrabold tracking-tight md:text-h2">{title}</h2>
      {sub && <p className="mt-4 text-body text-muted-foreground">{sub}</p>}
    </Reveal>
  );
}

export function ThemeMarquee() {
  const themes = useThemes();
  const list = THEME_ORDER.map((id) => themes.find((t) => t.id === id)).filter(Boolean);
  return (
    <section className="border-y bg-background/40 py-6 backdrop-blur">
      <Marquee duration="45s">
        {(list.length ? list : THEME_ORDER.map((id) => ({ id, nama: id, maskot: id }))).map((t) => (
          <div key={t!.id} className="flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-xs">
            <Mascot themeId={t!.id} size={28} />
            <span className="text-body-sm font-semibold">{t!.nama}</span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}

export function Stats() {
  const items = [
    { v: 2, suffix: " menit", label: "dari pengingat sampai laporan terkirim. Mie instan aja belum mateng." },
    { v: 11, suffix: "", label: "tema dengan maskot yang hidup. Kedip, napas, nguap kalau malam." },
    { v: 5, suffix: " detik", label: "chime di layar pembuka, lalu diam. Bukan alarm subuh." },
    { v: 0, suffix: "", label: "tombol kirim yang ditekan otomatis. Nol. Itu angkanya." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <BlurFade key={it.label} inView delay={i * 0.06}>
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="tnum text-h3 font-extrabold tracking-tight"><NumberTicker value={it.v} suffix={it.suffix} /></div>
              <p className="mt-1 text-body-sm text-muted-foreground">{it.label}</p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: AlarmClock, title: "Pengingat yang nggak bisa dicuekin", desc: "Jam yang kamu set, Chrome dibawa ke depan, fullscreen, layar pembuka dengan maskot dan chime. Ngulang tiap 10 menit sampai laporan terkirim, lalu diam sendiri. Nggak ngambek.", big: true, shot: "splash-hiu", w: 1366, h: 768 },
  { icon: SparkIcon, title: "Ceritain dikit, sisanya dirangkai", desc: "Ketik satu baris atau tap chip kegiatan. Uraian aktivitas, pembelajaran, dan kendala jadi dalam hitungan detik, masing-masing lewat 100 karakter. Iya, yang \"minimal 100 karakter\" itu." },
  { icon: History, title: "Tebak dari riwayat Chrome", desc: "Lupa tadi ngapain? Chrome-mu ingat. Riwayat hari ini dibaca di laptop kamu, dirangkum jadi satu kalimat yang kamu lihat dulu sebelum apa pun dikirim." },
  { icon: Flower2, title: "Kebun yang tumbuh tiap hari", desc: "Satu tanda per laporan terkirim, streak yang kelihatan di ikon toolbar, maskot yang senyum atau layu tergantung kamu. Tekanan sosial dari pohon kecil." },
  { icon: Palette, title: "11 tema, mode malam otomatis", desc: "Dari Simpel yang netral sampai Bara yang gelap menyala. Maskotnya kedip, napas, dan melirik kursor. Agak merinding, tapi lucu." },
  { icon: Lock, title: "Kunci AI tidak pernah di laptop kamu", desc: "Ekstensi cuma pegang kode lisensi. Kunci AI ada di server, tiap permintaan dicatat dan dibatasi kuota. Nggak bisa diambil orang, nggak bisa kamu bocorin juga.", },
  { icon: Keyboard, title: "Alt+M dari tab mana pun", desc: "Satu shortcut buka MagangHub plus panel cerita. Ctrl+Enter buat generate. Jari nggak perlu pindah ke mouse." },
  { icon: Volume2, title: "Empat suara chime", desc: "Marimba, lonceng, retro 8-bit, drum. Otomatis dicocokkan dengan tema, atau pilih sendiri. Belum ada pilihan suara ibu manggil, maaf." },
];

export function Features() {
  return (
    <section id="fitur" className="mx-auto max-w-6xl scroll-m-24 px-6 py-20">
      <SectionHead overline="Fitur" title="Dibuat buat yang sering lupa, bukan yang rajin." sub="Yang rajin nggak butuh ini. Yang rajin juga biasanya nggak baca sampai sini." />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <BlurFade key={f.title} inView delay={i * 0.05} className={f.big ? "md:col-span-2 lg:col-span-2" : ""}>
            <HoverCard className="h-full">
              <div className={f.big ? "grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center" : ""}>
                <div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted"><f.icon className="size-4" /></span>
                  <h3 className="mt-4 text-h5 font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-body-sm text-muted-foreground">{f.desc}</p>
                </div>
                {f.big && f.shot && (
                  <div className="overflow-hidden rounded-lg border shadow-sm">
                    <Shot name={f.shot} alt={f.title} width={f.w!} height={f.h!} className="w-full" />
                  </div>
                )}
              </div>
            </HoverCard>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}

export function ShotsParallax() {
  const cols = [
    { speed: 0.25, shots: [["popup-sore", 840, 1200], ["popup-robo", 840, 1200]] },
    { speed: -0.15, shots: [["options-bara", 1536, 900], ["panel-astro", 1200, 900]] },
    { speed: 0.35, shots: [["popup-harimau", 840, 1200], ["popup-astro", 840, 1200]] },
  ] as const;
  return (
    <section className="relative overflow-hidden py-20">
      <SectionHead overline="Tampilan" title="Setiap sudutnya diperhatikan." sub="Popup, pengaturan, layar pembuka, panel. Semua ikut tema yang kamu pilih. Bahkan tombol tutupnya muter kalau disentuh." />
      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-5 px-6 md:grid-cols-3">
        {cols.map((c, i) => (
          <Parallax key={i} speed={c.speed} className={i === 1 ? "md:mt-16" : ""}>
            <div className="space-y-5">
              {c.shots.map(([n, w, h]) => (
                <div key={n} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                  <Shot name={n} alt={n} width={w} height={h} className="w-full" />
                </div>
              ))}
            </div>
          </Parallax>
        ))}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/pricing-faq";
import { POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog: panduan laporan MagangHub",
  description: "Panduan praktis mengisi laporan harian MagangHub, contoh isian, dan kebiasaan supaya nggak telat.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <BlurFade>
          <PageHeader title="Blog" subtitle="Panduan singkat seputar laporan magang. Ditulis buat dibaca jam 16.05, bukan buat SEO doang." />
          <div className="space-y-5">
            {POSTS.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="block rounded-xl border border-neutral-200 bg-white p-6 shadow-xs transition-all duration-300 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700">
                <p className="text-overline font-bold uppercase text-muted-foreground">{new Date(p.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · {p.readMin} menit baca</p>
                <h2 className="mt-2 text-h5 font-bold tracking-tight">{p.title}</h2>
                <p className="mt-2 text-body-sm text-muted-foreground">{p.description}</p>
              </Link>
            ))}
          </div>
        </BlurFade>
      </main>
      <Footer />
    </>
  );
}

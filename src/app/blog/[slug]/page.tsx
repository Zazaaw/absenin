import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlurFade from "@/components/effects/blur-fade";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/pricing-faq";
import { POSTS, getPost } from "@/lib/blog";
import { env } from "@/lib/env";

export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title, description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const base = env.siteUrl.replace(/\/$/, "");
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.description, datePublished: post.date, author: { "@type": "Organization", name: "Magang Diary" }, publisher: { "@type": "Organization", name: "Magang Diary" }, mainEntityOfPage: `${base}/blog/${post.slug}`, inLanguage: "id-ID" },
    post.faq && { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ].filter(Boolean);
  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <BlurFade>
          <article>
            <p className="text-overline font-bold uppercase text-muted-foreground"><Link href="/blog" className="hover:text-foreground">Blog</Link> · {new Date(post.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · {post.readMin} menit baca</p>
            <h1 className="mt-3 text-h3 font-extrabold tracking-tight md:text-h2">{post.title}</h1>
            <p className="mt-4 max-w-[65ch] text-lead text-muted-foreground">{post.description}</p>
            <div className="mt-10 space-y-10">
              {post.sections.map((s) => (
                <section key={s.h}>
                  <h2 className="text-h5 font-bold tracking-tight">{s.h}</h2>
                  {s.p.map((p, i) => <p key={i} className="mt-rhythm max-w-[65ch] text-body text-muted-foreground first:mt-3">{p}</p>)}
                </section>
              ))}
              {post.faq && (
                <section>
                  <h2 className="text-h5 font-bold tracking-tight">Pertanyaan yang sering muncul</h2>
                  <dl className="mt-4 divide-y rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50">
                    {post.faq.map((f) => <div key={f.q} className="px-5 py-4"><dt className="font-semibold">{f.q}</dt><dd className="mt-1 text-body-sm text-muted-foreground">{f.a}</dd></div>)}
                  </dl>
                </section>
              )}
            </div>
            <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
              <p className="text-h5 font-bold tracking-tight">Mau diingetin jam 16.00 dan dibantu nulis tiga kolomnya?</p>
              <p className="mt-2 text-body-sm text-muted-foreground">Magang Diary, ekstensi Chrome. Trial 7 hari, tanpa kartu. Tombol kirim tetap kamu yang tekan.</p>
              <div className="mt-4 flex gap-2"><Button asChild><Link href="/daftar">Coba gratis</Link></Button><Button asChild variant="outline"><Link href="/#cara">Lihat cara kerjanya</Link></Button></div>
            </div>
          </article>
        </BlurFade>
      </main>
      <Footer />
    </>
  );
}

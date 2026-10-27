import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ThemeMarquee, Stats, Features, ShotsParallax } from "@/components/landing/sections";
import { Steps } from "@/components/landing/steps";
import { GalleryBridge } from "@/components/landing/gallery-bridge";
import { ThemeShowcase } from "@/components/landing/theme-showcase";
import { Pricing, Faq, FinalCta, Footer } from "@/components/landing/pricing-faq";
import { SocialProof } from "@/components/landing/social";
import { FAQ, PLANS } from "@/lib/site";
import { env } from "@/lib/env";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { VelocityMarquee } from "@/components/effects/velocity-marquee";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();
  const base = env.siteUrl.replace(/\/$/, "");
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Magang Diary", applicationCategory: "BrowserApplication", operatingSystem: "Chrome", description: "Pengingat absensi MagangHub dan generator laporan harian dari cerita singkat.", url: base, offers: PLANS.map((p) => ({ "@type": "Offer", name: p.nama, price: p.harga.replace(/[^0-9]/g, "") || "0", priceCurrency: "IDR" })), inLanguage: "id-ID" },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SmoothScroll />
      <ScrollProgress />
      <Navbar loggedIn={!!user} />
      <main>
        <Hero />
        <ThemeMarquee />
        <Stats />
        <VelocityMarquee text="ceritain dikit · sisanya dirangkai · kamu yang kirim ·" className="border-y text-muted-foreground/40" />
        <Features />
        <Steps />
        <GalleryBridge />
        <ThemeShowcase />
        <ShotsParallax />
        <VelocityMarquee text="jam 16.00 · ada yang ngingetin · streak jangan putus ·" baseVelocity={-40} className="border-y text-muted-foreground/40" />
        <Pricing />
        <SocialProof />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CreateLicenseForm } from "@/components/app/admin-panels";
import { getDb } from "@/lib/db";

export const metadata = { title: "Buat lisensi" };
export const dynamic = "force-dynamic";

export default async function NewLicensePage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  const cfg = await getDb().getConfig();
  return (
    <BlurFade>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground"><Link href="/admin/lisensi"><ArrowLeft />Daftar lisensi</Link></Button>
      <PageHeader title="Buat lisensi" subtitle="Pilih paket, isi email pembeli, lalu cek ringkasannya di kanan sebelum klik Buat." />
      <CreateLicenseForm defaults={{ trialDays: cfg.trialDays, defaultDailyQuota: cfg.defaultDailyQuota }} prefillEmail={email} />
    </BlurFade>
  );
}

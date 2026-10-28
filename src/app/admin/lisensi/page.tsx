import Link from "next/link";
import { Plus } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { LicenseTable } from "@/components/app/admin-panels";
import { getDb } from "@/lib/db";

export const metadata = { title: "Lisensi" };
export const dynamic = "force-dynamic";

export default async function LicensesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const licenses = await getDb().listLicenses();
  return (
    <BlurFade>
      <PageHeader title="Lisensi" subtitle="Semua kode yang pernah dibuat. Perpanjang, lepas perangkat, atau cabut dari sini." action={<Button asChild><Link href="/admin/lisensi/baru"><Plus />Buat lisensi</Link></Button>} />
      <LicenseTable licenses={licenses} initialQuery={q} />
    </BlurFade>
  );
}

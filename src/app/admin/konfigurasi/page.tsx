import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { ConfigForm } from "@/components/app/admin-panels";
import { getDb } from "@/lib/db";

export const metadata = { title: "Konfigurasi" };
export const dynamic = "force-dynamic";

export default async function ConfigPage() {
  const config = await getDb().getConfig();
  return (
    <BlurFade>
      <PageHeader title="Konfigurasi" subtitle="Setelan yang dibaca ekstensi dari server. Ubah di sini, berlaku ke semua orang tanpa perlu rilis ulang." />
      <ConfigForm config={config} />
    </BlurFade>
  );
}

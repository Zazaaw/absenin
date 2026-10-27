import Link from "next/link";
import { redirect } from "next/navigation";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/shell";
import { TrialButton } from "@/components/app/license-card";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { PLANS } from "@/lib/site";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?plan=" + ((await searchParams).plan || "pro"));
  const { plan: planId = "pro" } = await searchParams;
  const plan = PLANS.find((p) => p.id === planId) || PLANS[1];
  const licenses = await getDb().listLicenses({ email: user.email });

  return (
    <AppShell admin={user.role === "admin"} email={user.email}>
      <BlurFade>
        <PageHeader title={`Paket ${plan.nama}`} subtitle={plan.deskripsi} />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
            <p className="tnum text-h3 font-extrabold tracking-tight">{plan.harga} <span className="text-caption font-normal text-muted-foreground">/ {plan.periode}</span></p>
            <ul className="mt-4 space-y-2 text-body-sm text-muted-foreground">{plan.fitur.map((f) => <li key={f}>• {f}</li>)}</ul>
          </div>
          <div className="space-y-4">
            {plan.id === "trial" ? (
              licenses.length ? <p className="rounded-xl border p-6 text-body-sm text-muted-foreground">Kamu sudah punya lisensi. Lihat di <Link className="font-semibold text-foreground" href="/dashboard">dashboard</Link>.</p> : <TrialButton />
            ) : (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6">
                <p className="font-semibold text-amber-600 dark:text-amber-400">Pembayaran otomatis belum tersambung.</p>
                <p className="mt-2 text-body-sm text-muted-foreground">Gerbang pembayaran (Midtrans atau Xendit) dipasang setelah project Supabase siap. Sementara ini, aktivasi dilakukan manual oleh admin setelah transfer.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild><a href={`mailto:halo@magangdiary.id?subject=Aktivasi%20${plan.nama}&body=Email%20akun:%20${encodeURIComponent(user.email)}`}>Minta aktivasi lewat email</a></Button>
                  <Button asChild variant="outline"><Link href="/dashboard">Kembali ke dashboard</Link></Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </BlurFade>
    </AppShell>
  );
}

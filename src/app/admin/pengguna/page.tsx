import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { UserTable } from "@/components/app/admin-panels";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const metadata = { title: "Pengguna" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await getSessionUser();
  const db = getDb();
  const [users, licenses] = await Promise.all([db.listUsers(), db.listLicenses()]);
  const licenseCount: Record<string, number> = {};
  for (const l of licenses) licenseCount[l.email] = (licenseCount[l.email] || 0) + 1;
  return (
    <BlurFade>
      <PageHeader title="Pengguna" subtitle="Akun yang daftar lewat web. Admin bisa membuat dan mencabut lisensi siapa pun, jadi hati-hati memberi peran itu." />
      <UserTable users={users} meId={me!.id} licenseCount={licenseCount} />
    </BlurFade>
  );
}

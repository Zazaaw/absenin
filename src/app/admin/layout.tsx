import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/shell";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return <AppShell admin email={user.email} name={user.name}>{children}</AppShell>;
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/landing/navbar";
import { cn } from "@/lib/utils";

export function AppShell({ children, admin = false, email }: { children: React.ReactNode; admin?: boolean; email: string }) {
  const path = usePathname();
  const router = useRouter();
  const links = [{ href: "/dashboard", label: "Dashboard" }, ...(admin ? [{ href: "/admin", label: "Admin" }] : [])];
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6">
          <Logo />
          <nav className="ml-4 hidden items-center gap-1 sm:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={cn("rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors", path.startsWith(l.href) ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>{l.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <span className="hidden text-caption text-muted-foreground md:inline">{email}</span>
            <ModeToggle />
            <Button variant="ghost" size="icon" aria-label="Keluar" onClick={logout}><LogOut /></Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}

export const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  trial: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  expired: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  revoked: "bg-red-500/10 text-red-500 border-red-500/20",
  neutral: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
};
export function StatusPill({ kind, label }: { kind: string; label: string }) {
  return <span className={cn("rounded-full border px-3 py-1 text-overline font-bold uppercase", statusStyles[kind] || statusStyles.neutral)}>{label}</span>;
}

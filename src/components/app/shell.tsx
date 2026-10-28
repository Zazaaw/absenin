"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X, LayoutDashboard, KeyRound, Users, Activity, Settings2, Home, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/landing/navbar";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean; hint?: string };

const USER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Lisensi saya", icon: KeyRound, exact: true },
];
const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { href: "/admin/lisensi", label: "Lisensi", icon: KeyRound },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/laporan", label: "Laporan", icon: Activity },
  { href: "/admin/konfigurasi", label: "Konfigurasi", icon: Settings2 },
];

function NavLink({ item, path, onClick }: { item: NavItem; path: string; onClick?: () => void }) {
  const active = item.exact ? path === item.href : path.startsWith(item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors",
        active ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <item.icon className={cn("size-4 shrink-0", active ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
      {item.label}
    </Link>
  );
}

function Sidebar({ admin, email, name, path, onNavigate, onLogout }: { admin: boolean; email: string; name: string; path: string; onNavigate?: () => void; onLogout: () => void }) {
  const initials = (name || email).slice(0, 2).toUpperCase();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-5"><Logo /></div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div>
          <p className="mb-1.5 px-3 text-overline font-bold uppercase tracking-wider text-muted-foreground/70">Akun</p>
          <div className="space-y-0.5">{USER_NAV.map((i) => <NavLink key={i.href} item={i} path={path} onClick={onNavigate} />)}</div>
        </div>
        {admin && (
          <div>
            <p className="mb-1.5 px-3 text-overline font-bold uppercase tracking-wider text-muted-foreground/70">Admin</p>
            <div className="space-y-0.5">{ADMIN_NAV.map((i) => <NavLink key={i.href} item={i} path={path} onClick={onNavigate} />)}</div>
          </div>
        )}
        <div>
          <p className="mb-1.5 px-3 text-overline font-bold uppercase tracking-wider text-muted-foreground/70">Tautan</p>
          <div className="space-y-0.5">
            <a href="/downloads/absenin.zip" onClick={onNavigate} className="flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Download className="size-4 opacity-70" />Unduh ekstensi</a>
            <Link href="/" onClick={onNavigate} className="flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Home className="size-4 opacity-70" />Beranda<ExternalLink className="ml-auto size-3 opacity-50" /></Link>
          </div>
        </div>
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-caption font-bold text-background">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-semibold">{name || email.split("@")[0]}</p>
            <p className="truncate text-caption text-muted-foreground">{email}</p>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <ModeToggle />
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={onLogout}><LogOut />Keluar</Button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children, admin = false, email, name = "" }: { children: React.ReactNode; admin?: boolean; email: string; name?: string }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }

  return (
    <div className="flex min-h-full flex-1">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-background/80 backdrop-blur-xl lg:block">
        <Sidebar admin={admin} email={email} name={name} path={path} onLogout={logout} />
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Tutup menu" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r bg-background shadow-2xl">
            <Sidebar admin={admin} email={email} name={name} path={path} onNavigate={() => setOpen(false)} onLogout={logout} />
            <Button variant="ghost" size="icon" aria-label="Tutup" className="absolute top-2.5 right-2" onClick={() => setOpen(false)}><X /></Button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/70 px-4 backdrop-blur-xl lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Menu" onClick={() => setOpen(true)}><Menu /></Button>
          <Logo />
          <div className="ml-auto"><ModeToggle /></div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  trial: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  expired: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  revoked: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  neutral: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
};
export const statusLabel: Record<string, string> = { active: "Aktif", trial: "Trial", expired: "Kedaluwarsa", revoked: "Dicabut" };
export function StatusPill({ kind, label }: { kind: string; label?: string }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-overline font-bold uppercase tracking-wide", statusStyles[kind] || statusStyles.neutral)}>{label ?? statusLabel[kind] ?? kind}</span>;
}

/** Kartu putih standar untuk halaman aplikasi. */
export function Panel({ className, children, title, desc, action }: { className?: string; children: React.ReactNode; title?: string; desc?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            {title && <h3 className="font-semibold">{title}</h3>}
            {desc && <p className="mt-0.5 text-caption text-muted-foreground">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-10 text-center text-body-sm text-muted-foreground">{children}</p>;
}

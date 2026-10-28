"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara", label: "Cara kerja" },
  { href: "#tema", label: "Tema" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-bold tracking-tight", className)}>
      <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
        <span className="h-2.5 w-2.5 rounded-full bg-background" />
        <span className="absolute inset-0 rounded-lg bg-foreground/40 animate-pulse-ring" />
      </span>
      Absenin
    </Link>
  );
}

export function Navbar({ loggedIn = false }: { loggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => { gsap.from(ref.current, { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" }); }, { scope: ref });
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header ref={ref} className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className={cn("flex w-full max-w-5xl items-center justify-between rounded-full border px-4 py-2 transition-all duration-300", scrolled ? "border-neutral-200 bg-white/80 shadow-sm backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/70" : "border-transparent bg-transparent")}>
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3 py-1.5 text-body-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">{l.label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-1 md:flex">
          <ModeToggle />
          {loggedIn ? (
            <Button asChild variant="ghost"><Link href="/dashboard">Dashboard</Link></Button>
          ) : (
            <Button asChild variant="ghost"><Link href="/login">Masuk</Link></Button>
          )}
          <Button asChild className="rounded-full"><Link href="/daftar">Coba gratis</Link></Button>
        </div>
        <button className="md:hidden rounded-full p-2 hover:bg-accent" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      {open && (
        <div className="absolute top-16 left-4 right-4 rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg md:hidden dark:border-neutral-800 dark:bg-neutral-950">
          {LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-body-sm font-medium hover:bg-accent">{l.label}</a>)}
          <div className="mt-2 flex gap-2 border-t pt-3">
            <Button asChild variant="outline" className="flex-1"><Link href="/login">Masuk</Link></Button>
            <Button asChild className="flex-1"><Link href="/daftar">Coba gratis</Link></Button>
            <ModeToggle />
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Smooth scroll (Lenis) yang digerakkan oleh ticker GSAP, supaya scroll, ScrollTrigger, dan
 * semua tween berjalan di satu loop requestAnimationFrame yang sama.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // `content: document.body` penting: <html> di layout ini setinggi layar (h-full), jadi kalau
    // Lenis mengamati <html>, batas scroll-nya tidak ikut bertambah saat halaman memanjang.
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, content: document.body });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    // Setiap ScrollTrigger mengukur ulang (pin-spacer bertambah, gambar selesai dimuat), Lenis ikut diukur ulang.
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    const ro = new ResizeObserver(() => lenis.resize());
    ro.observe(document.body);
    // link anchor (#fitur dsb.) tetap halus
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href")!);
      if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: -80 }); }
    };
    document.addEventListener("click", onClick);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const t = setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", onLoad);
      clearTimeout(t);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ro.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}

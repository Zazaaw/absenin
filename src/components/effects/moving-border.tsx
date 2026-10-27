import { cn } from "@/lib/utils";

/**
 * Garis tepi berjalan: gradien conic berputar di lapisan belakang, kartu di depannya menutup
 * bagian dalam, sehingga yang terlihat hanya 1px tepi yang bercahaya. Tanpa mask, tanpa offset-path.
 */
export function MovingBorder({ children, className, duration = "6s" }: { children: React.ReactNode; className?: string; duration?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl p-px", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 animate-[spin_var(--d)_linear_infinite] will-change-transform"
        style={{ "--d": duration, background: "conic-gradient(from 0deg, transparent 0deg 290deg, hsl(var(--foreground) / .35) 320deg, hsl(var(--foreground)) 345deg, transparent 360deg)" } as React.CSSProperties}
      />
      <div className="relative h-full rounded-[11px] bg-card">{children}</div>
    </div>
  );
}

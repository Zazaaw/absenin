import { cn } from "@/lib/utils";

/** Scroller tak berujung memakai keyframe animate-marquee dari kit. */
export function Marquee({ children, className, duration = "40s", reverse = false, pauseOnHover = true, vertical = false }: {
  children: React.ReactNode; className?: string; duration?: string; reverse?: boolean; pauseOnHover?: boolean; vertical?: boolean;
}) {
  return (
    <div className={cn("group flex overflow-hidden [--gap:1rem] [gap:var(--gap)]", vertical ? "flex-col" : "flex-row", className)}>
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn("flex shrink-0 [gap:var(--gap)]", vertical ? "flex-col animate-marquee-vertical" : "flex-row animate-marquee", pauseOnHover && "group-hover:[animation-play-state:paused]", reverse && "[animation-direction:reverse]")}
          style={{ "--duration": duration } as React.CSSProperties}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

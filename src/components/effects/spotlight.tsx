"use client";

import { cn } from "@/lib/utils";

/** Sorot lembut dari pojok kiri atas (gaya Aceternity Spotlight), greyscale. */
export function Spotlight({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute z-0 h-[169%] w-[138%] opacity-0 animate-[spotlight_2s_ease_.5s_forwards] lg:w-[84%]", className)}
      viewBox="0 0 3787 2842" fill="none"
    >
      <g filter="url(#spot)">
        <ellipse cx="1924.71" cy="273.501" rx="1924.71" ry="273.501" transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)" fill="currentColor" fillOpacity="0.2" />
      </g>
      <defs>
        <filter id="spot" x="0.86" y="0.84" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
      <style>{`@keyframes spotlight { from { opacity: 0; transform: translate(-72%, -62%) scale(.5);} to { opacity: 1; transform: translate(-50%, -40%) scale(1);} }`}</style>
    </svg>
  );
}

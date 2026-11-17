"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Optional CSS class name to apply custom styles */
  className?: string;
  /** Whether to reverse the animation direction @default false */
  reverse?: boolean;
  /** Whether to pause the animation on hover @default false */
  pauseOnHover?: boolean;
  /** Content to be displayed in the marquee */
  children: React.ReactNode;
  /** Whether to animate vertically instead of horizontally @default false */
  vertical?: boolean;
  /** Number of times to repeat the content @default 4 */
  repeat?: number;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** ARIA live region politeness */
  ariaLive?: "off" | "polite" | "assertive";
  /** ARIA role */
  ariaRole?: string;
}

/**
 * Infinite scrolling marquee (horizontal or vertical). Animation keyframes live in
 * globals.css (`--animate-marquee`, `--animate-marquee-vertical`). Respects
 * prefers-reduced-motion and pauses on hover / keyboard focus when `pauseOnHover`.
 */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ariaLabel,
  ariaLive = "off",
  ariaRole = "marquee",
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      data-slot="marquee"
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        className,
      )}
      aria-label={ariaLabel}
      aria-live={ariaLive}
      role={ariaRole}
      tabIndex={0}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)]",
            vertical ? "animate-marquee-vertical flex-col" : "animate-marquee flex-row",
            pauseOnHover && "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
            "motion-reduce:animate-none",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

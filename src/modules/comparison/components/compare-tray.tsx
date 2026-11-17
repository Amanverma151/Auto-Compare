"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compareHref, MAX_COMPARE, MIN_COMPARE } from "../constants";
import { compareTray, useCompareTray } from "./compare-tray-store";

/** Floating bar listing cars queued for comparison. Hidden on the compare page itself. */
export function CompareTray() {
  const items = useCompareTray();
  const pathname = usePathname();
  if (items.length === 0 || pathname.startsWith("/compare")) return null;

  const ready = items.length >= MIN_COMPARE;

  return (
    <aside
      aria-label="Cars selected for comparison"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-3xl rounded-2xl border bg-background/90 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/75"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ul className="flex flex-1 flex-wrap gap-2">
          {items.map((item) => (
            <li key={item.slug} className="flex items-center gap-1 rounded-full border bg-muted/60 py-1 pr-1 pl-3 text-xs font-medium">
              <span className="max-w-48 truncate">{item.title}</span>
              <button
                type="button"
                onClick={() => compareTray.remove(item.slug)}
                className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Remove ${item.title}`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
          <li className="self-center text-xs text-muted-foreground">
            {items.length}/{MAX_COMPARE}
          </li>
        </ul>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => compareTray.clear()}>
            Clear
          </Button>
          {ready ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href={compareHref(items.map((i) => i.slug))}>
                Compare now <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : (
            <Button size="sm" className="rounded-full" disabled>
              Add {MIN_COMPARE - items.length} more
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

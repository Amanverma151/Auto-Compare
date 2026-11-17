"use client";

import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_COMPARE } from "../constants";
import { compareTray, useCompareTray } from "./compare-tray-store";

export function AddToCompareButton({ slug, title, size = "sm" }: { slug: string; title: string; size?: "sm" | "default" }) {
  const items = useCompareTray();
  const added = items.some((i) => i.slug === slug);
  const full = !added && items.length >= MAX_COMPARE;

  return (
    <Button
      type="button"
      size={size}
      variant={added ? "secondary" : "outline"}
      className="rounded-full"
      aria-pressed={added}
      disabled={full}
      title={full ? `You can compare up to ${MAX_COMPARE} cars` : undefined}
      onClick={() => (added ? compareTray.remove(slug) : compareTray.add({ slug, title }))}
    >
      {added ? <Check aria-hidden /> : <Plus aria-hidden />}
      {added ? "Added" : "Compare"}
      <span className="sr-only"> {title}</span>
    </Button>
  );
}

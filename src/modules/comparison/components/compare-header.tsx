"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { Check, Link2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/format";
import { CarSearch } from "@/modules/search";
import { CarImage, type VariantOption } from "@/modules/vehicles";
import { MAX_COMPARE } from "../constants";
import { compareSearchParams } from "../search-params";
import type { ComparisonColumn } from "../types";

/**
 * Car cards across the top of the compare page: switch trim, remove a car, add a car,
 * and copy a shareable link. All changes go through the `?ids=` URL param.
 */
export function CompareHeader({
  columns,
  variantOptions,
}: {
  columns: ComparisonColumn[];
  variantOptions: Record<string, VariantOption[]>;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [, setIds] = useQueryState("ids", compareSearchParams.ids.withOptions({ shallow: false, startTransition, scroll: false }));
  const slugs = columns.map((c) => c.slug);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the URL in the address bar is still shareable */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" role="status">
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Updating comparison…
            </span>
          ) : (
            `Comparing ${columns.length} of up to ${MAX_COMPARE} cars`
          )}
        </p>
        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={copyLink}>
          {copied ? <Check aria-hidden /> : <Link2 aria-hidden />}
          {copied ? "Link copied" : "Copy share link"}
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((c) => {
          const options = variantOptions[c.modelId] ?? [];
          return (
            <li key={c.slug} className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-4 pt-0">
              <CarImage
                src={c.imageUrl}
                alt={`${c.makeName} ${c.modelName}`}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="-mx-4"
              />
              <button
                type="button"
                onClick={() => setIds(slugs.filter((s) => s !== c.slug))}
                className="absolute top-2 right-2 z-10 rounded-full bg-background/85 p-1.5 text-muted-foreground shadow-sm backdrop-blur hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Remove ${c.title} from comparison`}
              >
                <X className="size-4" aria-hidden />
              </button>
              <div>
                <p className="text-xs text-muted-foreground">
                  {c.modelYear} {c.makeName}
                </p>
                <Link href={`/cars/${c.modelSlug}`} className="font-medium hover:text-brand-content">
                  {c.modelName}
                </Link>
                <p className="mt-1 text-lg font-semibold tracking-tight">{formatPrice(c.price)}</p>
              </div>
              {options.length > 1 ? (
                <Select
                  value={c.slug}
                  onValueChange={(next) => setIds(slugs.map((s) => (s === c.slug ? next : s)))}
                >
                  <SelectTrigger size="sm" className="w-full" aria-label={`Trim for ${c.makeName} ${c.modelName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((o) => (
                      <SelectItem key={o.slug} value={o.slug} disabled={o.slug !== c.slug && slugs.includes(o.slug)}>
                        {o.name} · {formatPrice(o.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">{c.variantName}</p>
              )}
            </li>
          );
        })}
        {columns.length < MAX_COMPARE && (
          <li className="flex flex-col justify-center gap-2 rounded-2xl border border-dashed p-4">
            <p className="text-sm font-medium">Add a car</p>
            <CarSearch
              placeholder="Search to add…"
              excludeSlugs={slugs}
              onSelect={(r) => setIds([...slugs, r.variantSlug].slice(0, MAX_COMPARE))}
            />
          </li>
        )}
      </ul>
    </div>
  );
}

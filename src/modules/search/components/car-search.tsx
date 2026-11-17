"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { MAX_QUERY_LENGTH, searchResponseSchema, type SearchResult } from "../schemas";

const DEBOUNCE_MS = 200;

/**
 * Autocomplete over makes, models and trims via `/api/search`.
 * Without `onSelect` it navigates to the model page; with it, it hands the result back
 * (used by the compare page and the TCO calculator to add a car).
 */
export function CarSearch({
  onSelect,
  excludeSlugs = [],
  placeholder = "Search make, model or trim",
  className,
  autoFocus,
}: {
  onSelect?: (result: SearchResult) => void;
  excludeSlugs?: string[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const controller = useRef<AbortController>(undefined);

  function onQueryChange(value: string) {
    const next = value.slice(0, MAX_QUERY_LENGTH);
    setQuery(next);
    setOpen(true);
    clearTimeout(timer.current);
    controller.current?.abort();
    if (!next.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const ac = new AbortController();
      controller.current = ac;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(next.trim())}`, { signal: ac.signal });
        const parsed = searchResponseSchema.safeParse(await res.json());
        setResults(parsed.success ? parsed.data.results : []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
  }

  function choose(result: SearchResult) {
    setOpen(false);
    setQuery("");
    setResults([]);
    if (onSelect) onSelect(result);
    else router.push(`/cars/${result.modelSlug}`);
  }

  const visible = results.filter((r) => !excludeSlugs.includes(r.variantSlug));
  const showList = open && query.trim().length > 0;

  return (
    <Command
      shouldFilter={false}
      label="Search cars"
      className={cn("relative overflow-visible rounded-2xl border bg-background p-1 shadow-sm", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <CommandInput
        value={query}
        onValueChange={onQueryChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Search cars"
      />
      {showList && (
        <CommandList className="absolute inset-x-0 top-full z-50 mt-2 max-h-80 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg">
          {loading && visible.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Searching…
            </div>
          ) : (
            <CommandEmpty>No cars match “{query}”.</CommandEmpty>
          )}
          {visible.length > 0 && (
            <CommandGroup heading="Cars">
              {visible.map((r) => (
                <CommandItem key={r.variantSlug} value={r.variantSlug} onSelect={() => choose(r)} className="flex-col items-start gap-0.5">
                  <span className="font-medium">{r.title}</span>
                  <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
}

"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Minus, Trophy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ComparisonCell, ComparisonColumn, ComparisonSection } from "../types";

function Cell({ cell }: { cell: ComparisonCell }) {
  if (cell.bool !== undefined) {
    return cell.bool ? (
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
        <Check className="size-4" aria-hidden />
        <span className="sr-only">Yes</span>
      </span>
    ) : (
      <span className="inline-flex items-center text-muted-foreground">
        <Minus className="size-4" aria-hidden />
        <span className="sr-only">No</span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5", cell.best && "font-semibold text-emerald-700 dark:text-emerald-400")}>
      {cell.display}
      {cell.best && (
        <>
          <Trophy className="size-3.5" aria-hidden />
          <span className="sr-only">(best in comparison)</span>
        </>
      )}
    </span>
  );
}

/**
 * Side-by-side comparison table. Sticky first column and header, collapsible
 * sections and an optional "only show differences" filter.
 */
export function CompareTable({
  columns,
  sections,
  allowDiffToggle = true,
  caption = "Side-by-side comparison",
}: {
  columns: ComparisonColumn[];
  sections: ComparisonSection[];
  allowDiffToggle?: boolean;
  caption?: string;
}) {
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const switchId = useId();

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visibleSections = sections
    .map((s) => ({ ...s, rows: onlyDiff ? s.rows.filter((r) => r.differs) : s.rows }))
    .filter((s) => s.rows.length > 0);

  return (
    <div className="space-y-3">
      {allowDiffToggle && columns.length > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Trophy className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            marks the best value in each row
          </p>
          <div className="flex items-center gap-2">
            <Switch id={switchId} checked={onlyDiff} onCheckedChange={setOnlyDiff} />
            <Label htmlFor={switchId} className="text-sm">
              Only show differences
            </Label>
          </div>
        </div>
      )}

      {/* `relative` keeps absolutely-positioned sr-only labels inside the scroll container. */}
      <div className="relative max-h-[75vh] overflow-auto rounded-xl border bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky top-0 left-0 z-30 min-w-36 border-b bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:min-w-52">
                Specification
              </th>
              {columns.map((c) => (
                <th key={c.slug} scope="col" className="sticky top-0 z-20 min-w-40 border-b bg-card px-4 py-3 text-left align-bottom">
                  {c.imageUrl && (
                    <Image src={c.imageUrl} alt="" width={96} height={60} className="mb-2 h-10 w-16 rounded-md object-cover" />
                  )}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {c.modelYear} {c.makeName}
                  </span>
                  <span className="block font-medium">
                    {c.modelName} {c.variantName}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {visibleSections.map((section) => {
            const isCollapsed = collapsed.has(section.id);
            return (
              <tbody key={section.id}>
                <tr>
                  <th colSpan={columns.length + 1} scope="colgroup" className="border-b bg-muted/50 p-0 text-left">
                    <button
                      type="button"
                      onClick={() => toggle(section.id)}
                      aria-expanded={!isCollapsed}
                      className="sticky left-0 flex w-full max-w-[100vw] items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wide text-foreground uppercase focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:w-auto"
                    >
                      <ChevronDown className={cn("size-4 transition-transform", isCollapsed && "-rotate-90")} aria-hidden />
                      {section.title}
                      <span className="font-normal text-muted-foreground normal-case">({section.rows.length})</span>
                    </button>
                  </th>
                </tr>
                {!isCollapsed &&
                  section.rows.map((row) => (
                    <tr key={row.key} className="group/row">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 border-b bg-card px-4 py-2.5 text-left font-normal text-muted-foreground group-hover/row:bg-muted"
                      >
                        {row.label}
                      </th>
                      {row.cells.map((cell, i) => (
                        <td
                          key={columns[i]?.slug ?? i}
                          className={cn(
                            "border-b px-4 py-2.5 align-top group-hover/row:bg-muted/60",
                            cell.best && "bg-emerald-50 dark:bg-emerald-950/40",
                          )}
                        >
                          <Cell cell={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            );
          })}
        </table>
        {visibleSections.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">These cars are identical on every compared attribute.</p>
        )}
      </div>
    </div>
  );
}

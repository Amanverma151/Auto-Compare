import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BODY_TYPE_LABELS, FUEL_TYPE_LABELS } from "@/modules/vehicles";
import { BODY_TYPES, FUEL_TYPES, PRICE_CAPS, serializeBrowse } from "../search-params";

type Filters = {
  body: (typeof BODY_TYPES)[number] | null;
  fuel: (typeof FUEL_TYPES)[number] | null;
  maxPrice: number | null;
};

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      scroll={false}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active ? "border-foreground bg-foreground text-background" : "bg-background hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}

/** Link-based filter chips: works without JavaScript and keeps filters in the URL. */
export function BrowseFilters({ filters }: { filters: Filters }) {
  const href = (patch: Partial<Filters>) => `/cars${serializeBrowse({ ...filters, ...patch })}`;
  const groups = [
    {
      label: "Body type",
      items: [{ label: "All", href: href({ body: null }), active: !filters.body }].concat(
        BODY_TYPES.map((b) => ({ label: BODY_TYPE_LABELS[b], href: href({ body: b }), active: filters.body === b })),
      ),
    },
    {
      label: "Powertrain",
      items: [{ label: "All", href: href({ fuel: null }), active: !filters.fuel }].concat(
        FUEL_TYPES.filter((f) => f !== "DIESEL" && f !== "PLUGIN_HYBRID").map((f) => ({
          label: FUEL_TYPE_LABELS[f],
          href: href({ fuel: f }),
          active: filters.fuel === f,
        })),
      ),
    },
    {
      label: "Price",
      items: [{ label: "Any", href: href({ maxPrice: null }), active: !filters.maxPrice }].concat(
        PRICE_CAPS.map((p) => ({ label: `Under ${formatPrice(p)}`, href: href({ maxPrice: p }), active: filters.maxPrice === p })),
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g.label} className="flex flex-wrap items-center gap-2" role="group" aria-label={g.label}>
          <span className="w-24 text-xs text-muted-foreground">{g.label}</span>
          {g.items.map((i) => (
            <Chip key={i.label} href={i.href} active={i.active}>
              {i.label}
            </Chip>
          ))}
        </div>
      ))}
    </div>
  );
}

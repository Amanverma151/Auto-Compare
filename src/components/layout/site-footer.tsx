import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "Compare",
    links: [
      { href: "/compare", label: "Side-by-side" },
      { href: "/cars?body=SUV", label: "SUVs" },
      { href: "/cars?body=SEDAN", label: "Sedans" },
      { href: "/cars?fuel=ELECTRIC", label: "Electric cars" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/tools/tco", label: "Cost of ownership" },
      { href: "/cars", label: "Browse & filter" },
    ],
  },
  {
    title: "Popular",
    links: [
      { href: "/cars/toyota-rav4", label: "Toyota RAV4" },
      { href: "/cars/honda-cr-v", label: "Honda CR-V" },
      { href: "/cars/tesla-model-y", label: "Tesla Model Y" },
      { href: "/cars/ford-f-150", label: "Ford F-150" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-xs text-muted-foreground">Compare cars side by side on specs, safety, running costs and expert verdicts.</p>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-3 text-xs text-muted-foreground">{c.title}</h2>
            <ul className="space-y-2 text-xs font-medium">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-brand-content">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <p role="note" className="rounded-xl border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
          <strong className="font-medium text-foreground">Sample data.</strong> Vehicle specifications, prices, ratings and costs on this site
          are approximate and illustrative, for demonstration only. Always confirm with the manufacturer and official rating agencies
          before buying.
        </p>
        <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>© Auto Compare</span>
          <Link href="/credits" className="hover:text-foreground">
            Photo credits (Wikimedia Commons, CC licences)
          </Link>
        </p>
      </div>
    </footer>
  );
}

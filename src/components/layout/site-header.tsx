import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/cars", label: "Browse cars" },
  { href: "/compare", label: "Compare" },
  { href: "/tools/tco", label: "Ownership cost" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-surface bg-surface-secondary backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild size="sm" className="rounded-full px-3.5">
            <Link href="/compare">Start comparing</Link>
          </Button>
        </div>
      </div>
      <nav aria-label="Main (mobile)" className="border-t border-border-surface md:hidden">
        <ul className="mx-auto flex max-w-6xl justify-around px-4 py-2 text-xs font-medium text-muted-foreground">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="hover:text-foreground">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

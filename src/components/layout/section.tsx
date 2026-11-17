import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small sky-blue "eyebrow" label above section headings, optionally a link. */
export function Eyebrow({ href, children, className }: { href?: string; children: React.ReactNode; className?: string }) {
  const cls = cn("inline-flex items-center gap-0.5 text-xs font-medium text-brand-content", className);
  if (!href) return <p className={cls}>{children}</p>;
  return (
    <Link href={href} className={cn(cls, "hover:underline")}>
      {children}
      <ChevronRight className="size-3" aria-hidden />
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  eyebrowHref,
  title,
  description,
  align = "center",
  id,
}: {
  eyebrow?: string;
  eyebrowHref?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  id?: string;
}) {
  return (
    <div className={cn("space-y-3", align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl")}>
      {eyebrow && <Eyebrow href={eyebrowHref}>{eyebrow}</Eyebrow>}
      <h2 id={id} className="text-2xl font-medium tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      {description && <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{description}</p>}
    </div>
  );
}

/** Page title block for inner pages. */
export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="bg-sky mx-2 mt-2 rounded-3xl px-4 pt-14 pb-12 sm:mx-3">
      <div className="mx-auto max-w-6xl space-y-3">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">{description}</p>}
        {children}
      </div>
    </div>
  );
}

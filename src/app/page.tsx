import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Gauge, ShieldCheck, Trophy, Wallet } from "lucide-react";
import { Eyebrow, SectionHeading } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format";
import { buildComparisonTable, compareHref, POPULAR_COMPARISONS } from "@/modules/comparison";
import { ReviewWall } from "@/modules/reviews";
import { getReviewHighlights } from "@/modules/reviews/server";
import { CarSearch } from "@/modules/search";
import { CarImage, ModelCard, modelTitle } from "@/modules/vehicles";
import { getVariantsBySlugs, listModelSummaries } from "@/modules/vehicles/server";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <Capabilities />
      <section aria-labelledby="popular-comparisons" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading id="popular-comparisons" eyebrow="Popular comparisons" title="Start with a matchup" align="left" />
        <Suspense fallback={<GridSkeleton count={4} className="h-36" />}>
          <PopularComparisons />
        </Suspense>
      </section>
      <section aria-labelledby="popular-models" className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading id="popular-models" eyebrow="Trending" title="Popular models" align="left" />
          <Link href="/cars" className="hidden shrink-0 text-sm font-medium text-brand-content hover:underline sm:block">
            Browse all cars
          </Link>
        </div>
        <Suspense fallback={<GridSkeleton count={8} className="h-56" />}>
          <PopularModels />
        </Suspense>
      </section>
      <section aria-labelledby="verdicts" className="frame px-4 py-20">
        <SectionHeading
          id="verdicts"
          eyebrow="Expert verdicts"
          title={
            <>
              <span className="text-muted-foreground/60">Reviews</span> that cut to the chase.
            </>
          }
          description="Every model gets a rating, a one-line verdict and clear pros and cons, so you know what you're trading off before the test drive."
        />
        <div className="mt-10">
          <Suspense fallback={<Skeleton className="h-[26rem] w-full rounded-xl" />}>
            <Verdicts />
          </Suspense>
        </div>
      </section>
      <TcoShowcase />
      <Cta />
    </>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-sky mx-2 mt-2 overflow-hidden rounded-3xl px-4 pt-16 sm:mx-3 sm:pt-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="rounded-full border border-border-surface bg-surface-tertiary px-2.5 py-0.5 text-[11px] font-medium text-foreground/70 backdrop-blur">
          18 models · 36 trims · 2025 model year
        </p>
        <h1 id="hero-title" className="mt-5 text-[2rem] leading-tight font-medium tracking-tight sm:text-[2.6rem]">
          Compare any car,
          <br />
          side by side.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/70">
          Trims, specs, performance, safety ratings and the real cost of ownership, all in one table.
        </p>
        <div className="mt-7 w-full max-w-md">
          <CarSearch className="rounded-full border-border-surface-strong shadow-md [&_[data-slot=input-group]]:rounded-full!" />
        </div>
        <Button asChild size="lg" className="mt-4 rounded-full px-4">
          <Link href={compareHref(POPULAR_COMPARISONS[1]?.slugs ?? [])}>
            Try a comparison <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
      <div className="mx-auto mt-14 max-w-4xl">
        <AppWindow>
          <Suspense fallback={<Skeleton className="m-4 h-64" />}>
            <PreviewTable />
          </Suspense>
        </AppWindow>
      </div>
    </section>
  );
}

function AppWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="translate-y-6 rounded-t-2xl border border-b-0 border-border-surface-strong bg-surface-primary shadow-2xl shadow-sky-900/10">
      <div className="flex items-center gap-1.5 border-b px-4 py-2.5" aria-hidden>
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="ml-3 rounded-md bg-muted px-3 py-0.5 text-[11px] text-muted-foreground">autocompare / compare</span>
      </div>
      <div className="pb-6">{children}</div>
    </div>
  );
}

/** A live, condensed comparison rendered inside the hero window. */
async function PreviewTable() {
  await connection();
  const preset = POPULAR_COMPARISONS[1];
  if (!preset) return null;
  const vehicles = await getVariantsBySlugs(preset.slugs);
  const table = buildComparisonTable(vehicles);
  const pick = new Set(["price", "power", "efficiency", "overallStars", "tco5y", "rating"]);
  const rows = table.sections.flatMap((s) => s.rows).filter((r) => pick.has(r.key));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-xs">
        <caption className="sr-only">Preview: {preset.title}</caption>
        <thead>
          <tr className="border-b">
            <th scope="col" className="px-4 py-3 font-normal text-muted-foreground">
              {preset.title}
            </th>
            {table.columns.map((c) => (
              <th key={c.slug} scope="col" className="px-4 py-3 align-bottom font-medium">
                <CarImage
                  src={c.imageUrl}
                  alt=""
                  sizes="220px"
                  priority
                  className="mb-2.5 w-full max-w-[200px] rounded-lg"
                />
                {c.makeName} {c.modelName}
                <span className="block font-normal text-muted-foreground">{c.variantName}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b last:border-0">
              <th scope="row" className="px-4 py-2.5 font-normal text-muted-foreground">
                {r.label}
              </th>
              {r.cells.map((cell, i) => (
                <td key={i} className={cell.best ? "px-4 py-2.5 font-semibold text-brand-content" : "px-4 py-2.5"}>
                  {cell.display}
                  {cell.best && <Trophy className="ml-1 inline size-3" aria-label="best" />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Intro() {
  return (
    <section aria-label="About Auto Compare" className="border-b">
      <div className="mx-auto grid max-w-5xl items-start gap-6 px-4 pt-24 pb-16 md:grid-cols-[1fr_2fr]">
        <Eyebrow href="/compare" className="md:justify-self-center">
          Introducing Auto Compare
        </Eyebrow>
        <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="font-medium text-foreground">Car shopping means twenty open tabs.</strong> Spec sheets in different
            units, safety scores on another site, running costs nowhere at all.
          </p>
          <p>
            <strong className="font-medium text-foreground">Auto Compare puts it in one table.</strong> Pick up to four cars and see
            configurations, performance, safety, maintenance and ownership costs, with the best value in every row highlighted.
          </p>
        </div>
      </div>
    </section>
  );
}

const CAPABILITIES = [
  {
    icon: Gauge,
    title: "Specs & performance",
    body: "Horsepower, torque, 0–60, fuel economy or EV range, dimensions and cargo space.",
    gradient: "from-sky-200 via-indigo-100 to-pink-100 dark:from-sky-900 dark:via-indigo-950 dark:to-fuchsia-950",
  },
  {
    icon: ShieldCheck,
    title: "Safety",
    body: "Crash-test stars for every test, airbag count and which driver-assist systems are standard.",
    gradient: "from-cyan-100 via-sky-200 to-blue-200 dark:from-cyan-950 dark:via-sky-900 dark:to-blue-950",
  },
  {
    icon: Wallet,
    title: "Ownership cost",
    body: "Service intervals, insurance, warranty, resale value and a full 5-year cost estimate.",
    gradient: "from-emerald-100 via-teal-50 to-sky-100 dark:from-emerald-950 dark:via-teal-950 dark:to-sky-950",
  },
];

function Capabilities() {
  return (
    <section aria-labelledby="capabilities" className="frame bg-gradient-to-b from-muted/40 to-background px-4 py-20">
      <SectionHeading
        id="capabilities"
        eyebrow="Everything in one place"
        eyebrowHref="/compare"
        title="Every spec that matters, side by side."
        description="Unlike a brochure, Auto Compare lines cars up row by row in consistent units, so differences jump out instead of hiding in footnotes."
      />
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {CAPABILITIES.map((c) => (
          <li key={c.title}>
            <div className="aspect-[4/3.6] rounded-sm bg-muted/70 p-4 dark:bg-muted/40">
              <div className={`grid aspect-square w-3/4 place-items-center bg-gradient-to-br ${c.gradient}`}>
                <c.icon className="size-10 text-foreground/60" strokeWidth={1.25} aria-hidden />
              </div>
            </div>
            <p className="px-1 pt-4 text-xs leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">{c.title}</strong> {c.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function PopularComparisons() {
  await connection();
  const all = await getVariantsBySlugs([...new Set(POPULAR_COMPARISONS.flatMap((c) => c.slugs))]);
  const bySlug = new Map(all.map((v) => [v.slug, v]));
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
      {POPULAR_COMPARISONS.map((c) => {
        const cars = c.slugs.flatMap((s) => bySlug.get(s) ?? []);
        return (
          <li key={c.title}>
            <Link
              href={compareHref(c.slugs)}
              className="group flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{c.title}</span>
                <span className="flex -space-x-3" aria-hidden>
                  {cars.map((v) => (
                    <CarImage
                      key={v.slug}
                      src={v.model.imageUrl}
                      alt=""
                      sizes="64px"
                      className="aspect-square size-10 rounded-full border-2 border-card shadow-sm"
                    />
                  ))}
                </span>
              </span>
              <span className="font-medium text-balance">{cars.map((v) => modelTitle(v)).join(" vs ")}</span>
              <span className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                {cars.map((v) => formatPrice(v.price)).join(" · ")}
                <ArrowRight className="size-4 text-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

async function PopularModels() {
  await connection();
  const models = await listModelSummaries({ popularOnly: true });
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {models.map((m) => (
        <li key={m.slug}>
          <ModelCard model={m} />
        </li>
      ))}
    </ul>
  );
}

async function Verdicts() {
  await connection();
  const reviews = await getReviewHighlights();
  return <ReviewWall reviews={reviews} />;
}

function TcoShowcase() {
  const bars = [
    { label: "Depreciation", w: "w-[46%]", c: "bg-sky-400" },
    { label: "Fuel / energy", w: "w-[22%]", c: "bg-white/70" },
    { label: "Maintenance", w: "w-[9%]", c: "bg-white/40" },
    { label: "Insurance", w: "w-[23%]", c: "bg-sky-200" },
  ];
  return (
    <section aria-labelledby="tco-showcase" className="mx-auto mt-4 grid max-w-5xl overflow-hidden border md:grid-cols-2">
      <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
        <div className="space-y-1">
          <h2 id="tco-showcase" className="text-xl font-medium tracking-tight">
            Cost of ownership calculator
          </h2>
          <p className="text-xl tracking-tight text-muted-foreground">The sticker price is only the start.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-fit rounded-full">
          <Link href="/tools/tco">Open the calculator</Link>
        </Button>
        <dl className="space-y-4 text-xs">
          <div>
            <dt className="font-medium">Your numbers</dt>
            <dd className="text-muted-foreground">Set your yearly mileage, fuel and electricity prices and how long you&apos;ll keep the car.</dd>
          </div>
          <div>
            <dt className="font-medium">Every cost included</dt>
            <dd className="text-muted-foreground">Depreciation, fuel or charging, scheduled maintenance and insurance, compared across up to four cars.</dd>
          </div>
        </dl>
      </div>
      <div className="grid place-items-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-8 sm:p-12" aria-hidden>
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-baseline justify-between text-white">
            <span className="text-xs text-white/60">5-year total</span>
            <span className="text-2xl font-semibold tracking-tight">{formatPrice(38_420)}</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full">
            {bars.map((b) => (
              <span key={b.label} className={`${b.w} ${b.c}`} />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
            {bars.map((b) => (
              <li key={b.label} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${b.c}`} />
                {b.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section aria-labelledby="cta" className="mx-auto mt-24 max-w-5xl px-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-50 via-sky-100 to-sky-400 px-6 py-20 text-center dark:from-sky-950/40 dark:via-sky-950 dark:to-sky-800">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(circle,_rgb(255_255_255/0.5)_1px,_transparent_1px)] [background-size:12px_12px] [mask-image:linear-gradient(to_top,black,transparent)]"
          aria-hidden
        />
        <h2 id="cta" className="relative text-3xl font-medium tracking-tight text-balance text-slate-950 sm:text-4xl dark:text-white">
          Find the right car.
          <br />
          Start comparing today.
        </h2>
        <Button asChild size="lg" className="relative mt-8 rounded-full px-5">
          <Link href="/compare">
            Start comparing <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function GridSkeleton({ count, className }: { count: number; className?: string }) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={`rounded-2xl ${className ?? ""}`} />
      ))}
    </div>
  );
}

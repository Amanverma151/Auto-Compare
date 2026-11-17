import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";
import { units } from "@/lib/format";
import { CompareHeader, CompareTable, compareHref, loadCompareSearchParams, MIN_COMPARE, parseCompareIds, POPULAR_COMPARISONS } from "@/modules/comparison";
import { loadComparison } from "@/modules/comparison/server";
import { PerformanceChart } from "@/modules/performance";
import { ProsCons } from "@/modules/reviews";
import { CarSearch } from "@/modules/search";
import { modelTitle } from "@/modules/vehicles";

export const metadata: Metadata = {
  title: "Compare cars side by side",
  description: "Compare up to four cars on configuration, performance, safety, ownership cost and expert verdicts.",
};

export default function ComparePage({ searchParams }: PageProps<"/compare">) {
  return (
    <>
      <PageHeader
        eyebrow="Side-by-side"
        title="Compare cars"
        description="Pick up to four cars. Switch trims, hide identical rows, and share the link: the comparison lives in the URL."
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Suspense fallback={<CompareSkeleton />}>
          <Comparison searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Comparison({ searchParams }: { searchParams: PageProps<"/compare">["searchParams"] }) {
  await connection();
  const { ids: raw } = await loadCompareSearchParams(searchParams);
  const { ids, dropped } = parseCompareIds(raw);
  const { vehicles, table, variantOptions, missing } = await loadComparison(ids);
  const ignored = [...dropped, ...missing];

  return (
    <div className="space-y-10">
      {ignored.length > 0 && (
        <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Some cars in the link couldn&apos;t be found and were skipped: {ignored.join(", ")}.
        </p>
      )}

      <CompareHeader columns={table.columns} variantOptions={variantOptions} />

      {vehicles.length < MIN_COMPARE ? (
        <EmptyState hasOne={vehicles.length === 1} />
      ) : (
        <>
          <section aria-labelledby="perf-chart" className="rounded-2xl border bg-card p-5">
            <h2 id="perf-chart" className="mb-4 text-sm font-semibold">
              Performance at a glance
            </h2>
            <PerformanceChart
              torqueUnit={units.torqueLabel()}
              data={vehicles.map((v) => ({
                name: v.model.name,
                powerHp: v.performance?.powerHp ?? 0,
                torque: units.toDisplayTorque(v.performance?.torqueNm ?? 0),
              }))}
            />
          </section>

          <section aria-labelledby="table-title" className="space-y-3">
            <h2 id="table-title" className="text-xl font-medium tracking-tight">
              Full comparison
            </h2>
            <CompareTable columns={table.columns} sections={table.sections} />
          </section>

          <section aria-labelledby="pros-cons" className="space-y-4">
            <h2 id="pros-cons" className="text-xl font-medium tracking-tight">
              Pros &amp; cons
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {vehicles.map((v) =>
                v.model.review ? <ProsCons key={v.slug} title={modelTitle(v)} pros={v.model.review.pros} cons={v.model.review.cons} /> : null,
              )}
            </div>
          </section>

          <p className="text-sm">
            <Link href={`/tools/tco?ids=${ids.join(",")}`} className="font-medium text-brand-content hover:underline">
              Model the cost of ownership for these cars with your own mileage and fuel prices →
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

function EmptyState({ hasOne }: { hasOne: boolean }) {
  return (
    <div className="space-y-8 rounded-2xl border border-dashed p-8 text-center">
      <div className="mx-auto max-w-md space-y-2">
        <h2 className="text-lg font-medium">{hasOne ? "Add one more car to compare" : "Choose cars to compare"}</h2>
        <p className="text-sm text-muted-foreground">Search above, or start from one of these popular matchups.</p>
      </div>
      {!hasOne && (
        <div className="mx-auto max-w-md">
          <CarSearch placeholder="Find a car to view" />
        </div>
      )}
      <ul className="flex flex-wrap justify-center gap-2">
        {POPULAR_COMPARISONS.map((c) => (
          <li key={c.title}>
            <Link href={compareHref(c.slugs)} className="inline-block rounded-full border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompareSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading comparison">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

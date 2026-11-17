import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";
import { BrowseFilters, CarSearch, loadBrowseSearchParams } from "@/modules/search";
import { ModelCard } from "@/modules/vehicles";
import { listModelSummaries } from "@/modules/vehicles/server";

export const metadata: Metadata = {
  title: "Browse cars",
  description: "Browse and filter cars by body type, powertrain and price, then compare them side by side.",
};

export default function BrowsePage({ searchParams }: PageProps<"/cars">) {
  return (
    <>
      <PageHeader eyebrow="Browse" title="Find your shortlist" description="Filter by body type, powertrain and budget. Open any model to see every trim and add it to your comparison.">
        <div className="max-w-md pt-3">
          <CarSearch />
        </div>
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/cars">["searchParams"] }) {
  await connection();
  const filters = await loadBrowseSearchParams(searchParams);
  const maxPrice = filters.maxPrice && filters.maxPrice > 0 && filters.maxPrice < 1_000_000 ? filters.maxPrice : null;
  const models = await listModelSummaries({ bodyType: filters.body, fuelType: filters.fuel, maxPrice });

  return (
    <div className="space-y-8">
      <BrowseFilters filters={{ ...filters, maxPrice }} />
      <p className="text-sm text-muted-foreground" role="status">
        {models.length} {models.length === 1 ? "model" : "models"}
      </p>
      {models.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <li key={m.slug}>
              <ModelCard model={m} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No cars match these filters.{" "}
          <Link href="/cars" className="font-medium text-brand-content hover:underline">
            Clear filters
          </Link>
        </p>
      )}
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";
import { loadCompareSearchParams, parseCompareIds, POPULAR_COMPARISONS } from "@/modules/comparison";
import { TcoCalculator, type CalculatorVehicle } from "@/modules/tools";
import { variantTitle } from "@/modules/vehicles";
import { getVariantsBySlugs } from "@/modules/vehicles/server";

export const metadata: Metadata = {
  title: "Cost of ownership calculator",
  description: "Estimate depreciation, fuel or charging, maintenance and insurance over the years you'll own a car.",
};

export default function TcoPage({ searchParams }: PageProps<"/tools/tco">) {
  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Cost of ownership calculator"
        description="The sticker price is only part of the story. Adjust mileage, fuel and electricity prices to see what each car really costs to own."
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Suspense fallback={<Skeleton className="h-[32rem] rounded-2xl" />}>
          <Calculator searchParams={searchParams} />
        </Suspense>
        <p className="mt-6 text-xs text-muted-foreground">
          Estimates use sample data: depreciation is interpolated from each car&apos;s estimated 5-year resale value; maintenance is
          based on service interval and average service cost; insurance is a national-average estimate.
        </p>
      </div>
    </>
  );
}

async function Calculator({ searchParams }: { searchParams: PageProps<"/tools/tco">["searchParams"] }) {
  await connection();
  const { ids: raw } = await loadCompareSearchParams(searchParams);
  const { ids } = parseCompareIds(raw.length > 0 ? raw : (POPULAR_COMPARISONS[2]?.slugs ?? []));
  const vehicles = await getVariantsBySlugs(ids);

  const data: CalculatorVehicle[] = vehicles.map((v) => ({
    slug: v.slug,
    title: variantTitle(v),
    shortTitle: `${v.model.name} ${v.name}`,
    price: v.price,
    fuelType: v.fuelType,
    performance: v.performance && {
      efficiencyKmpl: v.performance.efficiencyKmpl,
      consumptionKwh100km: v.performance.consumptionKwh100km,
    },
    ownershipCost: v.ownershipCost && {
      serviceIntervalKm: v.ownershipCost.serviceIntervalKm,
      serviceCost: v.ownershipCost.serviceCost,
      annualInsurance: v.ownershipCost.annualInsurance,
      resaleValuePct5y: v.ownershipCost.resaleValuePct5y,
    },
  }));

  return <TcoCalculator vehicles={data} />;
}

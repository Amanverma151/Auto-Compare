import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Star } from "lucide-react";
import { Eyebrow } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatEfficiency, formatDistance, formatNumber, formatPower, formatPrice } from "@/lib/format";
import { AddToCompareButton, buildComparisonTable, compareHref, CompareTable } from "@/modules/comparison";
import { ProsCons, ratingLabel } from "@/modules/reviews";
import {
  BODY_TYPE_LABELS,
  CarImage,
  FUEL_TYPE_LABELS,
  PhotoCredit,
  photoCredit,
  slugSchema,
  TRANSMISSION_LABELS,
  variantTitle,
} from "@/modules/vehicles";
import { getModelBySlug } from "@/modules/vehicles/server";

async function loadModel(params: PageProps<"/cars/[slug]">["params"]) {
  const { slug } = await params;
  const parsed = slugSchema.safeParse(slug);
  return parsed.success ? getModelBySlug(parsed.data) : null;
}

export async function generateMetadata({ params }: PageProps<"/cars/[slug]">): Promise<Metadata> {
  const model = await loadModel(params);
  if (!model) return { title: "Car not found" };
  const title = `${model.modelYear} ${model.make.name} ${model.name}`;
  return {
    title: `${title} — trims, specs, safety & running costs`,
    description: `${title}: ${model.summary} Compare ${model.variants.length} trims on performance, safety ratings and cost of ownership.`,
    openGraph: { title, ...(model.imageUrl ? { images: [{ url: model.imageUrl, alt: title }] } : {}) },
  };
}

export default function ModelPage({ params }: PageProps<"/cars/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ModelDetail params={params} />
    </Suspense>
  );
}

const TABS = [
  { value: "specs", label: "Specs & dimensions", sections: ["overview", "specifications"] },
  { value: "performance", label: "Performance", sections: ["performance"] },
  { value: "safety", label: "Safety", sections: ["safety"] },
  { value: "ownership", label: "Ownership cost", sections: ["ownership"] },
  { value: "features", label: "Features", sections: ["features-"] },
] as const;

async function ModelDetail({ params }: { params: PageProps<"/cars/[slug]">["params"] }) {
  await connection();
  const model = await loadModel(params);
  if (!model) notFound();

  const variants = model.variants;
  const table = buildComparisonTable(variants);
  const cheapest = variants[0];
  const title = `${model.make.name} ${model.name}`;
  const credit = photoCredit(model);

  return (
    <>
      <section className="bg-sky mx-2 mt-2 rounded-3xl px-4 pt-14 pb-12 sm:mx-3">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <Eyebrow href={`/cars?body=${model.bodyType}`}>{BODY_TYPE_LABELS[model.bodyType]}s</Eyebrow>
              <p className="text-sm text-foreground/70">
                {model.modelYear} · {model.segment}
              </p>
              <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
              <p className="max-w-xl text-sm leading-relaxed text-foreground/70">{model.summary}</p>
            </div>
            <dl className="grid w-fit grid-cols-2 gap-x-8 gap-y-3 rounded-2xl border border-border-surface bg-surface-secondary p-5 text-sm backdrop-blur sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">From</dt>
                <dd className="font-semibold">{cheapest ? formatPrice(cheapest.price) : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Trims</dt>
                <dd className="font-semibold">{variants.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Up to</dt>
                <dd className="font-semibold">{formatPower(Math.max(...variants.map((v) => v.performance?.powerHp ?? 0)))}</dd>
              </div>
              {model.review && (
                <div>
                  <dt className="text-xs text-muted-foreground">Our rating</dt>
                  <dd className="flex items-center gap-1 font-semibold">
                    <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                    {formatNumber(model.review.rating, 1)}/10
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <figure className="space-y-2">
            <CarImage
              src={model.imageUrl}
              alt={`${model.make.name} ${model.name}`}
              sizes="(min-width: 1024px) 640px, 100vw"
              priority
              className="rounded-2xl border border-border-surface-strong shadow-2xl shadow-sky-900/15"
            />
            {credit && (
              <figcaption>
                <PhotoCredit credit={credit} className="text-[11px] text-foreground/60" />
              </figcaption>
            )}
          </figure>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12">
        <section aria-labelledby="trims" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="trims" className="text-xl font-medium tracking-tight">
              Trims &amp; configurations
            </h2>
            {variants.length > 1 && (
              <Link href={compareHref(variants.slice(0, 4).map((v) => v.slug))} className="text-sm font-medium text-brand-content hover:underline">
                Compare all trims →
              </Link>
            )}
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {variants.map((v) => (
              <li key={v.slug} className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{v.name}</h3>
                    <p className="text-lg font-semibold tracking-tight">{formatPrice(v.price)}</p>
                  </div>
                  <AddToCompareButton slug={v.slug} title={variantTitle(v)} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{FUEL_TYPE_LABELS[v.fuelType]}</Badge>
                  <Badge variant="outline">{TRANSMISSION_LABELS[v.transmission]}</Badge>
                  <Badge variant="outline">{v.drivetrain}</Badge>
                  <Badge variant="outline">{v.seats} seats</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {v.performance?.engine} · {formatPower(v.performance?.powerHp ?? 0)} ·{" "}
                  {v.performance?.rangeKm
                    ? `${formatDistance(v.performance.rangeKm)} range`
                    : v.performance?.efficiencyKmpl
                      ? formatEfficiency(v.performance.efficiencyKmpl)
                      : null}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="details" className="space-y-4">
          <h2 id="details" className="text-xl font-medium tracking-tight">
            Details by trim
          </h2>
          <Tabs defaultValue="specs">
            <TabsList className="h-auto flex-wrap">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((t) => (
              <TabsContent key={t.value} value={t.value} className="pt-4">
                <CompareTable
                  columns={table.columns}
                  sections={table.sections.filter((s) => t.sections.some((p) => s.id.startsWith(p)))}
                  allowDiffToggle={variants.length > 1}
                  caption={`${title} — ${t.label}`}
                />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {model.review && (
          <section aria-labelledby="verdict" className="space-y-4">
            <div className="space-y-1">
              <h2 id="verdict" className="text-xl font-medium tracking-tight">
                Expert verdict · {formatNumber(model.review.rating, 1)}/10 ({ratingLabel(model.review.rating)})
              </h2>
              <p className="text-sm text-muted-foreground">{model.review.verdict}</p>
            </div>
            <ProsCons pros={model.review.pros} cons={model.review.cons} />
          </section>
        )}
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading car details">
      <Skeleton className="mx-2 mt-2 h-64 rounded-3xl sm:mx-3" />
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-60" />
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

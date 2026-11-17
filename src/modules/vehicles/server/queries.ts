import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { variantFullInclude, type ModelSummary, type VariantOption, type VehicleVariant } from "../types";
import { photoCredit } from "../utils";

export const VEHICLES_TAG = "vehicles";

/** Variants with every relation, returned in the order of `slugs`. Unknown slugs are dropped. */
export async function getVariantsBySlugs(slugs: string[]): Promise<VehicleVariant[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);
  if (slugs.length === 0) return [];
  const rows = await db.variant.findMany({ where: { slug: { in: slugs } }, include: variantFullInclude });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return slugs.flatMap((s) => bySlug.get(s) ?? []);
}

export async function getModelBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);
  return db.model.findUnique({
    where: { slug },
    include: {
      make: true,
      review: true,
      variants: { include: variantFullInclude, orderBy: { price: "asc" } },
    },
  });
}

/** Sibling variants for each given model id, used by the compare page's variant pickers. */
export async function getVariantOptionsByModel(modelIds: string[]): Promise<Record<string, VariantOption[]>> {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);
  const rows = await db.variant.findMany({
    where: { modelId: { in: modelIds } },
    select: { slug: true, name: true, price: true, modelId: true },
    orderBy: { price: "asc" },
  });
  const out: Record<string, VariantOption[]> = {};
  for (const { modelId, ...opt } of rows) (out[modelId] ??= []).push(opt);
  return out;
}

/** Every model that has a photo, with its attribution (for the credits page). */
export async function listPhotoCredits() {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);
  const models = await db.model.findMany({
    where: { imageUrl: { not: null } },
    include: { make: true },
    orderBy: [{ make: { name: "asc" } }, { name: "asc" }],
  });
  return models.map((m) => ({ slug: m.slug, title: `${m.make.name} ${m.name}`, imageUrl: m.imageUrl, credit: photoCredit(m) }));
}

export interface ModelFilter {
  bodyType?: ModelSummary["bodyType"] | null;
  fuelType?: ModelSummary["fuelTypes"][number] | null;
  maxPrice?: number | null;
  popularOnly?: boolean;
}

export async function listModelSummaries(filter: ModelFilter = {}): Promise<ModelSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);
  const models = await db.model.findMany({
    where: {
      ...(filter.popularOnly ? { isPopular: true } : {}),
      ...(filter.bodyType ? { bodyType: filter.bodyType } : {}),
      variants: {
        some: {
          ...(filter.fuelType ? { fuelType: filter.fuelType } : {}),
          ...(filter.maxPrice ? { price: { lte: filter.maxPrice } } : {}),
        },
      },
    },
    include: { make: true, review: true, variants: { select: { price: true, fuelType: true } } },
    orderBy: [{ make: { name: "asc" } }, { name: "asc" }],
  });
  return models.map((m) => ({
    slug: m.slug,
    name: m.name,
    makeName: m.make.name,
    imageUrl: m.imageUrl,
    bodyType: m.bodyType,
    segment: m.segment,
    modelYear: m.modelYear,
    summary: m.summary,
    startingPrice: Math.min(...m.variants.map((v) => v.price)),
    fuelTypes: [...new Set(m.variants.map((v) => v.fuelType))],
    rating: m.review?.rating ?? null,
  }));
}

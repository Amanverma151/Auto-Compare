/**
 * Seeds the SAMPLE dataset from prisma/seed-data/vehicles.json.
 * Idempotent: upserts by slug and replaces each variant's features.
 * Run with `pnpm db:seed`. Never run automatically in production.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { FEATURE_CATALOG, isFeatureCode } from "../src/modules/specifications/feature-catalog";
import { seedFileSchema } from "../src/modules/vehicles/schemas";

// Same precedence as prisma.config.ts.
const url = process.env.DIRECT_DATABASE_URL || process.env.NETLIFY_DB_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  const raw: unknown = JSON.parse(readFileSync(join(import.meta.dirname, "seed-data", "vehicles.json"), "utf8"));
  const data = seedFileSchema.parse(raw);

  const makeIds = new Map<string, string>();
  for (const make of data.makes) {
    const row = await db.make.upsert({ where: { slug: make.slug }, create: make, update: make });
    makeIds.set(make.slug, row.id);
  }

  let variantCount = 0;
  for (const m of data.models) {
    const makeId = makeIds.get(m.make);
    if (!makeId) throw new Error(`Model ${m.slug} references unknown make ${m.make}`);

    const modelData = {
      name: m.name,
      bodyType: m.bodyType,
      modelYear: m.modelYear,
      segment: m.segment,
      summary: m.summary,
      isPopular: m.isPopular,
      makeId,
      imageUrl: m.image?.url ?? null,
      imageAuthor: m.image?.author ?? null,
      imageLicense: m.image?.license ?? null,
      imageLicenseUrl: m.image?.licenseUrl ?? null,
      imageSourceUrl: m.image?.sourceUrl ?? null,
    };
    const model = await db.model.upsert({ where: { slug: m.slug }, create: { slug: m.slug, ...modelData }, update: modelData });
    await db.review.upsert({ where: { modelId: model.id }, create: { modelId: model.id, ...m.review }, update: m.review });

    for (const v of m.variants) {
      const unknown = v.features.filter((f) => !isFeatureCode(f));
      if (unknown.length) throw new Error(`Variant ${v.slug} has unknown features: ${unknown.join(", ")}`);

      const variantData = {
        name: v.name,
        price: v.price,
        fuelType: v.fuelType,
        transmission: v.transmission,
        drivetrain: v.drivetrain,
        seats: v.seats,
        modelId: model.id,
      };
      const variant = await db.variant.upsert({ where: { slug: v.slug }, create: { slug: v.slug, ...variantData }, update: variantData });
      const variantId = variant.id;

      const spec = { ...m.defaults.spec, ...v.spec };
      const safety = { ...m.defaults.safety, ...v.safety };
      const cost = { ...m.defaults.cost, ...v.cost };

      await db.specification.upsert({ where: { variantId }, create: { variantId, ...spec }, update: spec });
      await db.performance.upsert({ where: { variantId }, create: { variantId, ...v.perf }, update: v.perf });
      await db.safetyRating.upsert({ where: { variantId }, create: { variantId, ...safety }, update: safety });
      await db.ownershipCost.upsert({ where: { variantId }, create: { variantId, ...cost }, update: cost });

      await db.feature.deleteMany({ where: { variantId } });
      await db.feature.createMany({
        data: v.features.filter(isFeatureCode).map((code) => ({ variantId, ...FEATURE_CATALOG[code] })),
      });
      variantCount++;
    }
  }

  console.log(`Seeded ${data.makes.length} makes, ${data.models.length} models, ${variantCount} variants (sample data).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

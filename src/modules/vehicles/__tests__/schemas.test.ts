import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isFeatureCode } from "@/modules/specifications";
import { seedFileSchema, slugSchema } from "../schemas";

describe("slugSchema", () => {
  it.each(["toyota-rav4", "f-150", "model-3"])("accepts %s", (s) => expect(slugSchema.safeParse(s).success).toBe(true));
  it.each(["", "-bad", "bad-", "with space", "a/b", "x".repeat(81)])("rejects %j", (s) =>
    expect(slugSchema.safeParse(s).success).toBe(false),
  );
});

describe("sample seed data", () => {
  const raw: unknown = JSON.parse(readFileSync(join(process.cwd(), "prisma/seed-data/vehicles.json"), "utf8"));
  const data = seedFileSchema.parse(raw);

  it("validates against the seed schema", () => {
    expect(data.models.length).toBeGreaterThan(0);
  });

  it("uses unique variant slugs and known makes and features", () => {
    const makes = new Set(data.makes.map((m) => m.slug));
    const slugs = data.models.flatMap((m) => m.variants.map((v) => v.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const m of data.models) {
      expect(makes.has(m.make)).toBe(true);
      for (const v of m.variants) expect(v.features.filter((f) => !isFeatureCode(f))).toEqual([]);
    }
  });

  it("gives every EV a range and every combustion car a fuel economy", () => {
    for (const v of data.models.flatMap((m) => m.variants)) {
      if (v.fuelType === "ELECTRIC") expect(v.perf.rangeKm && v.perf.consumptionKwh100km).toBeTruthy();
      else expect(v.perf.efficiencyKmpl).toBeTruthy();
    }
  });
});

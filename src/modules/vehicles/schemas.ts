import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");

export const bodyTypeSchema = z.enum(["HATCHBACK", "SEDAN", "SUV", "PICKUP"]);
export const fuelTypeSchema = z.enum(["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"]);
export const transmissionSchema = z.enum(["MANUAL", "AUTOMATIC", "CVT", "DCT", "SINGLE_SPEED"]);

// ---- Seed file shape (prisma/seed-data/vehicles.json) ----

const specSchema = z.object({
  lengthMm: z.int().positive(),
  widthMm: z.int().positive(),
  heightMm: z.int().positive(),
  wheelbaseMm: z.int().positive(),
  groundClearanceMm: z.int().positive().nullish(),
  cargoL: z.int().nonnegative(),
  fuelTankL: z.int().positive().nullish(),
  batteryKwh: z.number().positive().nullish(),
  curbWeightKg: z.int().positive(),
});

const perfSchema = z.object({
  engine: z.string().min(1),
  displacementCc: z.int().positive().nullish(),
  powerHp: z.int().positive(),
  torqueNm: z.int().positive(),
  zeroToHundredS: z.number().positive().nullish(),
  topSpeedKmh: z.int().positive().nullish(),
  efficiencyKmpl: z.number().positive().nullish(),
  rangeKm: z.int().positive().nullish(),
  consumptionKwh100km: z.number().positive().nullish(),
});

const stars = z.int().min(1).max(5).nullable();
const safetySchema = z.object({
  agency: z.string().min(1),
  overallStars: stars,
  frontalStars: stars,
  sideStars: stars,
  rolloverStars: stars,
  airbags: z.int().nonnegative(),
  automaticEmergencyBrake: z.boolean(),
  laneKeepAssist: z.boolean(),
  blindSpotMonitor: z.boolean(),
  adaptiveCruise: z.boolean(),
});

const costSchema = z.object({
  serviceIntervalKm: z.int().positive(),
  serviceCost: z.int().nonnegative(),
  annualInsurance: z.int().nonnegative(),
  warrantyYears: z.int().positive(),
  warrantyKm: z.int().positive(),
  resaleValuePct5y: z.int().min(0).max(100),
});

const seedVariantSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  price: z.int().positive(),
  fuelType: fuelTypeSchema,
  transmission: transmissionSchema,
  drivetrain: z.string().min(1),
  seats: z.int().min(1).max(9),
  perf: perfSchema,
  spec: specSchema.partial().optional(),
  safety: safetySchema.partial().optional(),
  cost: costSchema.partial().optional(),
  features: z.array(z.string()),
});

const seedModelSchema = z.object({
  slug: slugSchema,
  make: slugSchema,
  name: z.string().min(1),
  bodyType: bodyTypeSchema,
  modelYear: z.int().min(1990).max(2100),
  segment: z.string().min(1),
  isPopular: z.boolean(),
  summary: z.string().min(1),
  image: z
    .object({
      url: z.string().regex(/^\/images\/cars\/[a-z0-9-]+\.(jpg|png|webp)$/, "Images must be self-hosted under /images/cars"),
      author: z.string().min(1),
      license: z.string().min(1),
      licenseUrl: z.url().nullable(),
      sourceUrl: z.url(),
    })
    .optional(),
  review: z.object({
    rating: z.number().min(0).max(10),
    verdict: z.string().min(1),
    pros: z.array(z.string()).min(1),
    cons: z.array(z.string()).min(1),
  }),
  defaults: z.object({ spec: specSchema, safety: safetySchema, cost: costSchema }),
  variants: z.array(seedVariantSchema).min(1),
});

export const seedFileSchema = z.object({
  makes: z.array(z.object({ slug: slugSchema, name: z.string().min(1), country: z.string().min(1) })),
  models: z.array(seedModelSchema),
});

export type SeedFile = z.infer<typeof seedFileSchema>;

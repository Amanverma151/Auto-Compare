import type { Prisma } from "@/generated/prisma/client";

/** Everything needed to show or compare one variant. */
export const variantFullInclude = {
  model: { include: { make: true, review: true } },
  specification: true,
  performance: true,
  safetyRating: true,
  ownershipCost: true,
  features: { orderBy: { name: "asc" } },
} satisfies Prisma.VariantInclude;

export type VehicleVariant = Prisma.VariantGetPayload<{ include: typeof variantFullInclude }>;

export type BodyType = VehicleVariant["model"]["bodyType"];
export type FuelType = VehicleVariant["fuelType"];
export type Transmission = VehicleVariant["transmission"];

export interface PhotoCreditInfo {
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
}

export interface ModelSummary {
  slug: string;
  name: string;
  makeName: string;
  imageUrl: string | null;
  bodyType: BodyType;
  segment: string;
  modelYear: number;
  summary: string;
  startingPrice: number;
  fuelTypes: FuelType[];
  rating: number | null;
}

export interface VariantOption {
  slug: string;
  name: string;
  price: number;
}

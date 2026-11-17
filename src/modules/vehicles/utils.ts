import type { BodyType, FuelType, PhotoCreditInfo, Transmission } from "./types";

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  HATCHBACK: "Hatchback",
  SEDAN: "Sedan",
  SUV: "SUV",
  PICKUP: "Pickup",
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  GASOLINE: "Gasoline",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  PLUGIN_HYBRID: "Plug-in hybrid",
  ELECTRIC: "Electric",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automatic",
  CVT: "CVT",
  DCT: "Dual-clutch",
  SINGLE_SPEED: "Single-speed",
};

type Titled = { name: string; model: { name: string; modelYear: number; make: { name: string } } };

/** "Toyota Corolla" */
export function modelTitle(v: Pick<Titled, "model">): string {
  return `${v.model.make.name} ${v.model.name}`;
}

/** "2025 Toyota Corolla XSE" */
export function variantTitle(v: Titled): string {
  return `${v.model.modelYear} ${modelTitle(v)} ${v.name}`;
}

export const isElectric = (fuel: FuelType) => fuel === "ELECTRIC";

/** Photo attribution for a model, or null if it has no (fully credited) photo. */
export function photoCredit(m: {
  imageUrl: string | null;
  imageAuthor: string | null;
  imageLicense: string | null;
  imageLicenseUrl: string | null;
  imageSourceUrl: string | null;
}): PhotoCreditInfo | null {
  if (!m.imageUrl || !m.imageAuthor || !m.imageLicense || !m.imageSourceUrl) return null;
  return { author: m.imageAuthor, license: m.imageLicense, licenseUrl: m.imageLicenseUrl, sourceUrl: m.imageSourceUrl };
}

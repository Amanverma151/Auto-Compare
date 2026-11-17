/**
 * Canonical equipment list. Seed files reference features by code; the database
 * stores the display name and category. Kept dependency-free so prisma/seed.ts
 * can import it directly.
 */
export type FeatureCategory = "INFOTAINMENT" | "COMFORT" | "CONVENIENCE" | "EXTERIOR";

export const FEATURE_CATEGORY_LABELS: Record<FeatureCategory, string> = {
  INFOTAINMENT: "Infotainment",
  COMFORT: "Comfort",
  CONVENIENCE: "Convenience",
  EXTERIOR: "Exterior",
};

export const FEATURE_CATALOG = {
  carplay: { name: "Apple CarPlay / Android Auto", category: "INFOTAINMENT" },
  wirelessMirroring: { name: "Wireless phone mirroring", category: "INFOTAINMENT" },
  largeScreen: { name: "Large touchscreen (12 in+)", category: "INFOTAINMENT" },
  premiumAudio: { name: "Premium audio", category: "INFOTAINMENT" },
  navigation: { name: "Built-in navigation", category: "INFOTAINMENT" },
  heatedSeats: { name: "Heated front seats", category: "COMFORT" },
  ventilatedSeats: { name: "Ventilated front seats", category: "COMFORT" },
  heatedWheel: { name: "Heated steering wheel", category: "COMFORT" },
  dualZone: { name: "Dual-zone climate control", category: "COMFORT" },
  powerSeat: { name: "Power driver seat", category: "COMFORT" },
  leather: { name: "Leather / leatherette seats", category: "COMFORT" },
  keyless: { name: "Keyless entry & push-button start", category: "CONVENIENCE" },
  wirelessCharging: { name: "Wireless phone charging", category: "CONVENIENCE" },
  powerLiftgate: { name: "Power liftgate", category: "CONVENIENCE" },
  remoteStart: { name: "Remote start", category: "CONVENIENCE" },
  headUpDisplay: { name: "Head-up display", category: "CONVENIENCE" },
  surroundCamera: { name: "360° camera", category: "CONVENIENCE" },
  ledHeadlights: { name: "LED headlights", category: "EXTERIOR" },
  wheels18: { name: "18 in+ alloy wheels", category: "EXTERIOR" },
  sunroof: { name: "Sunroof / panoramic roof", category: "EXTERIOR" },
  roofRails: { name: "Roof rails", category: "EXTERIOR" },
} as const satisfies Record<string, { name: string; category: FeatureCategory }>;

export type FeatureCode = keyof typeof FEATURE_CATALOG;

export const isFeatureCode = (code: string): code is FeatureCode => code in FEATURE_CATALOG;

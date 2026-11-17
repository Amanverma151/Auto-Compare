import type { CompareRow } from "@/lib/compare-row";
import { formatBattery, formatFuelTank, formatLength, formatVolume, formatWeight } from "@/lib/format";
import type { VehicleVariant } from "@/modules/vehicles";
import { FEATURE_CATALOG, FEATURE_CATEGORY_LABELS, type FeatureCategory } from "./feature-catalog";

const num = (fmt: (n: number) => string) => (x: string | number | boolean) => fmt(Number(x));

export const specificationRows: CompareRow<VehicleVariant>[] = [
  { key: "length", label: "Length", value: (v) => v.specification?.lengthMm ?? null, format: num(formatLength), direction: "none" },
  { key: "width", label: "Width", value: (v) => v.specification?.widthMm ?? null, format: num(formatLength), direction: "none" },
  { key: "height", label: "Height", value: (v) => v.specification?.heightMm ?? null, format: num(formatLength), direction: "none" },
  { key: "wheelbase", label: "Wheelbase", value: (v) => v.specification?.wheelbaseMm ?? null, format: num(formatLength), direction: "higher" },
  { key: "groundClearance", label: "Ground clearance", value: (v) => v.specification?.groundClearanceMm ?? null, format: num(formatLength), direction: "higher" },
  { key: "cargo", label: "Cargo space", value: (v) => v.specification?.cargoL ?? null, format: num(formatVolume), direction: "higher" },
  { key: "fuelTank", label: "Fuel tank", value: (v) => v.specification?.fuelTankL ?? null, format: num(formatFuelTank), direction: "none" },
  { key: "battery", label: "Battery capacity", value: (v) => v.specification?.batteryKwh ?? null, format: num(formatBattery), direction: "higher" },
  { key: "curbWeight", label: "Curb weight", value: (v) => v.specification?.curbWeightKg ?? null, format: num(formatWeight), direction: "none" },
];

/** One boolean row per catalogued feature, grouped by category. */
export function featureRowGroups(): { category: FeatureCategory; title: string; rows: CompareRow<VehicleVariant>[] }[] {
  const categories = Object.keys(FEATURE_CATEGORY_LABELS) as FeatureCategory[];
  return categories.map((category) => ({
    category,
    title: FEATURE_CATEGORY_LABELS[category],
    rows: Object.entries(FEATURE_CATALOG)
      .filter(([, f]) => f.category === category)
      .map(([code, f]) => ({
        key: `feature:${code}`,
        label: f.name,
        value: (v: VehicleVariant) => v.features.some((x) => x.name === f.name),
        direction: "none" as const,
      })),
  }));
}

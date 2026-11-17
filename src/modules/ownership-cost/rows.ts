import type { CompareRow } from "@/lib/compare-row";
import { formatDistance, formatPercent, formatPrice, formatYears } from "@/lib/format";
import type { VehicleVariant } from "@/modules/vehicles";
import { annualEnergyCost, calculateTco, DEFAULT_TCO_INPUTS } from "./utils";

const num = (fmt: (n: number) => string) => (x: string | number | boolean) => fmt(Number(x));
const price = num(formatPrice);

export const ownershipRows: CompareRow<VehicleVariant>[] = [
  { key: "tco5y", label: "Est. 5-year cost of ownership", value: (v) => calculateTco(v)?.total ?? null, format: price, direction: "lower" },
  { key: "energyYear", label: "Est. annual fuel / energy cost", value: (v) => { const c = annualEnergyCost(v, DEFAULT_TCO_INPUTS); return c === null ? null : Math.round(c); }, format: price, direction: "lower" },
  { key: "serviceInterval", label: "Service interval", value: (v) => v.ownershipCost?.serviceIntervalKm ?? null, format: num(formatDistance), direction: "higher" },
  { key: "serviceCost", label: "Avg. cost per service", value: (v) => v.ownershipCost?.serviceCost ?? null, format: price, direction: "lower" },
  { key: "insurance", label: "Est. annual insurance", value: (v) => v.ownershipCost?.annualInsurance ?? null, format: price, direction: "lower" },
  { key: "warrantyYears", label: "Basic warranty", value: (v) => v.ownershipCost?.warrantyYears ?? null, format: num(formatYears), direction: "higher" },
  { key: "warrantyDistance", label: "Warranty distance", value: (v) => v.ownershipCost?.warrantyKm ?? null, format: num(formatDistance), direction: "higher" },
  { key: "resale", label: "Est. value retained after 5 years", value: (v) => v.ownershipCost?.resaleValuePct5y ?? null, format: num(formatPercent), direction: "higher" },
];

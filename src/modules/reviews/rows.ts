import type { CompareRow } from "@/lib/compare-row";
import { formatNumber } from "@/lib/format";
import type { VehicleVariant } from "@/modules/vehicles";

export const reviewRows: CompareRow<VehicleVariant>[] = [
  { key: "rating", label: "Editorial rating", value: (v) => v.model.review?.rating ?? null, format: (x) => `${formatNumber(Number(x), 1)} / 10`, direction: "higher" },
  { key: "verdict", label: "Verdict", value: (v) => v.model.review?.verdict ?? null, direction: "none" },
];

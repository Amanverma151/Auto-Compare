import type { CompareRow } from "@/lib/compare-row";
import { formatBoolean } from "@/lib/format";
import type { VehicleVariant } from "@/modules/vehicles";
import { formatStars } from "./utils";

const stars = (x: string | number | boolean) => formatStars(Number(x));
const yesNo = (x: string | number | boolean) => formatBoolean(Boolean(x));

export const safetyRows: CompareRow<VehicleVariant>[] = [
  { key: "agency", label: "Rating agency", value: (v) => v.safetyRating?.agency ?? null, direction: "none" },
  { key: "overallStars", label: "Overall rating", value: (v) => v.safetyRating?.overallStars ?? null, format: stars, direction: "higher" },
  { key: "frontalStars", label: "Frontal crash", value: (v) => v.safetyRating?.frontalStars ?? null, format: stars, direction: "higher" },
  { key: "sideStars", label: "Side crash", value: (v) => v.safetyRating?.sideStars ?? null, format: stars, direction: "higher" },
  { key: "rolloverStars", label: "Rollover", value: (v) => v.safetyRating?.rolloverStars ?? null, format: stars, direction: "higher" },
  { key: "airbags", label: "Airbags", value: (v) => v.safetyRating?.airbags ?? null, direction: "higher" },
  { key: "aeb", label: "Automatic emergency braking", value: (v) => v.safetyRating?.automaticEmergencyBrake ?? null, format: yesNo, direction: "none" },
  { key: "lka", label: "Lane-keeping assist", value: (v) => v.safetyRating?.laneKeepAssist ?? null, format: yesNo, direction: "none" },
  { key: "bsm", label: "Blind-spot monitoring", value: (v) => v.safetyRating?.blindSpotMonitor ?? null, format: yesNo, direction: "none" },
  { key: "acc", label: "Adaptive cruise control", value: (v) => v.safetyRating?.adaptiveCruise ?? null, format: yesNo, direction: "none" },
];

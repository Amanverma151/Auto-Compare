import type { CompareRow } from "@/lib/compare-row";
import {
  accelerationLabel,
  formatConsumption,
  formatDistance,
  formatDuration,
  formatEfficiency,
  formatNumber,
  formatPower,
  formatSpeed,
  formatTorque,
} from "@/lib/format";
import type { VehicleVariant } from "@/modules/vehicles";
import { powerToWeight } from "./utils";

const num = (fmt: (n: number) => string) => (x: string | number | boolean) => fmt(Number(x));

export const performanceRows: CompareRow<VehicleVariant>[] = [
  { key: "engine", label: "Engine / motor", value: (v) => v.performance?.engine ?? null, direction: "none" },
  { key: "displacement", label: "Displacement", value: (v) => v.performance?.displacementCc ?? null, format: (x) => `${formatNumber(Number(x))} cc`, direction: "none" },
  { key: "power", label: "Horsepower", value: (v) => v.performance?.powerHp ?? null, format: num(formatPower), direction: "higher" },
  { key: "torque", label: "Torque", value: (v) => v.performance?.torqueNm ?? null, format: num(formatTorque), direction: "higher" },
  { key: "powerToWeight", label: "Power-to-weight", value: powerToWeight, format: (x) => `${formatNumber(Number(x))} hp/tonne`, direction: "higher" },
  { key: "acceleration", label: accelerationLabel(), value: (v) => v.performance?.zeroToHundredS ?? null, format: num(formatDuration), direction: "lower" },
  { key: "topSpeed", label: "Top speed", value: (v) => v.performance?.topSpeedKmh ?? null, format: num(formatSpeed), direction: "higher" },
  { key: "efficiency", label: "Fuel economy (combined)", value: (v) => v.performance?.efficiencyKmpl ?? null, format: num(formatEfficiency), direction: "higher" },
  { key: "range", label: "Electric range", value: (v) => v.performance?.rangeKm ?? null, format: num(formatDistance), direction: "higher" },
  { key: "consumption", label: "Energy consumption", value: (v) => v.performance?.consumptionKwh100km ?? null, format: num(formatConsumption), direction: "lower" },
];

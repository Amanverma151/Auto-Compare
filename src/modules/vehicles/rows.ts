import type { CompareRow } from "@/lib/compare-row";
import { formatPrice } from "@/lib/format";
import type { VehicleVariant } from "./types";
import { BODY_TYPE_LABELS, FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "./utils";

export const overviewRows: CompareRow<VehicleVariant>[] = [
  { key: "price", label: "Starting MSRP", value: (v) => v.price, format: (x) => formatPrice(Number(x)), direction: "lower" },
  { key: "bodyType", label: "Body type", value: (v) => BODY_TYPE_LABELS[v.model.bodyType], direction: "none" },
  { key: "segment", label: "Segment", value: (v) => v.model.segment, direction: "none" },
  { key: "fuelType", label: "Fuel type", value: (v) => FUEL_TYPE_LABELS[v.fuelType], direction: "none" },
  { key: "transmission", label: "Transmission", value: (v) => TRANSMISSION_LABELS[v.transmission], direction: "none" },
  { key: "drivetrain", label: "Drivetrain", value: (v) => v.drivetrain, direction: "none" },
  { key: "seats", label: "Seats", value: (v) => v.seats, direction: "higher" },
  { key: "modelYear", label: "Model year", value: (v) => v.model.modelYear, direction: "none" },
];

/**
 * All user-visible numbers are formatted here. Values are stored in metric base
 * units (see prisma/schema.prisma) and converted for display based on UNIT_SYSTEM.
 */
export type UnitSystem = "imperial" | "metric";

export const UNIT_SYSTEM: UnitSystem = "imperial";
export const LOCALE = "en-US";
export const CURRENCY = "USD";

const KM_PER_MILE = 1.609344;
const LITERS_PER_GALLON = 3.785411784;

const number = (v: number, digits = 0) =>
  new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(v);

const imperial = () => UNIT_SYSTEM === "imperial";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number, digits = 0): string {
  return number(value, digits);
}

export function formatPercent(value: number): string {
  return `${number(value)}%`;
}

export function formatPower(hp: number): string {
  return `${number(hp)} hp`;
}

export function formatTorque(nm: number): string {
  return imperial() ? `${number(nm * 0.737562)} lb-ft` : `${number(nm)} Nm`;
}

/** Fuel economy from km/l. */
export function formatEfficiency(kmpl: number): string {
  return imperial() ? `${number(kmpl * (LITERS_PER_GALLON / KM_PER_MILE))} mpg` : `${number(kmpl, 1)} km/l`;
}

/** EV energy consumption from kWh/100km. */
export function formatConsumption(kwhPer100km: number): string {
  return imperial()
    ? `${number(kwhPer100km * KM_PER_MILE, 1)} kWh/100 mi`
    : `${number(kwhPer100km, 1)} kWh/100 km`;
}

export function formatDistance(km: number): string {
  return imperial() ? `${number(km / KM_PER_MILE)} mi` : `${number(km)} km`;
}

export function formatSpeed(kmh: number): string {
  return imperial() ? `${number(kmh / KM_PER_MILE)} mph` : `${number(kmh)} km/h`;
}

export function formatDuration(seconds: number): string {
  return `${number(seconds, 1)} s`;
}

/** Label for the standard acceleration benchmark (0–100 km/h ≈ 0–62 mph). */
export const accelerationLabel = () => (imperial() ? "0–60 mph" : "0–100 km/h");

export function formatLength(mm: number): string {
  return imperial() ? `${number(mm / 25.4, 1)} in` : `${number(mm)} mm`;
}

export function formatVolume(liters: number): string {
  return imperial() ? `${number(liters * 0.0353147, 1)} cu ft` : `${number(liters)} L`;
}

export function formatFuelTank(liters: number): string {
  return imperial() ? `${number(liters / LITERS_PER_GALLON, 1)} gal` : `${number(liters)} L`;
}

export function formatWeight(kg: number): string {
  return imperial() ? `${number(kg * 2.20462)} lb` : `${number(kg)} kg`;
}

export function formatBattery(kwh: number): string {
  return `${number(kwh, 1)} kWh`;
}

export function formatYears(years: number): string {
  return `${number(years)} ${years === 1 ? "year" : "years"}`;
}

export function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

/** Unit conversions used by input controls (e.g. the TCO calculator). */
export const units = {
  KM_PER_MILE,
  LITERS_PER_GALLON,
  distanceLabel: () => (imperial() ? "miles" : "km"),
  fuelPriceLabel: () => (imperial() ? "$/gal" : "$/L"),
  torqueLabel: () => (imperial() ? "lb-ft" : "Nm"),
  /** Torque in the display unit, as a rounded number (for charts). */
  toDisplayTorque: (nm: number) => Math.round(imperial() ? nm * 0.737562 : nm),
  toKm: (distance: number) => (imperial() ? distance * KM_PER_MILE : distance),
  toPricePerLiter: (price: number) => (imperial() ? price / LITERS_PER_GALLON : price),
};

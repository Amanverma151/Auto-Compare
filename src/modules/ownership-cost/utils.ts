/**
 * Total cost of ownership (TCO). Pure functions only; see CLAUDE.md §5.
 *
 *   TCO = depreciation + (energy + maintenance + insurance) × years
 *   depreciation = price × (1 − retained value at `years`)
 *
 * Retained value is interpolated linearly from 100% at year 0 through the
 * vehicle's 5-year resale percentage, and floored at 10%.
 */

export interface TcoInputs {
  years: number;
  distancePerYearKm: number;
  fuelPricePerLiter: number;
  electricityPricePerKwh: number;
}

export interface TcoVehicle {
  price: number;
  fuelType: string;
  performance: { efficiencyKmpl: number | null; consumptionKwh100km: number | null } | null;
  ownershipCost: {
    serviceIntervalKm: number;
    serviceCost: number;
    annualInsurance: number;
    resaleValuePct5y: number;
  } | null;
}

export interface TcoBreakdown {
  depreciation: number;
  energy: number;
  maintenance: number;
  insurance: number;
  total: number;
  perYear: number;
  retainedValue: number;
}

/** US defaults: 12,000 mi/year, $3.50/gal, $0.16/kWh, 5 years. */
export const DEFAULT_TCO_INPUTS: TcoInputs = {
  years: 5,
  distancePerYearKm: 19_312,
  fuelPricePerLiter: 3.5 / 3.785411784,
  electricityPricePerKwh: 0.16,
};

const MIN_RETAINED = 0.1;

export function retainedValueFraction(resalePct5y: number, years: number): number {
  const lossAt5 = 1 - resalePct5y / 100;
  return Math.max(MIN_RETAINED, 1 - lossAt5 * (years / 5));
}

/** Annual energy (fuel or electricity) cost, or null if efficiency data is missing. */
export function annualEnergyCost(v: TcoVehicle, inputs: TcoInputs): number | null {
  const p = v.performance;
  if (!p) return null;
  if (v.fuelType === "ELECTRIC") {
    if (!p.consumptionKwh100km) return null;
    return (inputs.distancePerYearKm / 100) * p.consumptionKwh100km * inputs.electricityPricePerKwh;
  }
  if (!p.efficiencyKmpl) return null;
  return (inputs.distancePerYearKm / p.efficiencyKmpl) * inputs.fuelPricePerLiter;
}

export function calculateTco(v: TcoVehicle, inputs: TcoInputs = DEFAULT_TCO_INPUTS): TcoBreakdown | null {
  const c = v.ownershipCost;
  const energyPerYear = annualEnergyCost(v, inputs);
  if (!c || energyPerYear === null || inputs.years <= 0) return null;

  const retained = retainedValueFraction(c.resaleValuePct5y, inputs.years);
  const depreciation = v.price * (1 - retained);
  const energy = energyPerYear * inputs.years;
  const maintenance = (inputs.distancePerYearKm / c.serviceIntervalKm) * c.serviceCost * inputs.years;
  const insurance = c.annualInsurance * inputs.years;
  const total = depreciation + energy + maintenance + insurance;

  return {
    depreciation: Math.round(depreciation),
    energy: Math.round(energy),
    maintenance: Math.round(maintenance),
    insurance: Math.round(insurance),
    total: Math.round(total),
    perYear: Math.round(total / inputs.years),
    retainedValue: Math.round(v.price * retained),
  };
}

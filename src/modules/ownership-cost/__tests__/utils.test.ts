import { describe, expect, it } from "vitest";
import { annualEnergyCost, calculateTco, retainedValueFraction, type TcoInputs, type TcoVehicle } from "../utils";

const inputs: TcoInputs = { years: 5, distancePerYearKm: 20_000, fuelPricePerLiter: 1, electricityPricePerKwh: 0.2 };

const gas: TcoVehicle = {
  price: 30_000,
  fuelType: "GASOLINE",
  performance: { efficiencyKmpl: 10, consumptionKwh100km: null },
  ownershipCost: { serviceIntervalKm: 10_000, serviceCost: 100, annualInsurance: 1_000, resaleValuePct5y: 50 },
};

const ev: TcoVehicle = {
  ...gas,
  fuelType: "ELECTRIC",
  performance: { efficiencyKmpl: null, consumptionKwh100km: 15 },
};

describe("retainedValueFraction", () => {
  it.each([
    { pct: 50, years: 5, expected: 0.5 },
    { pct: 50, years: 0, expected: 1 },
    { pct: 60, years: 2.5, expected: 0.8 },
    { pct: 20, years: 10, expected: 0.1 }, // floored
  ])("$pct% at $years years → $expected", ({ pct, years, expected }) => {
    expect(retainedValueFraction(pct, years)).toBeCloseTo(expected);
  });
});

describe("annualEnergyCost", () => {
  it("uses fuel economy for combustion cars", () => {
    expect(annualEnergyCost(gas, inputs)).toBe(2_000); // 20,000 km / 10 km/l × $1
  });

  it("uses kWh/100km for EVs", () => {
    expect(annualEnergyCost(ev, inputs)).toBe(600); // 200 × 15 kWh × $0.20
  });

  it("returns null when efficiency data is missing", () => {
    expect(annualEnergyCost({ ...gas, performance: { efficiencyKmpl: null, consumptionKwh100km: null } }, inputs)).toBeNull();
  });
});

describe("calculateTco", () => {
  it("sums depreciation, energy, maintenance and insurance", () => {
    expect(calculateTco(gas, inputs)).toEqual({
      depreciation: 15_000,
      energy: 10_000,
      maintenance: 1_000, // 2 services/yr × $100 × 5
      insurance: 5_000,
      total: 31_000,
      perYear: 6_200,
      retainedValue: 15_000,
    });
  });

  it("returns null without ownership data", () => {
    expect(calculateTco({ ...gas, ownershipCost: null }, inputs)).toBeNull();
  });
});

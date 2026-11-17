/** Horsepower per metric tonne of curb weight, or null when either value is missing. */
export function powerToWeight(v: {
  performance: { powerHp: number } | null;
  specification: { curbWeightKg: number } | null;
}): number | null {
  if (!v.performance || !v.specification || v.specification.curbWeightKg <= 0) return null;
  return Math.round((v.performance.powerHp / v.specification.curbWeightKg) * 1000);
}

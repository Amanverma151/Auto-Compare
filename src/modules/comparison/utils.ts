import type { CellValue, CompareRow, Direction } from "@/lib/compare-row";
import { ownershipRows } from "@/modules/ownership-cost";
import { performanceRows } from "@/modules/performance";
import { reviewRows } from "@/modules/reviews";
import { safetyRows } from "@/modules/safety";
import { featureRowGroups, specificationRows } from "@/modules/specifications";
import { overviewRows, variantTitle, type VehicleVariant } from "@/modules/vehicles";
import type { ComparisonColumn, ComparisonRowData, ComparisonSection, ComparisonTable } from "./types";

const EPSILON = 1e-9;
export const MISSING = "—";

/**
 * Indices of the best numeric value(s) for a row. Ties are all returned. Nulls and
 * non-numbers never win, and nothing is "best" unless at least two cars have a value.
 */
export function findBestIndices(values: readonly CellValue[], direction: Direction): number[] {
  if (direction === "none") return [];
  const numeric = values
    .map((v, i) => ({ v, i }))
    .filter((x): x is { v: number; i: number } => typeof x.v === "number" && Number.isFinite(x.v));
  if (numeric.length < 2) return [];
  const target = direction === "higher" ? Math.max(...numeric.map((x) => x.v)) : Math.min(...numeric.map((x) => x.v));
  const best = numeric.filter((x) => Math.abs(x.v - target) < EPSILON).map((x) => x.i);
  // If every car ties, nobody stands out.
  return best.length === numeric.length && numeric.length === values.length ? [] : best;
}

/** True when the row's values (including missing ones) are not all the same. */
export function rowDiffers(values: readonly CellValue[]): boolean {
  if (values.length < 2) return false;
  const first = values[0];
  return values.some((v) => v !== first);
}

export function buildRow<T>(row: CompareRow<T>, items: readonly T[]): ComparisonRowData {
  const values = items.map(row.value);
  const best = new Set(findBestIndices(values, row.direction));
  return {
    key: row.key,
    label: row.label,
    differs: rowDiffers(values),
    cells: values.map((value, i) => ({
      display: value === null ? MISSING : row.format ? row.format(value) : String(value),
      best: best.has(i),
      ...(typeof value === "boolean" ? { bool: value } : {}),
    })),
  };
}

export function buildSection<T>(id: string, title: string, rows: CompareRow<T>[], items: readonly T[]): ComparisonSection {
  return { id, title, rows: rows.map((r) => buildRow(r, items)) };
}

export function toColumn(v: VehicleVariant): ComparisonColumn {
  return {
    slug: v.slug,
    modelId: v.modelId,
    modelSlug: v.model.slug,
    makeName: v.model.make.name,
    modelName: v.model.name,
    variantName: v.name,
    modelYear: v.model.modelYear,
    price: v.price,
    title: variantTitle(v),
    imageUrl: v.model.imageUrl,
  };
}

/** Builds the full side-by-side table from every domain module's row definitions. */
export function buildComparisonTable(vehicles: readonly VehicleVariant[]): ComparisonTable {
  const featureSections = featureRowGroups()
    .map((g) => buildSection(`features-${g.category.toLowerCase()}`, `Features · ${g.title}`, g.rows, vehicles))
    .map((s) => ({ ...s, rows: s.rows.filter((r) => r.cells.some((c) => c.bool)) }))
    .filter((s) => s.rows.length > 0);

  return {
    columns: vehicles.map(toColumn),
    sections: [
      buildSection("overview", "Overview & configuration", overviewRows, vehicles),
      buildSection("performance", "Engine & performance", performanceRows, vehicles),
      buildSection("specifications", "Dimensions & capacities", specificationRows, vehicles),
      buildSection("safety", "Safety", safetyRows, vehicles),
      buildSection("ownership", "Maintenance & ownership cost", ownershipRows, vehicles),
      ...featureSections,
      buildSection("reviews", "Expert verdict", reviewRows, vehicles),
    ],
  };
}

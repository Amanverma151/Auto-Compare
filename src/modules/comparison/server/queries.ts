import "server-only";
import { getVariantOptionsByModel, getVariantsBySlugs } from "@/modules/vehicles/server";
import { buildComparisonTable } from "../utils";

/** Loads everything the compare page needs for the given (already validated) variant slugs. */
export async function loadComparison(slugs: string[]) {
  const vehicles = await getVariantsBySlugs(slugs);
  const [options] = await Promise.all([getVariantOptionsByModel([...new Set(vehicles.map((v) => v.modelId))])]);
  const found = new Set(vehicles.map((v) => v.slug));
  return {
    vehicles,
    table: buildComparisonTable(vehicles),
    variantOptions: options,
    missing: slugs.filter((s) => !found.has(s)),
  };
}

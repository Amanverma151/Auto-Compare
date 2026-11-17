import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { FUEL_TYPE_LABELS } from "@/modules/vehicles";
import type { SearchResult } from "../schemas";
import { tokenize } from "../utils";

const LIMIT = 12;

/** Every term must match the make, model or trim name (case-insensitive). */
export async function searchVariants(query: string): Promise<SearchResult[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("vehicles");
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const rows = await db.variant.findMany({
    where: {
      AND: terms.map((t) => ({
        OR: [
          { name: { contains: t, mode: "insensitive" as const } },
          { model: { name: { contains: t, mode: "insensitive" as const } } },
          { model: { segment: { contains: t, mode: "insensitive" as const } } },
          { model: { make: { name: { contains: t, mode: "insensitive" as const } } } },
        ],
      })),
    },
    include: { model: { include: { make: true } } },
    orderBy: [{ model: { name: "asc" } }, { price: "asc" }],
    take: LIMIT,
  });

  return rows.map((v) => ({
    variantSlug: v.slug,
    modelSlug: v.model.slug,
    title: `${v.model.make.name} ${v.model.name} ${v.name}`,
    subtitle: `${v.model.modelYear} · ${FUEL_TYPE_LABELS[v.fuelType]} · ${formatPrice(v.price)}`,
    price: v.price,
  }));
}

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { ReviewHighlight } from "../types";

export async function getReviewHighlights(): Promise<ReviewHighlight[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("vehicles");
  const reviews = await db.review.findMany({
    include: { model: { include: { make: true } } },
    orderBy: { rating: "desc" },
  });
  return reviews.map((r) => ({
    modelSlug: r.model.slug,
    makeName: r.model.make.name,
    modelName: r.model.name,
    imageUrl: r.model.imageUrl,
    segment: r.model.segment,
    rating: r.rating,
    verdict: r.verdict,
    topPro: r.pros[0] ?? null,
  }));
}

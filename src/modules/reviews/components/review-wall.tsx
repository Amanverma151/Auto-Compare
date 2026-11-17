import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";
import { formatNumber } from "@/lib/format";
import type { ReviewHighlight } from "../types";
import { distribute, makeMonogram } from "../utils";

function ReviewCard({ review }: { review: ReviewHighlight }) {
  return (
    <Card className="w-56" size="sm">
      <CardContent>
        <figure>
          <div className="flex items-center gap-2.5">
            <Avatar className="size-9">
              {review.imageUrl && <AvatarImage src={review.imageUrl} alt="" />}
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {makeMonogram(review.makeName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <figcaption className="truncate text-sm font-medium text-foreground">
                <Link href={`/cars/${review.modelSlug}`} className="hover:underline focus-visible:underline">
                  {review.makeName} {review.modelName}
                </Link>
              </figcaption>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                {formatNumber(review.rating, 1)}/10 · {review.segment}
              </p>
            </div>
          </div>
          <blockquote className="mt-3 text-sm text-secondary-foreground">{review.verdict}</blockquote>
        </figure>
      </CardContent>
    </Card>
  );
}

/**
 * 3D tilted wall of four vertical marquees showing editorial review verdicts.
 * Columns 3–4 are hidden on small screens to keep the effect readable.
 */
export function ReviewWall({ reviews }: { reviews: ReviewHighlight[] }) {
  const columns = distribute(reviews, 4);
  return (
    <div className="relative flex h-[26rem] w-full flex-row items-center justify-center overflow-hidden rounded-xl border bg-background [perspective:300px]">
      <div
        className="flex flex-row items-center gap-4"
        style={{
          transform: "translateX(-60px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
        }}
      >
        {columns.map((col, i) => (
          <Marquee
            key={i}
            vertical
            pauseOnHover
            reverse={i % 2 === 1}
            repeat={3}
            ariaLabel={i === 0 ? "Editorial review highlights" : undefined}
            className={i >= 2 ? "hidden [--duration:40s] md:flex" : "[--duration:40s]"}
          >
            {col.map((review) => (
              <ReviewCard key={review.modelSlug} review={review} />
            ))}
          </Marquee>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
    </div>
  );
}

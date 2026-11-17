import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPrice } from "@/lib/format";
import type { ModelSummary } from "../types";
import { BODY_TYPE_LABELS, FUEL_TYPE_LABELS } from "../utils";
import { CarImage } from "./car-image";

export function ModelCard({ model }: { model: ModelSummary }) {
  return (
    <Card className="group/model relative h-full pt-0 transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md">
      <CarImage
        src={model.imageUrl}
        alt={`${model.makeName} ${model.name}`}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        imgClassName="transition-transform duration-500 group-hover/model:scale-[1.03] motion-reduce:transition-none"
      />
      <CardHeader>
        <CardDescription>
          {model.modelYear} · {model.segment}
        </CardDescription>
        <CardTitle className="text-lg">
          <Link href={`/cars/${model.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {model.makeName} {model.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-2 text-muted-foreground">{model.summary}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{BODY_TYPE_LABELS[model.bodyType]}</Badge>
          {model.fuelTypes.map((f) => (
            <Badge key={f} variant="outline">
              {FUEL_TYPE_LABELS[f]}
            </Badge>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="text-xs text-muted-foreground">From</div>
            <div className="text-base font-semibold">{formatPrice(model.startingPrice)}</div>
          </div>
          {model.rating !== null && (
            <div className="flex items-center gap-1 text-sm font-medium">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
              <span>
                {formatNumber(model.rating, 1)}
                <span className="text-muted-foreground">/10</span>
                <span className="sr-only"> editorial rating</span>
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

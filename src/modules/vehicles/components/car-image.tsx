import Image from "next/image";
import { CarFront } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Representative model photo in a fixed-aspect frame. Falls back to a neutral
 * placeholder when a model has no photo yet. Photos are self-hosted under
 * /public/images/cars and optimised by next/image.
 */
export function CarImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
  imgClassName,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-muted", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imgClassName)} />
      ) : (
        <div className="grid size-full place-items-center bg-gradient-to-br from-sky-100 to-muted dark:from-sky-950" role="img" aria-label={`${alt} (no photo available)`}>
          <CarFront className="size-10 text-muted-foreground/60" strokeWidth={1.25} aria-hidden />
        </div>
      )}
    </div>
  );
}

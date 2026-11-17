import Link from "next/link";
import { CarFront } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 rounded-md text-sm font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
        <CarFront className="size-4" aria-hidden />
      </span>
      Auto Compare
    </Link>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-32 text-center">
      <p className="text-xs font-medium text-brand-content">404</p>
      <h1 className="text-3xl font-medium tracking-tight">We couldn&apos;t find that car</h1>
      <p className="text-sm text-muted-foreground">It may have been renamed or isn&apos;t in our catalogue yet.</p>
      <Button asChild className="rounded-full">
        <Link href="/cars">Browse all cars</Link>
      </Button>
    </div>
  );
}

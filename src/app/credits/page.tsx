import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";
import { CarImage, PhotoCredit } from "@/modules/vehicles";
import { listPhotoCredits } from "@/modules/vehicles/server";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Attribution for the Creative Commons vehicle photos used on Auto Compare.",
};

export default function CreditsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Credits"
        title="Photo credits"
        description="Vehicle photos come from Wikimedia Commons under Creative Commons licences. Each is a representative photo of the model; the trim and colour shown may differ from the specifications listed."
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
          <CreditList />
        </Suspense>
      </div>
    </>
  );
}

async function CreditList() {
  await connection();
  const photos = await listPhotoCredits();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((p) => (
        <li key={p.slug} className="overflow-hidden rounded-2xl border bg-card">
          <CarImage src={p.imageUrl} alt={p.title} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
          <div className="space-y-1 p-4">
            <Link href={`/cars/${p.slug}`} className="text-sm font-medium hover:text-brand-content">
              {p.title}
            </Link>
            {p.credit && <PhotoCredit credit={p.credit} className="text-xs text-muted-foreground" />}
          </div>
        </li>
      ))}
    </ul>
  );
}

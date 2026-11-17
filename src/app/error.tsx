"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-32 text-center">
      <h1 className="text-3xl font-medium tracking-tight">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">We couldn&apos;t load this page. Please try again.</p>
      <Button type="button" className="rounded-full" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}

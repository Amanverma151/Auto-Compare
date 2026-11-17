import { NextResponse, type NextRequest } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { searchQuerySchema } from "@/modules/search";
import { searchVariants } from "@/modules/search/server";

/** GET /api/search?q=rav4 — public, read-only autocomplete. */
export async function GET(request: NextRequest) {
  const limit = rateLimit(clientKey(request.headers));
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterS) } });
  }

  const parsed = searchQuerySchema.safeParse(request.nextUrl.searchParams.get("q") ?? "");
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", issues: parsed.error.flatten().formErrors }, { status: 400 });
  }

  const results = await searchVariants(parsed.data);
  return NextResponse.json({ results });
}

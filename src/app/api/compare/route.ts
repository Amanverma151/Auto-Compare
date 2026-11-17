import { NextResponse, type NextRequest } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { parseCompareIds } from "@/modules/comparison";
import { loadComparison } from "@/modules/comparison/server";

/** GET /api/compare?ids=a,b,c — the comparison table as JSON (max 4 ids). */
export async function GET(request: NextRequest) {
  const limit = rateLimit(clientKey(request.headers));
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterS) } });
  }

  const raw = (request.nextUrl.searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 20);
  const { ids, dropped } = parseCompareIds(raw);
  if (ids.length === 0) {
    return NextResponse.json({ error: "Provide 1–4 variant slugs as ?ids=a,b" }, { status: 400 });
  }

  const { table, missing } = await loadComparison(ids);
  return NextResponse.json({ ...table, ignored: [...dropped, ...missing] });
}

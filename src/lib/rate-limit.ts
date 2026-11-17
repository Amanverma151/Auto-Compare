/**
 * Minimal in-memory fixed-window rate limiter for public API routes.
 * Per-instance only: replace with the hosting platform's limiter (or Redis)
 * once hosting is chosen. See CLAUDE.md §6.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, now = Date.now()): { ok: boolean; retryAfterS: number } {
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 10_000) hits.clear();
    return { ok: true, retryAfterS: 0 };
  }
  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return { ok: false, retryAfterS: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterS: 0 };
}

export function clientKey(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "anon";
}

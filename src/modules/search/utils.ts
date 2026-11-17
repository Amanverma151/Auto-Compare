/** Splits a free-text query into lowercase terms (max 5) for AND-of-ORs matching. */
export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 5);
}

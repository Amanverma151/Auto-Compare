import { slugSchema } from "@/modules/vehicles";
import { MAX_COMPARE } from "./constants";

/**
 * Normalises raw compare ids from the URL: drops invalid slugs and duplicates and
 * caps the list at MAX_COMPARE. Returns which inputs were dropped so the UI can say so.
 */
export function parseCompareIds(raw: readonly string[]): { ids: string[]; dropped: string[] } {
  const ids: string[] = [];
  const dropped: string[] = [];
  for (const value of raw) {
    const parsed = slugSchema.safeParse(value);
    if (!parsed.success) {
      dropped.push(value);
      continue;
    }
    if (ids.includes(parsed.data)) continue;
    if (ids.length >= MAX_COMPARE) {
      dropped.push(parsed.data);
      continue;
    }
    ids.push(parsed.data);
  }
  return { ids, dropped };
}

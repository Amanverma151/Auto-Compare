import { z } from "zod";

export const MAX_QUERY_LENGTH = 100;

export const searchQuerySchema = z.string().trim().min(1).max(MAX_QUERY_LENGTH);

export const searchResultSchema = z.object({
  variantSlug: z.string(),
  modelSlug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  price: z.number(),
});

export const searchResponseSchema = z.object({ results: z.array(searchResultSchema) });

export type SearchResult = z.infer<typeof searchResultSchema>;

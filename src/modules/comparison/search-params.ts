import { createLoader, parseAsArrayOf, parseAsString } from "nuqs/server";

/** `?ids=slug-a,slug-b` — shared between the server page and client controls. */
export const compareSearchParams = {
  ids: parseAsArrayOf(parseAsString, ",").withDefault([]),
};

export const loadCompareSearchParams = createLoader(compareSearchParams);

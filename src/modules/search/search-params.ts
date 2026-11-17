import { createLoader, createSerializer, parseAsInteger, parseAsStringLiteral } from "nuqs/server";

export const BODY_TYPES = ["HATCHBACK", "SEDAN", "SUV", "PICKUP"] as const;
export const FUEL_TYPES = ["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"] as const;
export const PRICE_CAPS = [30_000, 40_000, 50_000] as const;

/** Browse page filters: `/cars?body=SUV&fuel=HYBRID&maxPrice=40000` */
export const browseSearchParams = {
  body: parseAsStringLiteral(BODY_TYPES),
  fuel: parseAsStringLiteral(FUEL_TYPES),
  maxPrice: parseAsInteger,
};

export const loadBrowseSearchParams = createLoader(browseSearchParams);
export const serializeBrowse = createSerializer(browseSearchParams);

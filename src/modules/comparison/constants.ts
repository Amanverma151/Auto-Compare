export const MIN_COMPARE = 2;
export const MAX_COMPARE = 4;

export const POPULAR_COMPARISONS: { title: string; slugs: string[] }[] = [
  { title: "Compact sedans", slugs: ["honda-civic-sport-touring-hybrid", "toyota-corolla-xse", "hyundai-elantra-hybrid-limited"] },
  { title: "Hybrid compact SUVs", slugs: ["toyota-rav4-hybrid-xle", "honda-cr-v-sport-l-hybrid", "hyundai-tucson-hybrid-limited"] },
  { title: "Electric SUVs", slugs: ["tesla-model-y-long-range-awd", "hyundai-ioniq-5-limited-awd", "ford-mustang-mach-e-premium-awd"] },
  { title: "Midsize hybrid sedans", slugs: ["toyota-camry-xse-awd", "honda-accord-sport-l-hybrid"] },
];

export const compareHref = (slugs: string[]) => `/compare?ids=${slugs.map(encodeURIComponent).join(",")}`;

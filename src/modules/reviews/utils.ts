/** Two-letter monogram for a make, used as an avatar fallback ("Volkswagen" → "VW"-style initials). */
export function makeMonogram(makeName: string): string {
  const words = makeName.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return makeName.slice(0, 2).toUpperCase();
}

/** Split items into `n` columns round-robin so each column gets a varied mix. */
export function distribute<T>(items: T[], n: number): T[][] {
  const cols: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n]!.push(item));
  return cols;
}

export function ratingLabel(rating: number): string {
  if (rating >= 8.5) return "Outstanding";
  if (rating >= 8) return "Excellent";
  if (rating >= 7) return "Good";
  if (rating >= 6) return "Average";
  return "Below average";
}

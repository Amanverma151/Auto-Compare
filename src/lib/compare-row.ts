/** A single comparable cell value. `null` means "not available" and never wins. */
export type CellValue = number | string | boolean | null;

/** Whether a higher or lower number is better for a row, or it is not ranked. */
export type Direction = "higher" | "lower" | "none";

/**
 * Declarative definition of one comparison row. Domain modules export arrays of
 * these; the comparison module turns them into a rendered table.
 */
export interface CompareRow<T> {
  key: string;
  label: string;
  value: (item: T) => CellValue;
  format?: (value: Exclude<CellValue, null>) => string;
  direction: Direction;
}

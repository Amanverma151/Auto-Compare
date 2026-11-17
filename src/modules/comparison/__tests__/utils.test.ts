import { describe, expect, it } from "vitest";
import type { CompareRow } from "@/lib/compare-row";
import { buildRow, findBestIndices, MISSING, rowDiffers } from "../utils";

describe("findBestIndices", () => {
  it.each([
    { values: [200, 300, 250], dir: "higher", expected: [1] },
    { values: [200, 300, 250], dir: "lower", expected: [0] },
    { values: [300, 300, 250], dir: "higher", expected: [0, 1] },
    { values: [null, 10, 20], dir: "lower", expected: [1] },
    { values: [5, 5, 5], dir: "higher", expected: [] },
    { values: [null, 10, null], dir: "higher", expected: [] },
    { values: ["a", "b"], dir: "higher", expected: [] },
    { values: [1, 2], dir: "none", expected: [] },
  ] as const)("$dir of $values → $expected", ({ values, dir, expected }) => {
    expect(findBestIndices([...values], dir)).toEqual(expected);
  });

  it("treats a tie among cars with data as best when another car lacks data", () => {
    expect(findBestIndices([5, 5, null], "higher")).toEqual([0, 1]);
  });
});

describe("rowDiffers", () => {
  it.each([
    { values: [1, 1, 1], expected: false },
    { values: [1, 2, 1], expected: true },
    { values: ["SUV", "SUV"], expected: false },
    { values: [true, false], expected: true },
    { values: [null, null], expected: false },
    { values: [null, 300], expected: true },
    { values: [1], expected: false },
  ])("$values → $expected", ({ values, expected }) => {
    expect(rowDiffers(values)).toBe(expected);
  });
});

describe("buildRow", () => {
  type Car = { hp: number | null; awd: boolean };
  const cars: Car[] = [{ hp: 200, awd: true }, { hp: 300, awd: false }, { hp: null, awd: true }];

  it("formats values, marks the best and renders missing values", () => {
    const row: CompareRow<Car> = { key: "hp", label: "Power", value: (c) => c.hp, format: (x) => `${x} hp`, direction: "higher" };
    const built = buildRow(row, cars);
    expect(built.cells.map((c) => c.display)).toEqual(["200 hp", "300 hp", MISSING]);
    expect(built.cells.map((c) => c.best)).toEqual([false, true, false]);
    expect(built.differs).toBe(true);
  });

  it("exposes booleans for icon rendering", () => {
    const row: CompareRow<Car> = { key: "awd", label: "AWD", value: (c) => c.awd, direction: "none" };
    expect(buildRow(row, cars).cells.map((c) => c.bool)).toEqual([true, false, true]);
  });
});

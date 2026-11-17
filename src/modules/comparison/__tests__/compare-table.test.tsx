import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CompareTable } from "../components/compare-table";
import type { ComparisonColumn, ComparisonSection } from "../types";

const col = (slug: string, modelName: string): ComparisonColumn => ({
  slug,
  modelId: slug,
  modelSlug: slug,
  makeName: "Make",
  modelName,
  variantName: "Base",
  modelYear: 2025,
  price: 1,
  title: modelName,
  imageUrl: null,
});

const sections: ComparisonSection[] = [
  {
    id: "overview",
    title: "Overview",
    rows: [
      { key: "seats", label: "Seats", differs: false, cells: [{ display: "5", best: false }, { display: "5", best: false }] },
      { key: "power", label: "Horsepower", differs: true, cells: [{ display: "200 hp", best: false }, { display: "300 hp", best: true }] },
    ],
  },
];

describe("CompareTable", () => {
  it("marks the best cell for screen readers", () => {
    render(<CompareTable columns={[col("a", "Alpha"), col("b", "Beta")]} sections={sections} />);
    const row = screen.getByRole("row", { name: /Horsepower/ });
    expect(within(row).getByText("(best in comparison)")).toBeInTheDocument();
  });

  it("hides identical rows when 'only show differences' is on", async () => {
    render(<CompareTable columns={[col("a", "Alpha"), col("b", "Beta")]} sections={sections} />);
    expect(screen.getByRole("rowheader", { name: "Seats" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: /only show differences/i }));
    expect(screen.queryByRole("rowheader", { name: "Seats" })).not.toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Horsepower" })).toBeInTheDocument();
  });

  it("collapses a section", async () => {
    render(<CompareTable columns={[col("a", "Alpha"), col("b", "Beta")]} sections={sections} />);
    await userEvent.click(screen.getByRole("button", { name: /Overview/ }));
    expect(screen.queryByRole("rowheader", { name: "Horsepower" })).not.toBeInTheDocument();
  });
});

import { expect, test } from "@playwright/test";

test("search navigates to a model page", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("combobox", { name: "Search cars" }).first();
  await search.fill("rav4 hybrid");
  await page.getByRole("option", { name: /Toyota RAV4 Hybrid XLE/ }).click();
  await expect(page).toHaveURL(/\/cars\/toyota-rav4$/);
  await expect(page.getByRole("heading", { level: 1, name: "Toyota RAV4" })).toBeVisible();
});

test("compare three cars, filter differences, and share the link", async ({ page, browser }) => {
  const picks = [
    ["/cars/toyota-rav4", "2025 Toyota RAV4 Hybrid XLE"],
    ["/cars/honda-cr-v", "2025 Honda CR-V Sport-L Hybrid AWD"],
    ["/cars/hyundai-tucson", "2025 Hyundai Tucson Hybrid Limited"],
  ] as const;

  for (const [url, title] of picks) {
    await page.goto(url);
    await page.getByRole("button", { name: `Compare ${title}` }).click();
    await expect(page.getByRole("button", { name: `Added ${title}` })).toBeVisible();
  }

  const tray = page.getByRole("complementary", { name: "Cars selected for comparison" });
  await expect(tray.getByRole("listitem").filter({ hasText: "2025" })).toHaveCount(3);
  await tray.getByRole("link", { name: /Compare now/ }).click();

  await expect(page).toHaveURL(/\/compare\?ids=/);
  const table = page.getByRole("table", { name: "Side-by-side comparison" });
  for (const name of ["RAV4 Hybrid XLE", "CR-V Sport-L Hybrid AWD", "Tucson Hybrid Limited"]) {
    await expect(table.getByRole("columnheader", { name: new RegExp(name) })).toBeVisible();
  }

  // "Body type" is SUV for all three, so it disappears when only differences are shown.
  await expect(table.getByRole("rowheader", { name: "Body type" })).toBeVisible();
  await page.getByRole("switch", { name: /only show differences/i }).click();
  await expect(table.getByRole("rowheader", { name: "Body type" })).toHaveCount(0);
  await expect(table.getByRole("rowheader", { name: "Starting MSRP" })).toBeVisible();

  // The URL alone reproduces the comparison in a fresh browser context.
  const shared = page.url();
  const fresh = await browser.newContext();
  const other = await fresh.newPage();
  await other.goto(shared);
  const otherTable = other.getByRole("table", { name: "Side-by-side comparison" });
  await expect(otherTable.getByRole("columnheader", { name: /RAV4 Hybrid XLE/ })).toBeVisible();
  await expect(otherTable.getByRole("columnheader", { name: /Tucson Hybrid Limited/ })).toBeVisible();
  await fresh.close();
});

test("invalid ids are reported, not fatal", async ({ page }) => {
  await page.goto("/compare?ids=toyota-rav4-le,not-a-real-car");
  // Next.js renders its own (empty) route announcer with role="alert", so match ours by text.
  await expect(page.getByRole("alert").filter({ hasText: "couldn't be found" })).toContainText("not-a-real-car");
  await expect(page.getByRole("heading", { name: "Add one more car to compare" })).toBeVisible();
});

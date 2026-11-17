import { describe, expect, it } from "vitest";
import { parseCompareIds } from "../schemas";

describe("parseCompareIds", () => {
  it("keeps valid unique slugs in order", () => {
    expect(parseCompareIds(["toyota-rav4-le", "honda-cr-v-ex"])).toEqual({ ids: ["toyota-rav4-le", "honda-cr-v-ex"], dropped: [] });
  });

  it("drops invalid slugs and duplicates, normalising case", () => {
    const { ids, dropped } = parseCompareIds(["Toyota-RAV4-LE", "toyota-rav4-le", "<script>", "a b"]);
    expect(ids).toEqual(["toyota-rav4-le"]);
    expect(dropped).toEqual(["<script>", "a b"]);
  });

  it("caps the list at four cars", () => {
    const { ids, dropped } = parseCompareIds(["a", "b", "c", "d", "e"]);
    expect(ids).toEqual(["a", "b", "c", "d"]);
    expect(dropped).toEqual(["e"]);
  });
});

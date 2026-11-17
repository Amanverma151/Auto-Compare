import { describe, expect, it } from "vitest";
import { formatEfficiency, formatLength, formatPrice, formatTorque, units } from "./format";

describe("format (imperial / USD defaults)", () => {
  it("formats prices without cents", () => expect(formatPrice(28_000)).toBe("$28,000"));
  it("converts km/l to mpg", () => expect(formatEfficiency(14.9)).toBe("35 mpg"));
  it("converts Nm to lb-ft", () => expect(formatTorque(205)).toBe("151 lb-ft"));
  it("converts mm to inches", () => expect(formatLength(4630)).toBe("182.3 in"));
  it("converts user distance to km", () => expect(units.toKm(1)).toBeCloseTo(1.609344));
});

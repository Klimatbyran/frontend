import { describe, expect, it } from "vitest";
import {
  formatNumberForInput,
  parseFormNumber,
  stripNumberFormatting,
} from "./numberFormat";

describe("numberFormat", () => {
  it("formats integers with space thousand separators", () => {
    expect(formatNumberForInput(1234567)).toBe("1 234 567");
    expect(formatNumberForInput("1234567")).toBe("1 234 567");
  });

  it("formats decimals without rounding", () => {
    expect(formatNumberForInput("1234.56")).toBe("1 234.56");
  });

  it("strips formatting for parsing", () => {
    expect(stripNumberFormatting("1 234 567")).toBe("1234567");
    expect(parseFormNumber("1 234 567.5")).toBe(1234567.5);
  });

  it("preserves partial input while typing", () => {
    expect(formatNumberForInput("1234.")).toBe("1 234.");
    expect(formatNumberForInput("-")).toBe("-");
  });
});

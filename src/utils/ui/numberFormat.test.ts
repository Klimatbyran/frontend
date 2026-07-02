import { describe, expect, it } from "vitest";
import {
  formatNumberForInput,
  parseFormNumber,
  parseNullableFormNumber,
  stripNumberFormatting,
} from "./numberFormat";

describe("numberFormat (sv-SE)", () => {
  it("formats integers with space thousand separators", () => {
    expect(formatNumberForInput(1234567)).toBe("1 234 567");
    expect(formatNumberForInput("1234567")).toBe("1 234 567");
  });

  it("formats decimals with comma decimal separator", () => {
    expect(formatNumberForInput("1234.56")).toBe("1 234,56");
    expect(formatNumberForInput("1 234,56")).toBe("1 234,56");
  });

  it("strips Swedish formatting for parsing", () => {
    expect(stripNumberFormatting("1 234 567")).toBe("1234567");
    expect(stripNumberFormatting("1 234 567,5")).toBe("1234567.5");
    expect(parseFormNumber("1 234 567,5")).toBe(1234567.5);
  });

  it("preserves partial input while typing", () => {
    expect(formatNumberForInput("1234.")).toBe("1 234,");
    expect(formatNumberForInput("1234,")).toBe("1 234,");
    expect(formatNumberForInput("-")).toBe("-");
  });

  it("keeps API-style dot decimals when no comma is present", () => {
    expect(stripNumberFormatting("1234.56")).toBe("1234.56");
  });

  it("strips narrow no-break space grouping", () => {
    expect(stripNumberFormatting("1\u202F234\u202F567")).toBe("1234567");
  });

  it("parseNullableFormNumber returns null for empty string", () => {
    expect(parseNullableFormNumber("")).toBe(null);
    expect(parseNullableFormNumber("1 234,5")).toBe(1234.5);
  });
});

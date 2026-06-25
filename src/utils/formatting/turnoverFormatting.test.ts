import { describe, expect, it } from "vitest";
import {
  formatTurnoverAxisValue,
  formatTurnoverValue,
} from "./turnoverFormatting";

const t = (key: string) =>
  ({
    "companies.overview.million": "million",
    "companies.overview.billion": "billion",
  })[key] ?? key;

describe("turnoverFormatting", () => {
  it("formats turnover in millions with currency", () => {
    expect(formatTurnoverValue(1_500_000, "en", t, "SEK")).toBe(
      "1.5 million SEK",
    );
  });

  it("formats turnover in billions with currency", () => {
    expect(formatTurnoverValue(2_500_000_000, "en", t, "SEK")).toBe(
      "2.5 billion SEK",
    );
  });

  it("formats turnover without currency", () => {
    expect(formatTurnoverValue(1_500_000, "en", t)).toBe("1.5 million");
  });

  it("formats compact axis values", () => {
    expect(formatTurnoverAxisValue(1_500_000, "en")).toBe("1.5M");
  });
});

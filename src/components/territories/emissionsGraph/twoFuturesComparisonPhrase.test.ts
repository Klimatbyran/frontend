import { describe, expect, it } from "vitest";
import { captionFromPathTotals } from "./twoFuturesComparisonPhrase";

describe("captionFromPathTotals", () => {
  it("returns aligned when totals match within tolerance", () => {
    expect(captionFromPathTotals(100, 100)).toEqual({ kind: "aligned" });
    expect(captionFromPathTotals(100.4, 100)).toEqual({ kind: "aligned" });
  });

  it("returns overshoot times as rounded trend/Paris ratio", () => {
    expect(captionFromPathTotals(200, 100)).toEqual({
      kind: "overshoot",
      times: 2,
    });
    expect(captionFromPathTotals(340, 100)).toEqual({
      kind: "overshoot",
      times: 3,
    });
  });

  it("uses at least 2× for small overshoots", () => {
    expect(captionFromPathTotals(112, 100)).toEqual({
      kind: "overshoot",
      times: 2,
    });
  });

  it("returns undershoot times from Paris/trend ratio", () => {
    expect(captionFromPathTotals(70, 100)).toEqual({
      kind: "undershoot",
      times: 2,
    });
  });
});

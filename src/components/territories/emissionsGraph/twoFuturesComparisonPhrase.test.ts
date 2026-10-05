import { describe, expect, it } from "vitest";
import { captionFromPathTotals } from "./twoFuturesComparisonPhrase";

describe("captionFromPathTotals", () => {
  it("returns aligned when totals match within tolerance", () => {
    expect(captionFromPathTotals(100, 100)).toEqual({ kind: "aligned" });
    expect(captionFromPathTotals(100.4, 100)).toEqual({ kind: "aligned" });
  });

  it("returns an exact multiple when the ratio is a whole number", () => {
    expect(captionFromPathTotals(200, 100)).toEqual({
      kind: "overshoot",
      times: 2,
      moreThan: false,
    });
    expect(captionFromPathTotals(300, 100)).toEqual({
      kind: "overshoot",
      times: 3,
      moreThan: false,
    });
  });

  it("keeps a ratio above a whole number as more than that number", () => {
    expect(captionFromPathTotals(340, 100)).toEqual({
      kind: "overshoot",
      times: 3,
      moreThan: true,
    });
    // Göteborg's chart area is just over 3× the Paris path, not 3×.
    expect(captionFromPathTotals(305.8, 100)).toEqual({
      kind: "overshoot",
      times: 3,
      moreThan: true,
    });
  });

  it("does not call a small gap twice as much", () => {
    expect(captionFromPathTotals(112, 100)).toEqual({
      kind: "overshootMild",
    });
    expect(captionFromPathTotals(70, 100)).toEqual({
      kind: "undershootMild",
    });
  });

  it("returns undershoot times from the Paris/trend ratio", () => {
    expect(captionFromPathTotals(50, 100)).toEqual({
      kind: "undershoot",
      times: 2,
      moreThan: false,
    });
    expect(captionFromPathTotals(30, 100)).toEqual({
      kind: "undershoot",
      times: 3,
      moreThan: true,
    });
  });
});

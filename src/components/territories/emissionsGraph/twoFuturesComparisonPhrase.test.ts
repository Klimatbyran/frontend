import { describe, expect, it } from "vitest";
import { captionFromPathTotals } from "./twoFuturesComparisonPhrase";

describe("captionFromPathTotals", () => {
  it("returns aligned when the values match within tolerance", () => {
    expect(captionFromPathTotals(100, 100)).toEqual({ kind: "aligned" });
    expect(captionFromPathTotals(100.4, 100)).toEqual({ kind: "aligned" });
  });

  it("rounds the ratio to the nearest whole number of times", () => {
    expect(captionFromPathTotals(200, 100)).toEqual({
      kind: "overshoot",
      times: 2,
    });
    expect(captionFromPathTotals(340, 100)).toEqual({
      kind: "overshoot",
      times: 3,
    });
    expect(captionFromPathTotals(360, 100)).toEqual({
      kind: "overshoot",
      times: 4,
    });
    // Göteborg in 2050: trend is about 18.8× the Paris path.
    expect(captionFromPathTotals(1880, 100)).toEqual({
      kind: "overshoot",
      times: 19,
    });
  });

  it("does not call a small gap twice as much", () => {
    expect(captionFromPathTotals(112, 100)).toEqual({
      kind: "overshootMild",
    });
    expect(captionFromPathTotals(150, 100)).toEqual({
      kind: "overshoot",
      times: 2,
    });
  });

  it("returns undershoot times from the Paris/trend ratio", () => {
    expect(captionFromPathTotals(50, 100)).toEqual({
      kind: "undershoot",
      times: 2,
    });
    expect(captionFromPathTotals(30, 100)).toEqual({
      kind: "undershoot",
      times: 3,
    });
    expect(captionFromPathTotals(70, 100)).toEqual({
      kind: "undershootMild",
    });
    expect(captionFromPathTotals(0, 100)).toEqual({
      kind: "undershootMild",
    });
  });
});

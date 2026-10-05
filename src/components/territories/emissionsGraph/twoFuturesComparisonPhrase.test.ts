import { describe, expect, it } from "vitest";
import { pickTrendVsParisPhraseKey } from "./twoFuturesComparisonPhrase";

describe("pickTrendVsParisPhraseKey", () => {
  it("returns null when aligned with the Paris path", () => {
    expect(pickTrendVsParisPhraseKey(0)).toBeNull();
    expect(pickTrendVsParisPhraseKey(0.002)).toBeNull();
  });

  it("picks double for a 100% overshoot", () => {
    expect(pickTrendVsParisPhraseKey(1)).toBe("double");
  });

  it("picks eighth less for a one-eighth undershoot", () => {
    expect(pickTrendVsParisPhraseKey(-0.125)).toBe("eighthLess");
  });

  it("snaps a 65% overshoot to two thirds more", () => {
    expect(pickTrendVsParisPhraseKey(0.65)).toBe("twoThirdsMore");
  });
});

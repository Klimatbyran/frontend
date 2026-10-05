import { describe, expect, it } from "vitest";
import {
  buildComparativeBarGradient,
  buildNeutralBarGradient,
} from "./kpiBenchmarkBarGradient";

describe("kpiBenchmarkBarGradient", () => {
  it("uses blue and pink for lower-is-better KPIs", () => {
    const gradient = buildComparativeBarGradient(0.5, false);
    expect(gradient).toContain("--blue-");
    expect(gradient).toContain("--pink-");
    expect(gradient).not.toContain("--green-");
  });

  it("flips ends when higher is better", () => {
    const lowerIsBetter = buildComparativeBarGradient(0.4, false);
    const higherIsBetter = buildComparativeBarGradient(0.4, true);
    expect(
      lowerIsBetter.startsWith("linear-gradient(to right, var(--blue-4)"),
    ).toBe(true);
    expect(
      higherIsBetter.startsWith("linear-gradient(to right, var(--pink-4)"),
    ).toBe(true);
  });

  it("uses an orange scale for neutral KPIs", () => {
    const gradient = buildNeutralBarGradient(0.55);
    expect(gradient).toContain("--orange-1");
    expect(gradient).toContain("--orange-4");
    expect(gradient).not.toContain("--blue-");
    expect(gradient).not.toContain("--pink-");
  });
});

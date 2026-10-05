import { describe, expect, it } from "vitest";
import { buildNumericBenchmark } from "./kpiBenchmark";
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

  it("centers a 10-point blend on the average for a lower-is-better bar", () => {
    // The average marker is halfway. The blend runs from 40% to 60%.
    // Low values are on the left, so that side is blue and the high side is pink.
    expect(buildComparativeBarGradient(0.5, false)).toBe(
      "linear-gradient(to right, var(--blue-4) 0%, var(--blue-3) 40%, var(--pink-3) 60%, var(--pink-4) 100%)",
    );
  });

  it("flips the same blend when higher values are better", () => {
    expect(buildComparativeBarGradient(0.5, true)).toBe(
      "linear-gradient(to right, var(--pink-4) 0%, var(--pink-3) 40%, var(--blue-3) 60%, var(--blue-4) 100%)",
    );
  });

  it("uses a wider 12-point blend for the orange scale", () => {
    // Average at 60%: orange deepens from 48% to 72%.
    expect(buildNeutralBarGradient(0.6)).toBe(
      "linear-gradient(to right, var(--orange-1) 0%, var(--orange-2) 48%, var(--orange-3) 72%, var(--orange-4) 100%)",
    );
  });

  it("keeps the blend inside the bar when the average is at either end", () => {
    expect(buildComparativeBarGradient(0, false)).toBe(
      "linear-gradient(to right, var(--blue-4) 0%, var(--blue-3) 0%, var(--pink-3) 10%, var(--pink-4) 100%)",
    );
    expect(buildComparativeBarGradient(1, false)).toBe(
      "linear-gradient(to right, var(--blue-4) 0%, var(--blue-3) 90%, var(--pink-3) 100%, var(--pink-4) 100%)",
    );
    expect(buildNeutralBarGradient(0)).toBe(
      "linear-gradient(to right, var(--orange-1) 0%, var(--orange-2) 0%, var(--orange-3) 12%, var(--orange-4) 100%)",
    );
  });

  it("paints the blend around the average from the worked peer example", () => {
    // Other peers 10, 20, 30, 40, 50. This municipality emits 15.
    // The middle peer is 30, at 60% of the bar, so the blend runs 50% to 70%.
    const view = buildNumericBenchmark({
      value: 15,
      peers: [10, 20, 30, 40, 50],
      higherIsBetter: false,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
    });

    expect(view?.averagePosition).toBeCloseTo(0.6);
    expect(buildComparativeBarGradient(view!.averagePosition, false)).toBe(
      "linear-gradient(to right, var(--blue-4) 0%, var(--blue-3) 50%, var(--pink-3) 70%, var(--pink-4) 100%)",
    );
    expect(buildNeutralBarGradient(view!.averagePosition)).toBe(
      "linear-gradient(to right, var(--orange-1) 0%, var(--orange-2) 48%, var(--orange-3) 72%, var(--orange-4) 100%)",
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  booleanDistributionSpecs,
  distributeValues,
  procurementDistributionSpecs,
  resolveDistribution,
} from "./kpiDistribution";

const yesNo = booleanDistributionSpecs({
  yes: "Yes",
  no: "No",
  unknown: "Unknown",
});

describe("distributeValues", () => {
  it("counts yes, no, and unknown, and marks the subject's bucket", () => {
    expect(
      distributeValues([true, false, null, true, false], true, yesNo),
    ).toEqual({
      total: 5,
      buckets: [
        { id: "yes", label: "Yes", tone: "good", count: 2, active: true },
        { id: "no", label: "No", tone: "poor", count: 2, active: false },
        {
          id: "unknown",
          label: "Unknown",
          tone: "muted",
          count: 1,
          active: false,
        },
      ],
    });
  });

  it("drops a bucket that nobody falls into", () => {
    expect(
      distributeValues([true, true], true, yesNo)?.buckets.map(
        (bucket) => bucket.id,
      ),
    ).toEqual(["yes"]);
  });

  it("splits a three-step score from best to worst", () => {
    const specs = procurementDistributionSpecs({
      high: "Yes",
      medium: "Maybe",
      low: "No",
    });

    expect(distributeValues([2, 2, 1, 0, 0], 1, specs)?.buckets).toEqual([
      { id: "high", label: "Yes", tone: "good", count: 2, active: false },
      { id: "medium", label: "Maybe", tone: "mid", count: 1, active: true },
      { id: "low", label: "No", tone: "poor", count: 2, active: false },
    ]);
  });

  it("returns null when nothing matches a bucket", () => {
    expect(
      distributeValues(
        [null],
        1,
        procurementDistributionSpecs({
          high: "Yes",
          medium: "Maybe",
          low: "No",
        }),
      ),
    ).toBeNull();
  });
});

describe("resolveDistribution", () => {
  it("stays pending while peers are loading", () => {
    expect(resolveDistribution("loading", [true], [true], true, yesNo)).toEqual(
      {
        distribution: null,
        pending: true,
      },
    );
  });

  it("does not draw a distribution when the peer set failed to load", () => {
    expect(resolveDistribution("error", [], [true], true, yesNo)).toEqual({
      distribution: null,
      pending: false,
    });
  });
});

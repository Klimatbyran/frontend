import { describe, expect, it } from "vitest";
import {
  assignValueToBin,
  buildDistributionBins,
  EMISSIONS_CHANGE_BIN_DEFINITIONS,
  summarizeEmissionsChange,
  summarizeParisAlignment,
} from "./emissionsDistribution";

describe("emissionsDistribution", () => {
  it("assigns values to the expected change bins", () => {
    expect(assignValueToBin(-40, EMISSIONS_CHANGE_BIN_DEFINITIONS).id).toBe(
      "largeReduction",
    );
    expect(assignValueToBin(-15, EMISSIONS_CHANGE_BIN_DEFINITIONS).id).toBe(
      "moderateReduction",
    );
    expect(assignValueToBin(-2, EMISSIONS_CHANGE_BIN_DEFINITIONS).id).toBe(
      "smallReduction",
    );
    expect(assignValueToBin(0, EMISSIONS_CHANGE_BIN_DEFINITIONS).id).toBe(
      "smallIncrease",
    );
    expect(assignValueToBin(20, EMISSIONS_CHANGE_BIN_DEFINITIONS).id).toBe(
      "moderateIncrease",
    );
    expect(assignValueToBin(45, EMISSIONS_CHANGE_BIN_DEFINITIONS).id).toBe(
      "largeIncrease",
    );
  });

  it("summarizes emissions change counts", () => {
    const summary = summarizeEmissionsChange([-20, -5, 0, 10, 40]);

    expect(summary.totalWithData).toBe(5);
    expect(summary.reducedCount).toBe(2);
    expect(summary.increasedCount).toBe(2);
    expect(summary.unchangedCount).toBe(1);
    expect(summary.median).toBe(0);
  });

  it("builds histogram bins with counts", () => {
    const bins = buildDistributionBins([-40, -15, 5, 25]);

    expect(bins.find((bin) => bin.id === "largeReduction")?.count).toBe(1);
    expect(bins.find((bin) => bin.id === "moderateReduction")?.count).toBe(1);
    expect(bins.find((bin) => bin.id === "smallIncrease")?.count).toBe(1);
    expect(bins.find((bin) => bin.id === "moderateIncrease")?.count).toBe(1);
  });

  it("summarizes Paris alignment counts", () => {
    const summary = summarizeParisAlignment([true, true, false, null]);

    expect(summary.yesCount).toBe(2);
    expect(summary.noCount).toBe(1);
    expect(summary.unknownCount).toBe(1);
    expect(summary.total).toBe(4);
  });
});

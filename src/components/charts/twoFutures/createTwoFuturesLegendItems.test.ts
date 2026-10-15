import { describe, expect, it } from "vitest";
import { createTwoFuturesLegendItems } from "./createTwoFuturesLegendItems";

const t = (key: string) => key;

describe("createTwoFuturesLegendItems", () => {
  it("adds an estimated swatch when modelled years are on the chart", () => {
    const items = createTwoFuturesLegendItems(t, "detailPage.graph", true, {
      estimated: true,
    });

    expect(items.map((item) => item.name)).toEqual([
      "detailPage.graph.pastPath",
      "detailPage.graph.estimated",
      "detailPage.graph.trendPath",
      "detailPage.graph.parisPath",
    ]);
    expect(items[1].isDashed).toBe(true);
  });

  it("uses the company approximated label for estimated company years", () => {
    const items = createTwoFuturesLegendItems(
      t,
      "companies.emissionsHistory",
      true,
      { estimated: true },
    );

    expect(items.map((item) => item.name)).toContain(
      "companies.emissionsHistory.approximated",
    );
    expect(items.map((item) => item.name)).not.toContain(
      "companies.emissionsHistory.aiGenerated",
    );
  });
});

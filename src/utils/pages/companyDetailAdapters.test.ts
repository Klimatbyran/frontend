import { describe, expect, it } from "vitest";
import { filterValidTotalData } from "@/components/charts/historicEmissions/utils/chartData";
import type { PageCompanyEmissionsHistory } from "@/types/pages";
import { chartDataFromEmissionsHistory } from "./companyDetailAdapters";

function history(
  periods: PageCompanyEmissionsHistory["periods"],
): PageCompanyEmissionsHistory {
  return {
    baseYear: 2020,
    futureEmissionsTrendSlope: null,
    sectorCode: null,
    trend: null,
    projections: [],
    periods,
  };
}

const emptyScopes = {
  scope1: null,
  scope2: null,
  scope3: null,
  scope3Categories: [],
};

describe("chartDataFromEmissionsHistory", () => {
  it("keeps a reported zero and leaves a missing total off the chart", () => {
    const data = chartDataFromEmissionsHistory(
      history([
        {
          year: 2020,
          total: 100,
          isAIGenerated: false,
          ...emptyScopes,
        },
        {
          year: 2021,
          total: null,
          isAIGenerated: false,
          ...emptyScopes,
        },
        {
          year: 2022,
          total: 0,
          isAIGenerated: true,
          ...emptyScopes,
        },
      ]),
    );

    expect(
      data
        .filter((point) => point.year <= 2022)
        .map((point) => [point.year, point.total, point.isAIGenerated]),
    ).toEqual([
      [2020, 100, false],
      [2021, undefined, false],
      [2022, 0, true],
    ]);

    const plotted = filterValidTotalData(data);
    expect(plotted.some((point) => point.year === 2021)).toBe(false);
    expect(plotted.find((point) => point.year === 2022)?.total).toBe(0);
  });
});

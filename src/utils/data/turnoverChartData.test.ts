import { describe, expect, it } from "vitest";
import {
  countTurnoverDataPoints,
  countCompleteTurnoverEmissionsDataPoints,
  filterCompleteTurnoverEmissionsData,
  filterValidTurnoverData,
  getLastTurnoverYear,
  hasEnoughTurnoverData,
} from "./turnoverChartData";

describe("turnoverChartData", () => {
  const periods = [
    {
      emissions: { calculatedTotalEmissions: 1000 },
      economy: { turnover: { value: 1_000_000, currency: "SEK" } },
    },
    {
      emissions: { calculatedTotalEmissions: 900 },
      economy: { turnover: { value: 2_000_000, currency: "SEK" } },
    },
    {
      emissions: { calculatedTotalEmissions: 500 },
      economy: { turnover: { value: null, currency: "SEK" } },
    },
  ] as Parameters<typeof countTurnoverDataPoints>[0];

  it("counts turnover data points", () => {
    expect(countTurnoverDataPoints(periods)).toBe(2);
  });

  it("counts years with both emissions and turnover", () => {
    expect(countCompleteTurnoverEmissionsDataPoints(periods)).toBe(2);
  });

  it("requires at least two complete data points", () => {
    expect(hasEnoughTurnoverData(periods)).toBe(true);
    expect(hasEnoughTurnoverData([periods[0]])).toBe(false);
    expect(
      hasEnoughTurnoverData([
        periods[0],
        { economy: { turnover: { value: 1_000_000, currency: "SEK" } } },
      ] as Parameters<typeof countTurnoverDataPoints>[0]),
    ).toBe(false);
  });

  it("filters valid turnover chart data", () => {
    expect(
      filterValidTurnoverData([
        { year: 2020, turnover: 0 },
        { year: 2021, turnover: 100 },
      ]),
    ).toEqual([{ year: 2021, turnover: 100 }]);
  });

  it("keeps only years with both emissions and turnover", () => {
    expect(
      filterCompleteTurnoverEmissionsData([
        { year: 2019, total: 1000, turnover: 1_000_000 },
        { year: 2020, total: 900 },
        { year: 2021, turnover: 2_000_000 },
        { year: 2022, total: 800, turnover: 2_500_000 },
      ]),
    ).toEqual([
      { year: 2019, total: 1000, turnover: 1_000_000 },
      { year: 2022, total: 800, turnover: 2_500_000 },
    ]);
  });

  it("returns the last year with turnover data", () => {
    expect(
      getLastTurnoverYear(
        [
          { year: 2020, turnover: 100 },
          { year: 2021, turnover: 200 },
        ],
        2019,
      ),
    ).toBe(2021);
  });
});

import { describe, expect, it } from "vitest";
import {
  countTurnoverDataPoints,
  countCompleteTurnoverEmissionsDataPoints,
  filterCompleteTurnoverEmissionsData,
  filterCompleteTurnoverEmissionsDataFromBaseYear,
  filterValidTurnoverData,
  getDecouplingComparison,
  getDecouplingVerdict,
  getLastTurnoverYear,
  hasEnoughChartDisplayData,
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

  it("returns green yes when turnover rises and emissions fall", () => {
    expect(getDecouplingVerdict(10, -10)).toBe("yes");
  });

  it("returns red no when turnover falls and emissions rise", () => {
    expect(getDecouplingVerdict(-10, 10)).toBe("no-red");
  });

  it("returns yellow no when both metrics are stable", () => {
    expect(getDecouplingVerdict(1, -1)).toBe("no-yellow");
  });

  it("compares from base year when available in complete data", () => {
    const comparison = getDecouplingComparison(
      [
        { year: 2018, total: 1000, turnover: 1_000_000 },
        { year: 2019, total: 900, turnover: 1_200_000 },
        { year: 2020, total: 800, turnover: 1_500_000 },
      ],
      2019,
    );

    expect(comparison).toMatchObject({
      startYear: 2019,
      endYear: 2020,
      verdict: "yes",
      usedBaseYear: true,
    });
  });

  it("compares from first complete year on or after base year", () => {
    const comparison = getDecouplingComparison(
      [
        { year: 2019, total: 1000, turnover: 1_000_000 },
        { year: 2020, total: 800, turnover: 1_500_000 },
      ],
      2018,
    );

    expect(comparison).toMatchObject({
      startYear: 2019,
      endYear: 2020,
      verdict: "yes",
      usedBaseYear: true,
    });
  });

  it("excludes complete data before base year from chart display", () => {
    expect(
      filterCompleteTurnoverEmissionsDataFromBaseYear(
        [
          { year: 2018, total: 1000, turnover: 1_000_000 },
          { year: 2019, total: 900, turnover: 1_200_000 },
          { year: 2020, total: 800, turnover: 1_500_000 },
        ],
        2019,
      ),
    ).toEqual([
      { year: 2019, total: 900, turnover: 1_200_000 },
      { year: 2020, total: 800, turnover: 1_500_000 },
    ]);
  });

  it("requires at least two data points after base year filtering", () => {
    expect(
      hasEnoughChartDisplayData(
        [{ year: 2018, total: 1000, turnover: 1_000_000 }],
        2019,
      ),
    ).toBe(false);
  });
});

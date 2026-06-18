import { describe, expect, it } from "vitest";
import {
  countTurnoverDataPoints,
  filterValidTurnoverData,
  getLastTurnoverYear,
  hasEnoughTurnoverData,
} from "./turnoverChartData";

describe("turnoverChartData", () => {
  const periods = [
    {
      economy: { turnover: { value: 1_000_000, currency: "SEK" } },
    },
    {
      economy: { turnover: { value: 2_000_000, currency: "SEK" } },
    },
    {
      economy: { turnover: { value: null, currency: "SEK" } },
    },
  ] as Parameters<typeof countTurnoverDataPoints>[0];

  it("counts turnover data points", () => {
    expect(countTurnoverDataPoints(periods)).toBe(2);
  });

  it("requires at least two turnover points", () => {
    expect(hasEnoughTurnoverData(periods)).toBe(true);
    expect(hasEnoughTurnoverData([periods[0]])).toBe(false);
  });

  it("filters valid turnover chart data", () => {
    expect(
      filterValidTurnoverData([
        { year: 2020, turnover: 0 },
        { year: 2021, turnover: 100 },
      ]),
    ).toEqual([{ year: 2021, turnover: 100 }]);
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

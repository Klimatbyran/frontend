import { describe, expect, it } from "vitest";
import { captionFromPathTotals } from "./twoFuturesComparisonPhrase";
import {
  buildTwoFuturesRows,
  compareFuturePathTotals,
} from "./twoFuturesChartData";
import type { DataPoint } from "@/types/emissions";

const currentYear = 2026;

describe("buildTwoFuturesRows", () => {
  it("keeps history in the past and splits futures from the current year", () => {
    const data: DataPoint[] = [
      {
        year: 2020,
        total: 100,
        trend: 90,
        approximated: undefined,
        carbonLaw: undefined,
      },
      {
        year: currentYear,
        total: undefined,
        approximated: 80,
        trend: 80,
        carbonLaw: 60,
      },
      {
        year: 2027,
        total: undefined,
        approximated: undefined,
        trend: 70,
        carbonLaw: 50,
      },
    ];

    const rows = buildTwoFuturesRows(data, currentYear);
    expect(rows[0].history).toBe(100);
    expect(rows[0].trend).toBeUndefined();
    expect(rows[1].history).toBe(80); // after last reported year → approximated
    expect(rows[1].trend).toBe(80);
    expect(rows[2].gap).toBe(20);
  });
});

describe("compareFuturePathTotals", () => {
  const data: DataPoint[] = [
    {
      year: currentYear,
      total: undefined,
      approximated: 80,
      trend: 80,
      carbonLaw: 60,
    },
    {
      year: 2027,
      total: undefined,
      approximated: undefined,
      trend: 70,
      carbonLaw: 70,
    },
    {
      year: 2028,
      total: undefined,
      approximated: undefined,
      trend: 50,
      carbonLaw: 40,
    },
  ];

  it("expresses an overshoot as a share of the Paris total and the trend total", () => {
    const comparison = compareFuturePathTotals(data, currentYear, 2028);
    expect(comparison.totalParis).toBe(170);
    expect(comparison.totalTrend).toBe(200);
    expect(comparison.endParis).toBe(40);
    expect(comparison.endTrend).toBe(50);
    expect(comparison.gapShareOfParis).toBeCloseTo(30 / 170);
    expect(comparison.gapShareOfTrend).toBeCloseTo(30 / 200);
  });

  it("expresses an undershoot when the trend total is below the Paris total", () => {
    const undershoot: DataPoint[] = [
      {
        year: currentYear,
        total: undefined,
        approximated: 40,
        trend: 40,
        carbonLaw: 50,
      },
      {
        year: 2027,
        total: undefined,
        approximated: undefined,
        trend: 30,
        carbonLaw: 50,
      },
    ];
    const comparison = compareFuturePathTotals(undershoot, currentYear, 2027);
    expect(comparison.gapShareOfParis).toBeCloseTo(-0.3);
    expect(comparison.gapShareOfTrend).toBeCloseTo(-30 / 70);
  });

  it("stops at the selected end year", () => {
    const comparison = compareFuturePathTotals(data, currentYear, currentYear);
    expect(comparison.totalParis).toBe(60);
    expect(comparison.totalTrend).toBe(80);
    expect(comparison.endParis).toBe(60);
    expect(comparison.endTrend).toBe(80);
    expect(comparison.gapShareOfParis).toBeCloseTo(20 / 60);
  });

  it("rounds a flat trend in 2050 to many times the Paris path", () => {
    const reduction = 0.1172;
    const flat = 2_242_227;
    const series: DataPoint[] = [];
    for (let year = currentYear; year <= 2050; year++) {
      const decline =
        ((flat - 2_116_472) / (2050 - currentYear)) * (year - currentYear);
      series.push({
        year,
        total: undefined,
        approximated: undefined,
        trend: flat - decline,
        carbonLaw: flat * (1 - reduction) ** (year - currentYear),
      });
    }

    const comparison = compareFuturePathTotals(series, currentYear, 2050);
    expect(comparison.endTrend / comparison.endParis).toBeGreaterThan(15);
    expect(
      captionFromPathTotals(comparison.endTrend, comparison.endParis),
    ).toEqual({ kind: "overshoot", times: 19 });
  });
});

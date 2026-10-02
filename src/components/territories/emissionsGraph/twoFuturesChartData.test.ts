import { describe, expect, it } from "vitest";
import {
  buildTwoFuturesRows,
  sumFutureOvershootTonnes,
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

describe("sumFutureOvershootTonnes", () => {
  it("sums positive gaps from the current year onward", () => {
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
    expect(sumFutureOvershootTonnes(data, currentYear)).toBe(30);
  });
});

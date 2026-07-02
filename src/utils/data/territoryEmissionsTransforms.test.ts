import { describe, expect, it } from "vitest";
import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import { transformTerritoryEmissionsData } from "./territoryEmissionsTransforms";

describe("transformTerritoryEmissionsData", () => {
  const territory = {
    emissions: [
      { year: 2024, value: 47_490_000 },
      { year: 2025, value: 46_000_000 },
    ],
    approximatedHistoricalEmission: [
      { year: 2024, value: 47_490_000 },
      { year: 2025, value: 46_000_000 },
      { year: 2026, value: 44_000_000 },
    ],
    trend: [
      { year: 2026, value: 44_000_000 },
      { year: 2027, value: 42_000_000 },
    ],
  };

  it("prorates current-year estimated values to year-to-date and projects trend from today", () => {
    const midYear = new Date("2026-07-02T12:00:00Z");
    const data = transformTerritoryEmissionsData(territory, midYear);
    const yearProgress =
      (midYear.getTime() - Date.UTC(2026, 0, 1)) /
      (Date.UTC(2027, 0, 1) - Date.UTC(2026, 0, 1));
    const annualSlope = 42_000 - 44_000;
    const trendAtToday = 44_000 + annualSlope * yearProgress;

    const point2025 = data.find((point) => point.year === 2025);
    const point2026 = data.find(
      (point) => point.year > 2026 && point.year < 2027,
    );
    const point2027 = data.find((point) => point.year === 2027);

    expect(point2025?.approximated).toBe(46_000);
    expect(point2026?.year).toBeCloseTo(2026 + yearProgress, 5);
    expect(point2026?.approximated).toBeCloseTo(44_000 * yearProgress, 0);
    expect(point2026?.trend).toBeCloseTo(trendAtToday, 0);
    expect(point2027?.trend).toBeCloseTo(
      trendAtToday + annualSlope * (2027 - (2026 + yearProgress)),
      0,
    );

    const todayPosition = 2026 + yearProgress;
    const parisAtToday =
      calculateParisValue(
        todayPosition,
        2026,
        44_000_000,
        CARBON_LAW_REDUCTION_RATE,
      )! / 1000;
    const parisAt2027 =
      parisAtToday *
      Math.pow(1 - CARBON_LAW_REDUCTION_RATE, 2027 - todayPosition);

    expect(point2026?.carbonLaw).toBeCloseTo(parisAtToday, 0);
    expect(point2027?.carbonLaw).toBeCloseTo(parisAt2027, 0);
  });

  it("leaves completed years unchanged", () => {
    const data = transformTerritoryEmissionsData(
      territory,
      new Date("2026-07-02T12:00:00Z"),
    );

    expect(data.find((point) => point.year === 2024)?.total).toBe(47_490);
    expect(data.find((point) => point.year === 2025)?.total).toBe(46_000);
  });
});

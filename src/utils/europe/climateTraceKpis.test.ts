import { describe, expect, it } from "vitest";
import {
  calculateClimateTraceCountryKpis,
  calculateHistoricalEmissionChangePercent,
  calculateMeetsParisFromTimeSeries,
  CLIMATE_TRACE_BASE_YEAR,
  getReportedClimateTraceEmissionsByYear,
} from "./climateTraceKpis";

describe("climateTraceKpis", () => {
  it("calculates annualized emissions change since 2015 (CAGR)", () => {
    const emissionsByYear = {
      2015: 100,
      2016: 95,
      2017: 90,
      2018: 85,
      2019: 80,
      2020: 75,
      2021: 70,
      2022: 65,
      2023: 60,
      2024: 55,
    };

    const change = calculateHistoricalEmissionChangePercent(emissionsByYear);

    expect(change).not.toBeNull();
    expect(change!).toBeCloseTo(-6.43, 1);
  });

  it("returns null when base year data is missing", () => {
    expect(
      calculateHistoricalEmissionChangePercent({
        2016: 100,
        2024: 80,
      }),
    ).toBeNull();
  });

  it("ignores partial years beyond the reported end year", () => {
    const change = calculateHistoricalEmissionChangePercent({
      2015: 100,
      2024: 80,
      2025: 70,
      2026: 10,
    });

    expect(change).not.toBeNull();
    expect(change!).toBeCloseTo(-3.5, 1);
  });

  it("returns true for steeply declining emissions trajectories", () => {
    const emissionsByYear = Object.fromEntries(
      Array.from({ length: 11 }, (_, index) => {
        const year = CLIMATE_TRACE_BASE_YEAR + index;
        return [year, 1_000_000 * 0.92 ** index];
      }),
    );

    expect(calculateMeetsParisFromTimeSeries(emissionsByYear)).toBe(true);
  });

  it("returns false for steeply increasing emissions trajectories", () => {
    const emissionsByYear = Object.fromEntries(
      Array.from({ length: 11 }, (_, index) => {
        const year = CLIMATE_TRACE_BASE_YEAR + index;
        return [year, 1_000_000 * 1.05 ** index];
      }),
    );

    expect(calculateMeetsParisFromTimeSeries(emissionsByYear)).toBe(false);
  });

  it("drops partial years beyond the reported end year", () => {
    const reported = getReportedClimateTraceEmissionsByYear({
      2024: 100,
      2025: 90,
      2026: 20,
    });

    expect(reported).toEqual({ 2024: 100, 2025: 90 });
  });

  it("does not treat partial current-year totals as meeting Paris", () => {
    const ukraineLikeEmissions = {
      2015: 428_893_988,
      2016: 437_072_633,
      2017: 421_874_251,
      2018: 427_715_432,
      2019: 414_266_963,
      2020: 420_852_391,
      2021: 402_639_803,
      2022: 330_331_647,
      2023: 309_412_492,
      2024: 303_847_520,
      2025: 315_391_576,
      2026: 94_674_716,
    };

    expect(calculateMeetsParisFromTimeSeries(ukraineLikeEmissions)).toBe(false);
    expect(
      calculateClimateTraceCountryKpis(ukraineLikeEmissions).meetsParis,
    ).toBe(false);
  });

  it("calculates both KPIs together", () => {
    const emissionsByYear = {
      2015: 1_000_000,
      2016: 980_000,
      2017: 960_000,
      2018: 940_000,
      2019: 920_000,
      2020: 900_000,
      2021: 880_000,
      2022: 860_000,
      2023: 840_000,
      2024: 820_000,
      2025: 800_000,
    };

    const kpis = calculateClimateTraceCountryKpis(emissionsByYear);

    expect(kpis.historicalEmissionChangePercent).not.toBeNull();
    expect(typeof kpis.meetsParis).toBe("boolean");
  });
});

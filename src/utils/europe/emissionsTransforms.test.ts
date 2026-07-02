import { describe, expect, it } from "vitest";
import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import {
  CLIMATE_TRACE_PROJECTION_START_YEAR,
  reportingYearToChartYear,
} from "@/utils/europe/climateTraceKpis";
import { transformEuropeanCountryEmissionsData } from "./emissionsTransforms";

describe("transformEuropeanCountryEmissionsData", () => {
  const emissionsByYear = Object.fromEntries(
    Array.from({ length: 11 }, (_, index) => {
      const year = 2015 + index;
      return [year, 1_000_000 * 0.95 ** index];
    }),
  );

  it("plots reported totals at the following year's boundary", () => {
    const data = transformEuropeanCountryEmissionsData(emissionsByYear);

    expect(data.length).toBeGreaterThan(0);

    const point2016 = data.find((point) => point.year === 2016);
    expect(point2016?.total).toBe(1_000_000);
    expect(point2016?.trend).toBeUndefined();
    expect(point2016?.carbonLaw).toBeUndefined();

    const point2026 = data.find((point) => point.year === 2026);
    expect(point2026?.total).toBe(emissionsByYear[2025]);
    expect(point2026?.trend).toBeDefined();
    expect(point2026?.carbonLaw).toBeDefined();
  });

  it("starts the trend line at the orange projection marker on the chart", () => {
    const data = transformEuropeanCountryEmissionsData(emissionsByYear);
    const markerYear = CLIMATE_TRACE_PROJECTION_START_YEAR;

    expect(
      data.find((point) => point.year === markerYear)?.trend,
    ).toBeDefined();
    expect(
      data.find((point) => point.year === markerYear - 1)?.trend,
    ).toBeUndefined();
    expect(
      data.find((point) => point.year === markerYear + 1)?.trend,
    ).toBeDefined();
  });

  it("anchors the trend line to the last reported total at the orange marker", () => {
    const data = transformEuropeanCountryEmissionsData(emissionsByYear);
    const markerPoint = data.find(
      (point) => point.year === CLIMATE_TRACE_PROJECTION_START_YEAR,
    );

    expect(markerPoint?.total).toBe(emissionsByYear[2025]);
    expect(markerPoint?.trend).toBe(emissionsByYear[2025]);
  });

  it("anchors the Paris path at the last reported year on the 2026 boundary", () => {
    const data = transformEuropeanCountryEmissionsData(emissionsByYear);
    const emissions2025 = emissionsByYear[2025];

    const parisAt2025 = calculateParisValue(
      2025,
      2025,
      emissions2025,
      CARBON_LAW_REDUCTION_RATE,
    )!;

    expect(
      data.find((point) => point.year === reportingYearToChartYear(2025))
        ?.carbonLaw,
    ).toBeCloseTo(parisAt2025, 0);
  });

  it("returns empty array when no emissions data is provided", () => {
    expect(transformEuropeanCountryEmissionsData({})).toEqual([]);
  });

  it("ignores partial current-year totals beyond the reported end year", () => {
    const emissionsWithPartial2026 = Object.fromEntries(
      Array.from({ length: 12 }, (_, index) => {
        const year = 2015 + index;
        return [year, 1_000_000 * 0.95 ** index];
      }),
    );

    const data = transformEuropeanCountryEmissionsData(
      emissionsWithPartial2026,
    );

    expect(data.find((point) => point.year === 2025)?.total).toBeDefined();
    expect(data.find((point) => point.year === 2026)?.total).toBeDefined();
    expect(data.find((point) => point.year === 2026)?.trend).toBeDefined();
    expect(data.find((point) => point.year === 2026)?.carbonLaw).toBeDefined();
    expect(data.find((point) => point.year === 2027)?.total).toBeUndefined();
    expect(data.find((point) => point.year === 2027)?.trend).toBeDefined();
    expect(data.find((point) => point.year === 2027)?.carbonLaw).toBeDefined();
  });
});

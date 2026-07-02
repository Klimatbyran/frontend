import { describe, expect, it } from "vitest";
import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import { transformEuropeanCountryEmissionsData } from "./emissionsTransforms";

describe("transformEuropeanCountryEmissionsData", () => {
  const emissionsByYear = Object.fromEntries(
    Array.from({ length: 11 }, (_, index) => {
      const year = 2015 + index;
      return [year, 1_000_000 * 0.95 ** index];
    }),
  );

  it("builds chart data with reported totals through 2025 and projections from 2025", () => {
    const data = transformEuropeanCountryEmissionsData(emissionsByYear);

    expect(data.length).toBeGreaterThan(0);

    const point2015 = data.find((point) => point.year === 2015);
    expect(point2015?.total).toBe(1_000_000);
    expect(point2015?.trend).toBeUndefined();
    expect(point2015?.carbonLaw).toBeUndefined();

    const point2025 = data.find((point) => point.year === 2025);
    expect(point2025?.total).toBeDefined();
    expect(point2025?.trend).toBeDefined();
    expect(point2025?.carbonLaw).toBeDefined();

    const point2026 = data.find((point) => point.year === 2026);
    expect(point2026?.total).toBeUndefined();
    expect(point2026?.trend).toBeDefined();
    expect(point2026?.carbonLaw).toBeDefined();
  });

  it("anchors the Paris path at the last reported year so lines connect at 2025", () => {
    const data = transformEuropeanCountryEmissionsData(emissionsByYear);
    const emissions2025 = emissionsByYear[2025];

    const parisAt2025 = calculateParisValue(
      2025,
      2025,
      emissions2025,
      CARBON_LAW_REDUCTION_RATE,
    )!;

    expect(data.find((point) => point.year === 2025)?.carbonLaw).toBeCloseTo(
      parisAt2025,
      0,
    );
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

    expect(data.find((point) => point.year === 2024)?.total).toBeDefined();
    expect(data.find((point) => point.year === 2025)?.total).toBeDefined();
    expect(data.find((point) => point.year === 2025)?.trend).toBeDefined();
    expect(data.find((point) => point.year === 2025)?.carbonLaw).toBeDefined();
    expect(data.find((point) => point.year === 2026)?.total).toBeUndefined();
    expect(data.find((point) => point.year === 2026)?.trend).toBeDefined();
    expect(data.find((point) => point.year === 2026)?.carbonLaw).toBeDefined();
  });
});

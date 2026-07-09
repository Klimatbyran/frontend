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

  it("ends reported data at the last emissions year and starts projections from 2026", () => {
    const data = transformTerritoryEmissionsData(territory);

    expect(data.find((point) => point.year === 2024)?.total).toBe(47_490);
    expect(data.find((point) => point.year === 2025)?.total).toBe(46_000);
    expect(
      data.find((point) => point.year === 2025)?.approximated,
    ).toBeUndefined();
    expect(data.find((point) => point.year === 2025)?.trend).toBeUndefined();
    expect(data.find((point) => point.year === 2026)?.total).toBeUndefined();
    expect(data.find((point) => point.year === 2026)?.approximated).toBe(
      44_000,
    );
    expect(data.find((point) => point.year === 2026)?.trend).toBe(44_000);
    expect(data.find((point) => point.year === 2027)?.trend).toBe(42_000);
  });

  it("anchors the Paris path at the last reported year", () => {
    const data = transformTerritoryEmissionsData(territory);

    const parisAt2025 =
      calculateParisValue(2025, 2025, 46_000_000, CARBON_LAW_REDUCTION_RATE)! /
      1000;
    const parisAt2026 =
      calculateParisValue(2026, 2025, 46_000_000, CARBON_LAW_REDUCTION_RATE)! /
      1000;

    expect(data.find((point) => point.year === 2025)?.carbonLaw).toBeCloseTo(
      parisAt2025,
      0,
    );
    expect(data.find((point) => point.year === 2026)?.carbonLaw).toBeCloseTo(
      parisAt2026,
      0,
    );
  });

  it("does not mark reported emissions years as approximated", () => {
    const data = transformTerritoryEmissionsData(territory);

    expect(
      data.find((point) => point.year === 2024)?.approximated,
    ).toBeUndefined();
    expect(
      data.find((point) => point.year === 2025)?.approximated,
    ).toBeUndefined();
  });
});

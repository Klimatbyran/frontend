import { describe, expect, it } from "vitest";
import {
  computeNationDerivedMetrics,
  extractYearRecord,
} from "@/utils/data/nationTerritorialTransforms";

const territorialFixture: Record<number, number> = {
  1990: 71260000,
  2015: 53250000,
  2020: 45970000,
  2023: 44230000,
  2024: 47490000,
};

describe("extractYearRecord", () => {
  it("parses API array format", () => {
    expect(
      extractYearRecord([
        { year: "2015", value: 100 },
        null,
        { year: "2020", value: 80 },
      ]),
    ).toEqual({ 2015: 100, 2020: 80 });
  });

  it("parses yearly record format", () => {
    expect(extractYearRecord({ "2015": 100, "2020": 80 })).toEqual({
      2015: 100,
      2020: 80,
    });
  });
});

describe("computeNationDerivedMetrics", () => {
  it("derives CAGR from 2015 to 2024", () => {
    const derived = computeNationDerivedMetrics(territorialFixture, 2026);

    expect(derived.historicalEmissionChangePercent).toBeCloseTo(-1.24, 1);
  });

  it("maps territorial fossil emissions to the emissions series", () => {
    const derived = computeNationDerivedMetrics(territorialFixture, 2026);

    expect(derived.emissions).toEqual([
      { year: 1990, value: 71260000 },
      { year: 2015, value: 53250000 },
      { year: 2020, value: 45970000 },
      { year: 2023, value: 44230000 },
      { year: 2024, value: 47490000 },
    ]);
  });

  it("produces approximated and trend series for charts", () => {
    const derived = computeNationDerivedMetrics(territorialFixture, 2026);

    expect(derived.approximatedHistoricalEmission.length).toBeGreaterThan(0);
    expect(derived.trend.some((point) => point?.year === 2050)).toBe(true);
    expect(typeof derived.meetsParis).toBe("boolean");
  });
});

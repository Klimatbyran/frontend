import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEuropeanCountryKpiComparisons } from "@/hooks/europe/useEuropeanCountryKpiComparisons";
import { EuropeanCountryDetails } from "@/hooks/europe/useEuropeanCountryDetails";

vi.mock("@/hooks/europe/useEuropeanKpiAverages", () => ({
  useEuropeanKpiAverages: () => ({
    historicalEmissionChangePercent: -2,
    totalEmissions2025: 40_000_000,
    emissionsPerCapita: 5,
  }),
}));

const country: EuropeanCountryDetails = {
  iso3: "SWE",
  iso2: "SE",
  name: "Sweden",
  englishName: "Sweden",
  emissionsByYear: { 2025: 50_000_000 },
  sectorEmissionsByYear: {},
  emissionsPerCapita: 4,
  historicalEmissionChangePercent: -3,
  meetsParis: true,
};

describe("useEuropeanCountryKpiComparisons", () => {
  it("builds comparison values for each KPI", () => {
    const { result } = renderHook(() =>
      useEuropeanCountryKpiComparisons(country, 2025),
    );

    expect(result.current).toEqual({
      changeSince2015: {
        countryValue: -3,
        averageValue: -2,
      },
      totalEmissions: {
        countryValue: 50_000_000,
        averageValue: 40_000_000,
        year: 2025,
      },
      emissionsPerCapita: {
        countryValue: 4,
        averageValue: 5,
      },
    });
  });

  it("returns null when country or year is missing", () => {
    const { result } = renderHook(() =>
      useEuropeanCountryKpiComparisons(null, 2025),
    );

    expect(result.current).toBeNull();
  });
});

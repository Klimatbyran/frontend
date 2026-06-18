import { describe, expect, it } from "vitest";
import {
  calculateEmissionsIntensity,
  countIntensityDataPoints,
  getEmissionsIntensityData,
  getEmissionsIntensitySummary,
  hasEnoughIntensityData,
} from "./emissionsIntensityData";

describe("emissionsIntensityData", () => {
  const periods = [
    {
      startDate: "2019-01-01",
      endDate: "2019-12-31",
      emissions: { calculatedTotalEmissions: 1000 },
      economy: { turnover: { value: 1_000_000, currency: "SEK" } },
    },
    {
      startDate: "2020-01-01",
      endDate: "2020-12-31",
      emissions: { calculatedTotalEmissions: 900 },
      economy: { turnover: { value: 1_200_000, currency: "SEK" } },
    },
    {
      startDate: "2021-01-01",
      endDate: "2021-12-31",
      emissions: { calculatedTotalEmissions: 500 },
      economy: { turnover: { value: null, currency: "SEK" } },
    },
  ] as Parameters<typeof getEmissionsIntensityData>[0];

  const isAIGenerated = () => false;
  const isEmissionsAIGenerated = () => false;

  it("calculates intensity per million currency units", () => {
    expect(calculateEmissionsIntensity(1000, 1_000_000)).toBe(1000);
  });

  it("counts valid intensity data points", () => {
    expect(countIntensityDataPoints(periods)).toBe(2);
    expect(hasEnoughIntensityData(periods)).toBe(true);
  });

  it("builds indexed growth data and intensity changes", () => {
    const data = getEmissionsIntensityData(
      periods,
      isAIGenerated,
      isEmissionsAIGenerated,
    );

    expect(data).toHaveLength(2);
    expect(data[1].intensity).toBeLessThan(data[0].intensity!);
    expect(data[1].intensityChangeFromPreviousYear).toBeLessThan(0);
  });

  it("summarises improving intensity trend", () => {
    const data = getEmissionsIntensityData(
      periods,
      isAIGenerated,
      isEmissionsAIGenerated,
    );
    const summary = getEmissionsIntensitySummary(data);

    expect(summary?.trend).toBe("improving");
    expect(summary?.changeFromFirstYearPercent).toBeLessThan(0);
  });
});

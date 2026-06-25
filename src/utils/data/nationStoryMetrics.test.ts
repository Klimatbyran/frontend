import { describe, expect, it } from "vitest";
import nationFixture from "@/data/nation-data.fixture.json";
import {
  NATION_BASELINE_YEAR,
  buildStackChartData,
  computeNationStoryMetrics,
  percentChange,
  sumSeriesAtYear,
  toMton,
} from "@/utils/data/nationStoryMetrics";
import type { NationEmissionSeries } from "@/utils/data/nationStoryMetrics";

function fixtureToSeries(): NationEmissionSeries {
  const raw = nationFixture[0] as {
    territorialFossilEmissions: Record<string, number>;
    biogenicEmissions: Record<string, number>;
    consumptionAbroadEmissions: Record<string, number>;
    eCommerceEmissions: Record<string, number>;
  };

  const toRecord = (input: Record<string, number>) =>
    Object.fromEntries(
      Object.entries(input).map(([year, value]) => [Number(year), value]),
    );

  return {
    territorialFossil: toRecord(raw.territorialFossilEmissions),
    biogenic: toRecord(raw.biogenicEmissions),
    consumptionAbroad: toRecord(raw.consumptionAbroadEmissions),
    eCommerce: toRecord(raw.eCommerceEmissions),
  };
}

describe("nationStoryMetrics", () => {
  const series = fixtureToSeries();

  it("computes combined totals for 1990 and 2024 from fixture", () => {
    const combined1990 = sumSeriesAtYear(series, NATION_BASELINE_YEAR);
    const combined2024 = sumSeriesAtYear(series, 2024);

    expect(toMton(combined1990)).toBeCloseTo(165.3, 0);
    expect(toMton(combined2024)).toBeCloseTo(155.3, 0);
  });

  it("computes roughly 3x ratio between full and reported emissions in 2024", () => {
    const metrics = computeNationStoryMetrics(series);

    expect(metrics.latestYear).toBe(2024);
    expect(metrics.ratioReportedToFull).toBeGreaterThan(3);
    expect(metrics.ratioReportedToFull).toBeLessThan(3.5);
  });

  it("shows biogenic emissions more than doubled since 1990", () => {
    const metrics = computeNationStoryMetrics(series);

    expect(metrics.biogenicChangePercent).toBeGreaterThan(100);
  });

  it("shows production plus biogenic increased since 1990", () => {
    const metrics = computeNationStoryMetrics(series);

    expect(metrics.prodBiogenicChangePercent).toBeGreaterThan(0);
  });

  it("shows consumption abroad declined since 1990", () => {
    const metrics = computeNationStoryMetrics(series);

    expect(metrics.consumptionChangePercent).toBeLessThan(0);
    expect(metrics.consumptionLatestMton).toBeGreaterThan(
      metrics.territorialLatestMton,
    );
  });

  it("includes e-commerce emissions for 2024", () => {
    const metrics = computeNationStoryMetrics(series);

    expect(metrics.eCommerceLatestTonnes).toBe(403630);
  });

  it("builds stacked chart data in Mton", () => {
    const stackData = buildStackChartData(series);
    const point1990 = stackData.find((point) => point.year === 1990);
    const point2024 = stackData.find((point) => point.year === 2024);

    expect(point1990?.combined).toBeCloseTo(165.3, 0);
    expect(point2024?.combined).toBeCloseTo(155.3, 0);
  });

  it("calculates percent change correctly", () => {
    expect(percentChange(100, 150)).toBe(50);
    expect(percentChange(200, 100)).toBe(-50);
  });
});

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
    productionBasedEmissions: Record<string, number>;
    biogenicEmissions: Record<string, number>;
    consumptionAbroadEmissions: Record<string, number>;
  };

  const toRecord = (input: Record<string, number>) =>
    Object.fromEntries(
      Object.entries(input).map(([year, value]) => [Number(year), value]),
    );

  return {
    territorialFossil: toRecord(raw.territorialFossilEmissions),
    productionBased: toRecord(raw.productionBasedEmissions),
    biogenic: toRecord(raw.biogenicEmissions),
    consumptionAbroad: toRecord(raw.consumptionAbroadEmissions),
  };
}

describe("nationStoryMetrics", () => {
  const series = fixtureToSeries();

  it("computes combined totals for 1990 and 2024 from fixture", () => {
    const combined1990 = sumSeriesAtYear(series, NATION_BASELINE_YEAR);
    const combined2024 = sumSeriesAtYear(series, 2024);

    expect(toMton(combined1990)).toBeCloseTo(167.4, 0);
    expect(toMton(combined2024)).toBeCloseTo(159.9, 0);
  });

  it("computes roughly 3x ratio between full and reported emissions in 2024", () => {
    const metrics = computeNationStoryMetrics(series);

    expect(metrics.latestYear).toBe(2024);
    expect(metrics.ratioReportedToFull).toBeGreaterThan(3);
    expect(metrics.ratioReportedToFull).toBeLessThan(3.5);
  });

  it("computes per-category change since 1990", () => {
    const metrics = computeNationStoryMetrics(series);

    expect(metrics.territorialChangePercent).toBeLessThan(0);
    expect(metrics.biogenicChangePercent).toBeGreaterThan(100);
  });

  it("builds stacked chart data in Mton", () => {
    const stackData = buildStackChartData(series);
    const point2024 = stackData.find((point) => point.year === 2024);

    expect(point2024?.combined).toBeCloseTo(159.9, 0);
    expect(point2024?.territorialFossil).toBeCloseTo(47.5, 0);
    expect(point2024?.productionBeyondTerritorial).toBeCloseTo(4.6, 0);
    expect(point2024?.biogenic).toBeCloseTo(47.4, 0);
  });

  it("builds trend and bathtub series alongside stack metrics", () => {
    const metrics = computeNationStoryMetrics(series);

    expect(metrics.lineData[0]?.year).toBe(NATION_BASELINE_YEAR);
    expect(metrics.lineData.at(-1)?.year).toBe(metrics.latestYear);
    expect(metrics.bathtubData[0]?.cumulativeMton).toBeCloseTo(
      metrics.bathtubData[0]?.annualMton ?? 0,
      5,
    );
    expect(metrics.bathtubData.at(-1)?.cumulativeMton).toBeGreaterThan(
      metrics.bathtubData[0]?.cumulativeMton ?? 0,
    );
  });

  it("calculates percent change correctly", () => {
    expect(percentChange(100, 150)).toBe(50);
    expect(percentChange(200, 100)).toBe(-50);
  });

  it("excludes years with missing layers from stack chart data", () => {
    const incompleteSeries: NationEmissionSeries = {
      ...series,
      consumptionAbroad: Object.fromEntries(
        Object.entries(series.consumptionAbroad).filter(
          ([year]) => year !== "2024",
        ),
      ),
    };

    const stackData = buildStackChartData(incompleteSeries);

    expect(stackData.some((point) => point.year === 2024)).toBe(false);
    expect(stackData.at(-1)?.year).toBe(2023);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateApproximatedData } from "./approximatedData";
import type { ChartData } from "@/types/emissions";

const CARBON_LAW_REDUCTION_RATE = 0.1172;
const CURRENT_YEAR = 2026;

const historicalData: ChartData[] = [
  { year: 2022, total: 1000 },
  { year: 2024, total: 800 },
];

const linearCoefficients = { slope: -100, intercept: 800 + 100 * 2024 };

describe("company Paris line", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${CURRENT_YEAR}-10-06T12:00:00Z`));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts at the current year and decreases by Carbon Law", () => {
    const result = generateApproximatedData(
      historicalData,
      2028,
      linearCoefficients,
    );

    const byYear = new Map(
      result.map((point) => [point.year, point.carbonLaw]),
    );

    expect(byYear.get(2024)).toBeNull();
    expect(byYear.get(2025)).toBeNull();

    // Last reported year is 2024 at 800; slope is -100 tonnes per year.
    const startEmissions =
      800 + linearCoefficients.slope * (CURRENT_YEAR - 2024);
    expect(byYear.get(CURRENT_YEAR)).toBeCloseTo(startEmissions);
    expect(byYear.get(CURRENT_YEAR + 1)).toBeCloseTo(
      startEmissions * (1 - CARBON_LAW_REDUCTION_RATE),
    );
    expect(byYear.get(CURRENT_YEAR + 2)).toBeCloseTo(
      startEmissions * (1 - CARBON_LAW_REDUCTION_RATE) ** 2,
    );
  });

  it("uses reported emissions for the current year as the starting point", () => {
    const result = generateApproximatedData(
      [...historicalData, { year: CURRENT_YEAR, total: 500 }],
      CURRENT_YEAR + 1,
      linearCoefficients,
    );

    const byYear = new Map(
      result.map((point) => [point.year, point.carbonLaw]),
    );

    expect(byYear.get(CURRENT_YEAR)).toBeCloseTo(500);
    expect(byYear.get(CURRENT_YEAR + 1)).toBeCloseTo(
      500 * (1 - CARBON_LAW_REDUCTION_RATE),
    );
  });
});

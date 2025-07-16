import {
  calculateWeightedLinearRegression,
  calculateTrendSlope,
} from "@/lib/calculations/trends/regression";
import { toDataPoints } from "../companyEmissionsCalculations";

describe("calculateWeightedLinearRegression", () => {
  it("should return null for less than 2 points", () => {
    expect(calculateWeightedLinearRegression([])).toBeNull();
    expect(
      calculateWeightedLinearRegression([{ year: 2020, value: 100 }]),
    ).toBeNull();
  });

  it("should match trend slope for 2 points", () => {
    const data = [
      { year: 2020, value: 100 },
      { year: 2021, value: 110 },
    ];
    const weighted = calculateWeightedLinearRegression(data);
    const slope = calculateTrendSlope(data);
    expect(weighted?.slope).toBeCloseTo(slope, 10);
  });

  it("should give more weight to recent points", () => {
    const data = [
      { year: 2020, value: 100 },
      { year: 2021, value: 110 },
      { year: 2022, value: 120 },
      { year: 2023, value: 200 }, // Outlier
    ];
    const weighted = calculateWeightedLinearRegression(data);
    expect(weighted).not.toBeNull();
    // Slope should be positive and less than if the outlier dominated
    expect(weighted!.slope).toBeGreaterThan(0);
    expect(weighted!.slope).toBeLessThan(100);
  });
});

describe("toDataPoints", () => {
  it("should filter out undefined totals and map to DataPoint[]", () => {
    const testData: Array<{ year: number; total?: number }> = [
      { year: 2020, total: 100 },
      { year: 2021, total: undefined },
      { year: 2022, total: 200 },
    ];
    const result = toDataPoints(testData as any);
    expect(result).toEqual([
      { year: 2020, value: 100 },
      { year: 2022, value: 200 },
    ]);
  });
});

import {
  calculateRecentStability,
  detectUnusualEmissionsPointsEnhanced,
} from "../analysis";
import { calculateTrendSlope, calculateLinearRegression } from "../regression";
import {
  calculateR2Linear,
  calculateR2Exponential,
  calculateBasicStatistics,
} from "../statistics";

describe("Trend Analysis Functions", () => {
  describe("calculateLinearRegression", () => {
    it("should calculate correct slope and intercept for simple linear data", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 110 },
        { year: 2022, value: 120 },
      ];
      const result = calculateLinearRegression(data);
      expect(result).toEqual({ slope: 10, intercept: 100 });
    });

    it("should return null for insufficient data", () => {
      expect(calculateLinearRegression([])).toBeNull();
      expect(
        calculateLinearRegression([{ year: 2020, value: 100 }]),
      ).toBeNull();
    });

    it("should handle negative slopes", () => {
      const data = [
        { year: 2020, value: 120 },
        { year: 2021, value: 110 },
        { year: 2022, value: 100 },
      ];
      const result = calculateLinearRegression(data);
      expect(result).toEqual({ slope: -10, intercept: 120 });
    });
  });

  describe("calculateTrendSlope", () => {
    it("should calculate correct slope for simple linear data", () => {
      const data = [
        { year: 1, value: 2 },
        { year: 2, value: 4 },
        { year: 3, value: 6 },
      ];

      const result = calculateTrendSlope(data);
      expect(result).toBeCloseTo(2, 10);
    });

    it("should calculate correct slope for data with intercept", () => {
      const data = [
        { year: 1, value: 3 },
        { year: 2, value: 5 },
        { year: 3, value: 7 },
      ];

      const result = calculateTrendSlope(data);
      expect(result).toBeCloseTo(2, 10);
    });

    it("should return 0 for insufficient data", () => {
      const data = [{ year: 1, value: 2 }];
      const result = calculateTrendSlope(data);
      expect(result).toBe(0);
    });

    it("should handle negative slopes", () => {
      const data = [
        { year: 1, value: 6 },
        { year: 2, value: 4 },
        { year: 3, value: 2 },
      ];

      const result = calculateTrendSlope(data);
      expect(result).toBeCloseTo(-2, 10);
    });

    it("should handle real-world emissions data", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 95 },
        { year: 2022, value: 90 },
      ];

      const result = calculateTrendSlope(data);
      expect(result).toBeCloseTo(-5, 1);
    });
  });

  describe("calculateR2Linear", () => {
    it("should return 1 for perfect linear fit", () => {
      const data = [
        { year: 1, value: 2 },
        { year: 2, value: 4 },
        { year: 3, value: 6 },
      ];

      const result = calculateR2Linear(data);
      expect(result).toBeCloseTo(1, 10);
    });

    it("should return 0 for insufficient data", () => {
      const data = [{ year: 1, value: 2 }];
      const result = calculateR2Linear(data);
      expect(result).toBe(0);
    });

    it("should handle noisy data", () => {
      const data = [
        { year: 1, value: 2.1 },
        { year: 2, value: 3.9 },
        { year: 3, value: 6.2 },
      ];

      const result = calculateR2Linear(data);
      expect(result).toBeGreaterThan(0.9);
      expect(result).toBeLessThan(1);
    });
  });

  describe("calculateR2Exponential", () => {
    it("should handle exponential data", () => {
      const data = [
        { year: 1, value: 10 },
        { year: 2, value: 20 },
        { year: 3, value: 40 },
      ];

      const result = calculateR2Exponential(data);
      expect(result).toBeGreaterThan(0.9);
    });

    it("should return 0 for insufficient data", () => {
      const data = [{ year: 1, value: 10 }];
      const result = calculateR2Exponential(data);
      expect(result).toBe(0);
    });

    it("should handle zero or negative values", () => {
      const data = [
        { year: 1, value: 0 },
        { year: 2, value: 10 },
        { year: 3, value: 20 },
      ];

      const result = calculateR2Exponential(data);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("calculateBasicStatistics", () => {
    it("should calculate correct statistics", () => {
      const data = [
        { year: 1, value: 10 },
        { year: 2, value: 20 },
        { year: 3, value: 30 },
      ];

      const result = calculateBasicStatistics(data);
      expect(result.mean).toBeCloseTo(20, 10);
      expect(result.min).toBe(10);
      expect(result.max).toBe(30);
      expect(result.span).toBe(20);
      expect(result.stdDev).toBeGreaterThan(0);
      expect(result.variance).toBeGreaterThan(0);
    });

    it("should handle single data point", () => {
      const data = [{ year: 1, value: 10 }];

      const result = calculateBasicStatistics(data);
      expect(result.mean).toBe(10);
      expect(result.min).toBe(10);
      expect(result.max).toBe(10);
      expect(result.span).toBe(0);
      expect(result.stdDev).toBe(0);
      expect(result.variance).toBe(0);
    });
  });

  describe("detectUnusualEmissionsPoints", () => {
    it("should detect unusual points", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 105 },
        { year: 2022, value: 500 }, // Very unusual jump (376% increase)
        { year: 2023, value: 110 },
      ];

      const result = detectUnusualEmissionsPointsEnhanced(data);
      expect(result.hasUnusualPoints).toBe(true);
      expect(result.details).toBeDefined();
      expect(result.details?.length).toBeGreaterThan(0);
    });

    it("should not detect unusual points in stable data", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 105 },
        { year: 2022, value: 110 },
        { year: 2023, value: 115 },
      ];

      const result = detectUnusualEmissionsPointsEnhanced(data);
      expect(result.hasUnusualPoints).toBe(false);
    });

    it("should return false for insufficient data", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 105 },
      ];

      const result = detectUnusualEmissionsPointsEnhanced(data);
      expect(result.hasUnusualPoints).toBe(false);
    });
  });

  describe("calculateRecentStability", () => {
    it("should calculate stability for recent data", () => {
      const data = [
        { year: 2019, value: 100 },
        { year: 2020, value: 105 },
        { year: 2021, value: 110 },
        { year: 2022, value: 115 },
      ];

      const result = calculateRecentStability(data, 4);
      expect(result).toBeGreaterThan(0);
    });

    it("should return 0 for insufficient data", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 105 },
      ];

      const result = calculateRecentStability(data, 4);
      expect(result).toBe(0);
    });
  });
});

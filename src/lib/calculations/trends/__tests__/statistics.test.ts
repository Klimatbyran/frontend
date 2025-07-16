import { describe, it, expect } from "vitest";
import {
  calculateR2Linear,
  calculateR2Exponential,
  calculateBasicStatistics,
  calculateStandardDeviation,
} from "../statistics";

describe("Statistics and R² Functions", () => {
  describe("calculateR2Linear", () => {
    it("should return 0 for empty data", () => {
      expect(calculateR2Linear([])).toBe(0);
    });

    it("should return 0 for single data point", () => {
      expect(calculateR2Linear([{ year: 2020, value: 100 }])).toBe(0);
    });

    it("should return 1 for perfect linear data", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 110 },
        { year: 2022, value: 120 },
      ];
      expect(calculateR2Linear(data)).toBeCloseTo(1, 3);
    });

    it("should calculate R² for noisy linear data", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 105 },
        { year: 2022, value: 115 },
        { year: 2023, value: 120 },
      ];
      const r2 = calculateR2Linear(data);
      expect(r2).toBeGreaterThan(0.8);
      expect(r2).toBeLessThan(1);
    });

    it("should handle negative values", () => {
      const data = [
        { year: 2020, value: -100 },
        { year: 2021, value: -90 },
        { year: 2022, value: -80 },
      ];
      expect(calculateR2Linear(data)).toBeCloseTo(1, 3);
    });
  });

  describe("calculateR2Exponential", () => {
    it("should return 0 for empty data", () => {
      expect(calculateR2Exponential([])).toBe(0);
    });

    it("should return 0 for single data point", () => {
      expect(calculateR2Exponential([{ year: 2020, value: 100 }])).toBe(0);
    });

    it("should return 0 for data with non-positive values", () => {
      const data = [
        { year: 2020, value: 0 },
        { year: 2021, value: -10 },
      ];
      expect(calculateR2Exponential(data)).toBe(0);
    });

    it("should calculate R² for exponential data", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 110 },
        { year: 2022, value: 121 },
        { year: 2023, value: 133.1 },
      ];
      const r2 = calculateR2Exponential(data);
      expect(r2).toBeGreaterThan(0.9);
      expect(r2).toBeLessThanOrEqual(1);
    });

    it("should handle exponential growth", () => {
      const data = [
        { year: 2020, value: 10 },
        { year: 2021, value: 20 },
        { year: 2022, value: 40 },
        { year: 2023, value: 80 },
      ];
      const r2 = calculateR2Exponential(data);
      expect(r2).toBeCloseTo(1, 3);
    });
  });

  describe("calculateBasicStatistics", () => {
    it("should return zeros for empty data", () => {
      const stats = calculateBasicStatistics([]);
      expect(stats).toEqual({
        mean: 0,
        variance: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        span: 0,
      });
    });

    it("should calculate statistics for single value", () => {
      const data = [{ year: 2020, value: 100 }];
      const stats = calculateBasicStatistics(data);
      expect(stats.mean).toBe(100);
      expect(stats.variance).toBe(0);
      expect(stats.stdDev).toBe(0);
      expect(stats.min).toBe(100);
      expect(stats.max).toBe(100);
      expect(stats.span).toBe(0);
    });

    it("should calculate statistics for multiple values", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 110 },
        { year: 2022, value: 120 },
      ];
      const stats = calculateBasicStatistics(data);
      expect(stats.mean).toBe(110);
      expect(stats.variance).toBeCloseTo(66.67, 1);
      expect(stats.stdDev).toBeCloseTo(8.16, 1);
      expect(stats.min).toBe(100);
      expect(stats.max).toBe(120);
      expect(stats.span).toBe(20);
    });

    it("should handle negative values", () => {
      const data = [
        { year: 2020, value: -10 },
        { year: 2021, value: 0 },
        { year: 2022, value: 10 },
      ];
      const stats = calculateBasicStatistics(data);
      expect(stats.mean).toBe(0);
      expect(stats.variance).toBeCloseTo(66.67, 1);
      expect(stats.stdDev).toBeCloseTo(8.16, 1);
      expect(stats.min).toBe(-10);
      expect(stats.max).toBe(10);
      expect(stats.span).toBe(20);
    });
  });

  describe("calculateStandardDeviation", () => {
    it("should return 0 for empty array", () => {
      expect(calculateStandardDeviation([])).toBe(0);
    });

    it("should return 0 for single value", () => {
      expect(calculateStandardDeviation([100])).toBe(0);
    });

    it("should calculate standard deviation", () => {
      const values = [100, 110, 120];
      const stdDev = calculateStandardDeviation(values);
      expect(stdDev).toBeCloseTo(8.16, 1);
    });

    it("should handle negative values", () => {
      const values = [-10, 0, 10];
      const stdDev = calculateStandardDeviation(values);
      expect(stdDev).toBeCloseTo(8.16, 1);
    });
  });

  describe("Consistency between statistics functions", () => {
    it("should have consistent standard deviation calculations", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 110 },
        { year: 2022, value: 120 },
      ];

      const basicStats = calculateBasicStatistics(data);
      const values = data.map((d) => d.value);
      const standaloneStdDev = calculateStandardDeviation(values);

      expect(basicStats.stdDev).toBeCloseTo(standaloneStdDev, 10);
    });

    it("should have consistent variance calculations", () => {
      const data = [
        { year: 2020, value: 100 },
        { year: 2021, value: 110 },
        { year: 2022, value: 120 },
      ];

      const basicStats = calculateBasicStatistics(data);
      const values = data.map((d) => d.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;

      expect(basicStats.variance).toBeCloseTo(variance, 10);
    });
  });
});

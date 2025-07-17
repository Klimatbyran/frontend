import {
  calculateTrapezoidalIntegration,
  generateYearRange,
  getCurrentYear,
  validateData,
} from "../emissionsCalculationsUtils";

describe("calculateTrapezoidalIntegration", () => {
  it("should return 0 for empty data", () => {
    expect(calculateTrapezoidalIntegration({})).toBe(0);
  });

  it("should return 0 for single data point", () => {
    expect(calculateTrapezoidalIntegration({ 2020: 100 })).toBe(0);
  });

  it("should calculate area for two points", () => {
    const data = { 2020: 100, 2021: 110 };
    const result = calculateTrapezoidalIntegration(data);
    // Trapezoidal rule: (1 * (100 + 110)) / 2 = 105
    expect(result).toBe(105);
  });

  it("should calculate area for multiple points", () => {
    const data = { 2020: 100, 2021: 110, 2022: 120 };
    const result = calculateTrapezoidalIntegration(data);
    // Area 1: (1 * (100 + 110)) / 2 = 105
    // Area 2: (1 * (110 + 120)) / 2 = 115
    // Total: 105 + 115 = 220
    expect(result).toBe(220);
  });

  it("should handle non-sequential years", () => {
    const data = { 2020: 100, 2022: 120, 2025: 150 };
    const result = calculateTrapezoidalIntegration(data);
    // Area 1: (2 * (100 + 120)) / 2 = 220
    // Area 2: (3 * (120 + 150)) / 2 = 405
    // Total: 220 + 405 = 625
    expect(result).toBe(625);
  });
});

describe("generateYearRange", () => {
  it("should generate range from start to end inclusive", () => {
    const result = generateYearRange(2020, 2022);
    expect(result).toEqual([2020, 2021, 2022]);
  });

  it("should handle single year", () => {
    const result = generateYearRange(2020, 2020);
    expect(result).toEqual([2020]);
  });

  it("should handle large range", () => {
    const result = generateYearRange(2020, 2025);
    expect(result).toEqual([2020, 2021, 2022, 2023, 2024, 2025]);
  });

  it("should handle reverse order gracefully", () => {
    const result = generateYearRange(2022, 2020);
    expect(result).toEqual([]);
  });
});

describe("getCurrentYear", () => {
  it("should return current year", () => {
    const result = getCurrentYear();
    const expectedYear = new Date().getFullYear();
    expect(result).toBe(expectedYear);
    expect(typeof result).toBe("number");
  });
});

describe("validateData", () => {
  it("should return false for empty array", () => {
    expect(validateData([])).toBe(false);
  });

  it("should return false for array with undefined year", () => {
    expect(validateData([{ year: undefined as any }])).toBe(false);
  });

  it("should return true for valid data", () => {
    expect(validateData([{ year: 2020 }])).toBe(true);
    expect(validateData([{ year: 2020 }, { year: 2021 }])).toBe(true);
  });

  it("should work with extended data types", () => {
    const data = [{ year: 2020, total: 100, other: "value" }];
    expect(validateData(data)).toBe(true);
  });
});

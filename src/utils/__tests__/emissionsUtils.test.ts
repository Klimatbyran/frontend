import {
  generateYearRange,
  getCurrentYear,
  validateData,
  getValidData,
  getMinYear,
  calculateParisValue,
} from "../calculations/emissions/utils";

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

describe("getValidData", () => {
  it("should return empty array for empty input", () => {
    expect(getValidData([])).toEqual([]);
  });

  it("should filter out null and undefined values", () => {
    const data = [
      { year: 2020, total: 100 },
      { year: 2021, total: null },
      { year: 2022, total: undefined },
      { year: 2023, total: 120 },
    ];
    const result = getValidData(data);
    expect(result).toHaveLength(2);
    expect(result[0].total).toBe(100);
    expect(result[1].total).toBe(120);
  });

  it("should filter out NaN values", () => {
    const data = [
      { year: 2020, total: 100 },
      { year: 2021, total: NaN },
      { year: 2022, total: 120 },
    ];
    const result = getValidData(data);
    expect(result).toHaveLength(2);
    expect(result[0].total).toBe(100);
    expect(result[1].total).toBe(120);
  });

  it("should preserve valid data", () => {
    const data = [
      { year: 2020, total: 100 },
      { year: 2021, total: 110 },
      { year: 2022, total: 120 },
    ];
    const result = getValidData(data);
    expect(result).toHaveLength(3);
    expect(result[0].total).toBe(100);
    expect(result[1].total).toBe(110);
    expect(result[2].total).toBe(120);
  });
});

describe("getMinYear", () => {
  const mockData = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  it("should return base year when provided", () => {
    const result = getMinYear(mockData, 2019);
    expect(result).toBe(2019);
  });

  it("should return minimum of last two points when no base year", () => {
    const result = getMinYear(mockData);
    expect(result).toBe(2021); // min of last two points: 2021, 2022
  });

  it("should throw error for empty data", () => {
    expect(() => getMinYear([])).toThrow(
      "getMinYear: Data array must be non-empty",
    );
  });

  it("should throw error for invalid base year", () => {
    expect(() => getMinYear(mockData, NaN)).toThrow(
      "getMinYear: Base year must be a valid number",
    );
  });
});

describe("calculateParisValue", () => {
  it("should return null for past years", () => {
    const result = calculateParisValue(2020, 2023, 100);
    expect(result).toBeNull();
  });

  it("should return current value for current year", () => {
    const result = calculateParisValue(2023, 2023, 100);
    expect(result).toBe(100); // Should return current value for current year
  });

  it("should calculate future values", () => {
    const result = calculateParisValue(2024, 2023, 100);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100); // Should be reduced
  });

  it("should handle zero current value", () => {
    const result = calculateParisValue(2024, 2023, 0);
    expect(result).toBeNull();
  });

  it("should handle negative current value", () => {
    const result = calculateParisValue(2024, 2023, -10);
    expect(result).toBeNull();
  });

  it("should throw error for invalid year", () => {
    expect(() => calculateParisValue(NaN, 2023, 100)).toThrow(
      "calculateParisValue: Year must be a valid number",
    );
  });

  it("should throw error for invalid current year", () => {
    expect(() => calculateParisValue(2024, NaN, 100)).toThrow(
      "calculateParisValue: Current year must be a valid number",
    );
  });

  it("should throw error for invalid current value", () => {
    expect(() => calculateParisValue(2024, 2023, NaN)).toThrow(
      "calculateParisValue: Current year value must be a valid number",
    );
  });
});

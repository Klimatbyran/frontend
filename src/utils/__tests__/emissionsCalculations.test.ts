import {
  calculateWeightedLinearRegression,
  calculateTrendSlope,
} from "@/lib/calculations/trends/regression";
import {
  calculateTrendCoefficients,
  calculateApproximatedHistorical,
  calculateFutureTrend,
  generateExponentialApproximatedData,
  generateSophisticatedApproximatedData,
  generateApproximatedData,
} from "../calculations/emissions";
import { ChartData } from "@/types/emissions";

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

describe("calculateTrendCoefficients", () => {
  const mockData = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ] as { year: number; total: number }[];

  it("should return null for insufficient data", () => {
    expect(calculateTrendCoefficients([])).toBeNull();
    expect(calculateTrendCoefficients([{ year: 2020, total: 100 }])).toBeNull();
  });

  it("should calculate coefficients", () => {
    const result = calculateTrendCoefficients(mockData);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("slope");
    expect(result).toHaveProperty("intercept");
  });

  it("should filter by base year", () => {
    const result = calculateTrendCoefficients(mockData, 2021);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("slope");
    expect(result).toHaveProperty("intercept");
  });
});

describe("calculateApproximatedHistorical", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  const mockCoefficients = { slope: 10, intercept: 90 };

  it("should return null for insufficient data", () => {
    // Functions with withErrorHandling return null for invalid input
    expect(
      calculateApproximatedHistorical([], 2022, 2023, mockCoefficients),
    ).toBeNull();
  });

  it("should calculate approximated historical data using provided coefficients", () => {
    const result = calculateApproximatedHistorical(
      mockData,
      2022,
      2023,
      mockCoefficients,
    );
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("approximatedData");
    expect(result).toHaveProperty("cumulativeEmissions");
    expect(result).toHaveProperty("trendCoefficients");
    expect(result!.trendCoefficients).toEqual(mockCoefficients);
  });

  it("should include the last year with data", () => {
    const result = calculateApproximatedHistorical(
      mockData,
      2022,
      2023,
      mockCoefficients,
    );
    expect(result).not.toBeNull();
    expect(result!.approximatedData[2022]).toBe(120); // Last actual data point
  });

  it("should calculate cumulative emissions for gap years only", () => {
    const result = calculateApproximatedHistorical(
      mockData,
      2022,
      2023,
      mockCoefficients,
    );
    expect(result).not.toBeNull();
    expect(result!.cumulativeEmissions).toBeGreaterThan(0);
    // Should only include 2023 in cumulative (gap year)
    expect(result!.cumulativeEmissions).toBe(result!.approximatedData[2023]);
  });

  it("should use provided coefficients for calculations", () => {
    const customCoefficients = { slope: 5, intercept: 100 };
    const result = calculateApproximatedHistorical(
      mockData,
      2022,
      2023,
      customCoefficients,
    );
    expect(result).not.toBeNull();
    expect(result!.trendCoefficients).toEqual(customCoefficients);
    // 2023 should be calculated using custom coefficients: 5 * 2023 + 100 = 10215
    expect(result!.approximatedData[2023]).toBe(10215);
  });
});

describe("calculateFutureTrend", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  const mockCoefficients = { slope: 10, intercept: 90 };

  it("should return null for insufficient data", () => {
    // Functions with withErrorHandling return null for invalid input
    expect(calculateFutureTrend([], 2022, 2023, mockCoefficients)).toBeNull();
  });

  it("should calculate future trend data using provided coefficients", () => {
    const result = calculateFutureTrend(
      mockData,
      2022,
      2023,
      mockCoefficients,
      2025,
    );
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("trendData");
    expect(result).toHaveProperty("cumulativeEmissions");
    expect(result).toHaveProperty("trendCoefficients");
    expect(result!.trendCoefficients).toEqual(mockCoefficients);
  });

  it("should project future values using provided coefficients", () => {
    const result = calculateFutureTrend(
      mockData,
      2022,
      2023,
      mockCoefficients,
      2025,
    );
    expect(result).not.toBeNull();
    expect(result!.trendData[2022]).toBeDefined(); // Last year with data
    expect(result!.trendData[2023]).toBeDefined();
    expect(result!.trendData[2024]).toBeDefined();
    expect(result!.trendData[2025]).toBeDefined();

    // Values should be calculated using coefficients: slope * year + intercept
    expect(result!.trendData[2023]).toBe(20320); // 10 * 2023 + 90
    expect(result!.trendData[2024]).toBe(20330); // 10 * 2024 + 90
    expect(result!.trendData[2025]).toBe(20340); // 10 * 2025 + 90
  });

  it("should handle negative trend values by setting to 0", () => {
    const negativeCoefficients = { slope: -100, intercept: 1000 };
    const result = calculateFutureTrend(
      mockData,
      2022,
      2023,
      negativeCoefficients,
      2025,
    );
    expect(result).not.toBeNull();
    // If trend goes negative, should be set to 0
    expect(result!.trendData[2025]).toBe(0);
  });
});

describe("generateApproximatedData", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  it("should return empty array for no data", () => {
    // This function returns empty array for empty input
    expect(generateApproximatedData([])).toEqual([]);
  });

  it("should generate approximated data for single data point", () => {
    const singleData: ChartData[] = [{ year: 2020, total: 100 }];
    const result = generateApproximatedData(singleData);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("year");
    expect(result[0]).toHaveProperty("total");
    expect(result[0]).toHaveProperty("approximated");
    expect(result[0]).toHaveProperty("carbonLaw");
  });

  it("should generate approximated data for multiple data points", () => {
    const result = generateApproximatedData(mockData);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("year");
    expect(result[0]).toHaveProperty("total");
    expect(result[0]).toHaveProperty("approximated");
    expect(result[0]).toHaveProperty("carbonLaw");
  });

  it("should use provided regression parameters", () => {
    const regression = { slope: 10, intercept: 90 };
    const result = generateApproximatedData(mockData, regression);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should respect base year parameter", () => {
    const result = generateApproximatedData(mockData, undefined, 2030, 2021);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("generateSophisticatedApproximatedData", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  it("should return null for insufficient data", () => {
    // Functions with withErrorHandling return null for invalid input
    expect(generateSophisticatedApproximatedData([])).toBeNull();
    expect(
      generateSophisticatedApproximatedData([{ year: 2020, total: 100 }]),
    ).toBeNull();
  });

  it("should generate linear approximation by default using unified coefficients", () => {
    const result = generateSophisticatedApproximatedData(mockData);
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBeGreaterThan(0);

    // Check that we have data with the expected structure
    const firstItem = result![0];
    expect(firstItem).toHaveProperty("year");
    expect(firstItem).toHaveProperty("total");
    expect(firstItem).toHaveProperty("approximated");
    expect(firstItem).toHaveProperty("carbonLaw");

    // Verify that we have both historical and future data
    const hasApproximated = result!.some(
      (item) => item.approximated !== undefined,
    );
    const hasCarbonLaw = result!.some((item) => item.carbonLaw !== undefined);
    expect(hasApproximated).toBe(true);
    expect(hasCarbonLaw).toBe(true);
  });

  it("should generate exponential approximation when specified", () => {
    const result = generateSophisticatedApproximatedData(
      mockData,
      2050,
      "exponential",
    );
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBeGreaterThan(0);
  });

  it("should include all required properties", () => {
    const result = generateSophisticatedApproximatedData(mockData);
    expect(result).not.toBeNull();
    const firstItem = result![0];
    expect(firstItem).toHaveProperty("year");
    expect(firstItem).toHaveProperty("total");
    expect(firstItem).toHaveProperty("approximated");
    expect(firstItem).toHaveProperty("carbonLaw");
    expect(firstItem).toHaveProperty("isAIGenerated");
    expect(firstItem).toHaveProperty("scope1");
    expect(firstItem).toHaveProperty("scope2");
    expect(firstItem).toHaveProperty("scope3");
    expect(firstItem).toHaveProperty("scope3Categories");
    expect(firstItem).toHaveProperty("originalValues");
  });

  it("should use consistent coefficients for historical and future calculations", () => {
    const result = generateSophisticatedApproximatedData(mockData);
    expect(result).not.toBeNull();

    // Find items with both approximated and trend data to verify consistency
    const itemsWithBoth = result!.filter(
      (item) => item.approximated !== undefined && item.trend !== undefined,
    );

    if (itemsWithBoth.length > 0) {
      // The values should be consistent (same coefficients used)
      const item = itemsWithBoth[0];
      expect(item.approximated).toBe(item.trend);
    }
  });
});

describe("generateExponentialApproximatedData", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  it("should return null for insufficient data", () => {
    // Functions with withErrorHandling return null for invalid input
    expect(generateExponentialApproximatedData([])).toBeNull();
    expect(
      generateExponentialApproximatedData([{ year: 2020, total: 100 }]),
    ).toBeNull();
  });

  it("should generate exponential approximation", () => {
    const result = generateExponentialApproximatedData(mockData);
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBeGreaterThan(0);
  });

  it("should include all required properties", () => {
    const result = generateExponentialApproximatedData(mockData);
    expect(result).not.toBeNull();
    const firstItem = result![0];
    expect(firstItem).toHaveProperty("year");
    expect(firstItem).toHaveProperty("total");
    expect(firstItem).toHaveProperty("approximated");
    expect(firstItem).toHaveProperty("carbonLaw");
    expect(firstItem).toHaveProperty("isAIGenerated");
    expect(firstItem).toHaveProperty("scope1");
    expect(firstItem).toHaveProperty("scope2");
    expect(firstItem).toHaveProperty("scope3");
    expect(firstItem).toHaveProperty("scope3Categories");
    expect(firstItem).toHaveProperty("originalValues");
  });
});

describe("Unified Coefficients Approach", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  it("should use unified coefficients for both historical and future calculations", () => {
    // Calculate coefficients once
    const coefficients = calculateTrendCoefficients(
      mockData.map((d) => ({ year: d.year, total: d.total! })),
    );
    expect(coefficients).not.toBeNull();

    // Use same coefficients for both historical and future
    const historical = calculateApproximatedHistorical(
      mockData,
      2022,
      2023,
      coefficients!,
    );
    const future = calculateFutureTrend(
      mockData,
      2022,
      2023,
      coefficients!,
      2025,
    );

    expect(historical).not.toBeNull();
    expect(future).not.toBeNull();
    expect(historical!.trendCoefficients).toEqual(coefficients);
    expect(future!.trendCoefficients).toEqual(coefficients);
  });

  it("should ensure consistent trend calculations", () => {
    const result = generateSophisticatedApproximatedData(mockData);
    expect(result).not.toBeNull();

    // Verify that the trend is consistent throughout the data
    const trendItems = result!.filter((item) => item.trend !== undefined);
    if (trendItems.length > 1) {
      const firstTrend = trendItems[0].trend;
      const lastTrend = trendItems[trendItems.length - 1].trend;
      // Should follow a consistent linear pattern
      expect(typeof firstTrend).toBe("number");
      expect(typeof lastTrend).toBe("number");
    }
  });
});

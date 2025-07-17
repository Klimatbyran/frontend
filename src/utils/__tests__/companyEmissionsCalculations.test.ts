import {
  calculateWeightedLinearRegression,
  calculateTrendSlope,
} from "@/lib/calculations/trends/regression";
import {
  calculateTrendCoefficients,
  calculateAnchoredTrendCoefficients,
  calculateApproximatedHistorical,
  calculateFutureTrend,
  generateApproximatedData,
  generateSophisticatedApproximatedData,
  generateExponentialApproximatedData,
} from "../companyEmissionsCalculations";
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
  ] as { year: number; total: number | null | undefined }[];

  it("should return null for insufficient data", () => {
    expect(calculateTrendCoefficients([])).toBeNull();
    expect(calculateTrendCoefficients([{ year: 2020, total: 100 }])).toBeNull();
  });

  it("should calculate trend coefficients for valid data", () => {
    const result = calculateTrendCoefficients(mockData);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("slope");
    expect(result).toHaveProperty("intercept");
    expect(typeof result!.slope).toBe("number");
    expect(typeof result!.intercept).toBe("number");
  });

  it("should handle data with null/undefined values", () => {
    const dataWithNulls = [
      { year: 2020, total: 100 },
      { year: 2021, total: null },
      { year: 2022, total: 120 },
    ] as { year: number; total: number | null | undefined }[];
    const result = calculateTrendCoefficients(dataWithNulls);
    expect(result).not.toBeNull();
  });

  it("should respect base year parameter", () => {
    const result = calculateTrendCoefficients(mockData, 2021);
    expect(result).not.toBeNull();
  });
});

describe("calculateAnchoredTrendCoefficients", () => {
  const mockData = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ] as { year: number; total: number | null | undefined }[];

  it("should return null for insufficient data", () => {
    expect(calculateAnchoredTrendCoefficients([])).toBeNull();
    expect(
      calculateAnchoredTrendCoefficients([{ year: 2020, total: 100 }]),
    ).toBeNull();
  });

  it("should calculate anchored coefficients", () => {
    const result = calculateAnchoredTrendCoefficients(mockData);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("slope");
    expect(result).toHaveProperty("intercept");
  });

  it("should anchor to the last data point", () => {
    const result = calculateAnchoredTrendCoefficients(mockData);
    expect(result).not.toBeNull();

    // The anchored line should pass through the last point (2022, 120)
    const lastPointValue = result!.slope * 2022 + result!.intercept;
    expect(lastPointValue).toBeCloseTo(120, 5);
  });
});

describe("calculateApproximatedHistorical", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  it("should return null for insufficient data", () => {
    expect(calculateApproximatedHistorical([], 2022, 2023)).toBeNull();
  });

  it("should calculate approximated historical data", () => {
    const result = calculateApproximatedHistorical(mockData, 2022, 2023);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("approximatedData");
    expect(result).toHaveProperty("cumulativeEmissions");
    expect(result).toHaveProperty("trendCoefficients");
  });

  it("should include the last year with data", () => {
    const result = calculateApproximatedHistorical(mockData, 2022, 2023);
    expect(result).not.toBeNull();
    expect(result!.approximatedData[2022]).toBe(120); // Last actual data point
  });

  it("should calculate cumulative emissions", () => {
    const result = calculateApproximatedHistorical(mockData, 2022, 2023);
    expect(result).not.toBeNull();
    expect(result!.cumulativeEmissions).toBeGreaterThan(0);
  });
});

describe("calculateFutureTrend", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  it("should return null for insufficient data", () => {
    expect(calculateFutureTrend([], 2022, 2023)).toBeNull();
  });

  it("should calculate future trend data", () => {
    const result = calculateFutureTrend(mockData, 2022, 2023, 2025);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("trendData");
    expect(result).toHaveProperty("cumulativeEmissions");
    expect(result).toHaveProperty("trendCoefficients");
  });

  it("should project future values", () => {
    const result = calculateFutureTrend(mockData, 2022, 2023, 2025);
    expect(result).not.toBeNull();
    expect(result!.trendData[2023]).toBeDefined();
    expect(result!.trendData[2024]).toBeDefined();
    expect(result!.trendData[2025]).toBeDefined();
  });
});

describe("generateApproximatedData", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  it("should return empty array for no data", () => {
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
    expect(generateSophisticatedApproximatedData([])).toBeNull();
    expect(
      generateSophisticatedApproximatedData([{ year: 2020, total: 100 }]),
    ).toBeNull();
  });

  it("should generate linear approximation by default", () => {
    const result = generateSophisticatedApproximatedData(mockData);
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBeGreaterThan(0);
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
});

describe("generateExponentialApproximatedData", () => {
  const mockData: ChartData[] = [
    { year: 2020, total: 100 },
    { year: 2021, total: 110 },
    { year: 2022, total: 120 },
  ];

  it("should return null for insufficient data", () => {
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

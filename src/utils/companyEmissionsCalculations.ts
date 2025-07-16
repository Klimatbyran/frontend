import type { ChartData } from "@/types/emissions";
import {
  calculateRecentStability,
  detectUnusualEmissionsPoints,
  calculateR2Linear,
  calculateR2Exponential,
  calculateBasicStatistics,
} from "@/lib/calculations/trends/analysis";

export const calculateLinearRegression = (data: { x: number; y: number }[]) => {
  const n = data.length;
  if (n < 2) {
    return null;
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const lastPoint = data[data.length - 1];
  const intercept = lastPoint.y - slope * lastPoint.x;

  return { slope, intercept };
};

// Weighted linear regression that gives more weight to recent data points
export const calculateWeightedLinearRegression = (
  data: { x: number; y: number }[],
) => {
  const n = data.length;
  if (n < 4) {
    // If less than 4 points, fall back to regular linear regression
    return calculateLinearRegression(data);
  }

  // Sort data by year to ensure proper ordering
  const sortedData = [...data].sort((a, b) => a.x - b.x);

  // Exponential decay weights: most recent gets 1, next gets decay, then decay^2, ...
  const decay = 0.7;
  const weights = sortedData.map((_, index) => Math.pow(decay, n - 1 - index));

  let sumW = 0;
  let sumWX = 0;
  let sumWY = 0;
  let sumWXY = 0;
  let sumWXX = 0;

  for (let i = 0; i < n; i++) {
    const point = sortedData[i];
    const weight = weights[i];

    sumW += weight;
    sumWX += weight * point.x;
    sumWY += weight * point.y;
    sumWXY += weight * point.x * point.y;
    sumWXX += weight * point.x * point.x;
  }

  const slope =
    (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
  const lastPoint = sortedData[sortedData.length - 1];
  const intercept = lastPoint.y - slope * lastPoint.x;

  return { slope, intercept };
};

// Helper to get regression points based on base year logic
function getRegressionPoints(
  data: ChartData[],
  baseYear?: number,
): { x: number; y: number }[] {
  const validData = data.filter(
    (d): d is ChartData & { total: number } =>
      d.total !== undefined && d.total !== null,
  );
  if (baseYear && baseYear !== Math.max(...validData.map((d) => d.year))) {
    // Use all data from base year onward
    return validData
      .filter((d) => d.year >= baseYear)
      .map((d) => ({ x: d.year, y: d.total }));
  } else {
    // Use last two data points
    const sorted = validData.sort((a, b) => a.year - b.year);
    return sorted.slice(-2).map((d) => ({ x: d.year, y: d.total }));
  }
}

// Base year-aware trend coefficients calculation
export const calculateTrendCoefficients = (
  data: ChartData[],
  baseYear?: number,
) => {
  const regressionPoints = getRegressionPoints(data, baseYear);
  if (regressionPoints.length < 2) {
    return null;
  }
  const x = regressionPoints.map((d) => d.x);
  const y = regressionPoints.map((d) => d.y);
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

export const calculateApproximatedHistorical = (
  data: ChartData[],
  lastYearWithData: number,
  currentYear: number,
  baseYear?: number,
) => {
  const trendCoefficients = calculateTrendCoefficients(data, baseYear);
  if (!trendCoefficients) {
    return null;
  }

  // Include the last year with data as the starting point
  const approximatedYears = Array.from(
    { length: currentYear - lastYearWithData + 1 },
    (_, i) => lastYearWithData + i,
  );

  if (approximatedYears.length === 0) {
    return null;
  }

  const lastDataPoint = data.find((d) => d.year === lastYearWithData);
  if (!lastDataPoint?.total) {
    return null;
  }

  const approximatedData: Record<number, number> = {};

  for (const year of approximatedYears) {
    if (year === lastYearWithData) {
      // Use the actual value for the last reported year
      approximatedData[year] = lastDataPoint.total;
    } else {
      // Use the trend for subsequent years
      const approximatedValue = Math.max(
        0,
        trendCoefficients.slope * year + trendCoefficients.intercept,
      );
      approximatedData[year] = approximatedValue;
    }
  }

  // Calculate cumulative emissions using trapezoidal integration
  const years = Object.keys(approximatedData)
    .map(Number)
    .sort((a, b) => a - b);
  let cumulativeEmissions = 0;

  for (let i = 1; i < years.length; i++) {
    const year1 = years[i - 1];
    const year2 = years[i];
    const value1 = approximatedData[year1];
    const value2 = approximatedData[year2];

    // Trapezoidal rule: area = (base * (height1 + height2)) / 2
    cumulativeEmissions += ((year2 - year1) * (value1 + value2)) / 2;
  }

  return {
    approximatedData,
    cumulativeEmissions,
    trendCoefficients,
  };
};

export const calculateFutureTrend = (
  data: ChartData[],
  lastYearWithData: number,
  currentYear: number,
  endYear: number = 2050,
  baseYear?: number,
) => {
  const trendCoefficients = calculateTrendCoefficients(data, baseYear);
  if (!trendCoefficients) {
    return null;
  }

  const futureYears = Array.from(
    { length: endYear - currentYear },
    (_, i) => currentYear + 1 + i,
  );

  if (futureYears.length === 0) {
    return null;
  }

  // Get starting value - either from actual data or approximated historical
  let startingValue: number;
  const lastDataPoint = data.find((d) => d.year === lastYearWithData);

  if (currentYear > lastYearWithData && lastDataPoint?.total) {
    // Use approximated historical value if available
    const approximatedHistorical = calculateApproximatedHistorical(
      data,
      lastYearWithData,
      currentYear,
      baseYear,
    );
    startingValue =
      approximatedHistorical?.approximatedData[currentYear] ||
      lastDataPoint.total;
  } else {
    startingValue = lastDataPoint?.total || 0;
  }

  const trendData: Record<number, number> = {
    [currentYear]: startingValue,
  };

  // Project future values using trend coefficients
  for (const year of futureYears) {
    const trendValue = Math.max(
      0,
      trendCoefficients.slope * year + trendCoefficients.intercept,
    );
    trendData[year] = trendValue;
  }

  // Calculate cumulative emissions using trapezoidal integration
  const years = Object.keys(trendData)
    .map(Number)
    .sort((a, b) => a - b);
  let cumulativeEmissions = 0;

  for (let i = 1; i < years.length; i++) {
    const year1 = years[i - 1];
    const year2 = years[i];
    const value1 = trendData[year1];
    const value2 = trendData[year2];

    cumulativeEmissions += ((year2 - year1) * (value1 + value2)) / 2;
  }

  return {
    trendData,
    cumulativeEmissions,
    trendCoefficients,
  };
};

// Base year-aware exponential regression
export function fitExponentialRegression(data: { x: number; y: number }[]) {
  const filtered = data.filter((d) => d.y > 0);
  if (filtered.length < 2) return null;
  const n = filtered.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const { x, y } of filtered) {
    const ly = Math.log(y);
    sumX += x;
    sumY += ly;
    sumXY += x * ly;
    sumXX += x * x;
  }
  const b = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const a = Math.exp((sumY - b * sumX) / n);
  return { a, b };
}

// Weighted exponential regression: fit y = a * exp(bx) with exponential decay weights
export function calculateWeightedExponentialRegression(
  data: { x: number; y: number }[],
  decay: number = 0.7,
) {
  // Only use points with y > 0
  const filtered = data.filter((d) => d.y > 0);
  const n = filtered.length;
  if (n < 2) return null;
  // Most recent gets weight 1, next gets decay, then decay^2, ...
  const weights = filtered.map((_, i) => Math.pow(decay, n - 1 - i));
  let sumW = 0,
    sumWX = 0,
    sumWY = 0,
    sumWXY = 0,
    sumWXX = 0;
  for (let i = 0; i < n; i++) {
    const x = filtered[i].x;
    const ly = Math.log(filtered[i].y);
    const w = weights[i];
    sumW += w;
    sumWX += w * x;
    sumWY += w * ly;
    sumWXY += w * x * ly;
    sumWXX += w * x * x;
  }
  const b = (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
  const a = Math.exp((sumWY - b * sumWX) / sumW);
  return { a, b };
}

// Recent exponential regression: fit y = a * exp(bx) to last N years (unweighted)
export function calculateRecentExponentialRegression(
  data: { x: number; y: number }[],
  recentN: number = 4,
) {
  // Only use points with y > 0
  const filtered = data.filter((d) => d.y > 0);
  if (filtered.length < 2) return null;
  const recent = filtered.slice(-recentN);
  const n = recent.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = recent[i].x;
    const ly = Math.log(recent[i].y);
    sumX += x;
    sumY += ly;
    sumXY += x * ly;
    sumXX += x * x;
  }
  const b = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const a = Math.exp((sumY - b * sumX) / n);
  return { a, b };
}

export const generateExponentialApproximatedData = (
  data: ChartData[],
  endYear: number = 2050,
  baseYear?: number,
) => {
  const regressionPoints = getRegressionPoints(data, baseYear);
  if (regressionPoints.length < 2) return null;

  // Get the actual last year with data from the full dataset
  const validData = data.filter(
    (d): d is ChartData & { total: number } =>
      d.total !== undefined && d.total !== null,
  );
  const lastYearWithData = Math.max(...validData.map((d) => d.year));
  const lastActualValue = validData.find(
    (d) => d.year === lastYearWithData,
  )?.total;
  const currentYear = new Date().getFullYear();

  const expFit = fitExponentialRegression(regressionPoints);
  if (!expFit) return null;

  // Calculate scale so the exponential curve passes through the last data point
  const fitValueAtLast = expFit.a * Math.exp(expFit.b * lastYearWithData);
  const scale =
    lastActualValue && fitValueAtLast ? lastActualValue / fitValueAtLast : 1;

  if (!data.length) return [];
  const firstYear = data[0]?.year;
  if (firstYear === undefined) return [];

  const allYears = Array.from(
    { length: endYear - firstYear + 1 },
    (_, i) => firstYear + i,
  );
  const reductionRate = 0.1172;

  return allYears.map((year) => {
    const actualData = data.find((d) => d.year === year);
    let approximatedValue = null;

    if (year > lastYearWithData) {
      approximatedValue = scale * expFit.a * Math.exp(expFit.b * year);
      if (approximatedValue < 0) approximatedValue = 0;
    } else if (year === lastYearWithData) {
      approximatedValue = lastActualValue ?? null;
    } // else: leave as null for years before lastYearWithData

    let parisValue = null;
    if (year >= currentYear) {
      const currentYearValue =
        scale * expFit.a * Math.exp(expFit.b * currentYear);
      const calculatedValue =
        currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
      parisValue = calculatedValue > 0 ? calculatedValue : null;
    }

    return {
      year,
      total: actualData?.total,
      approximated: approximatedValue,
      carbonLaw: parisValue,
      isAIGenerated: actualData?.isAIGenerated,
      scope1: actualData?.scope1,
      scope2: actualData?.scope2,
      scope3: actualData?.scope3,
      scope3Categories: actualData?.scope3Categories,
      originalValues: actualData?.originalValues,
    };
  });
};

// Update main generator to support mode
export type SophisticatedTrendMode = "linear" | "exponential";

export const generateSophisticatedApproximatedData = (
  data: ChartData[],
  endYear: number = 2050,
  mode: SophisticatedTrendMode = "linear",
  baseYear?: number,
) => {
  if (mode === "exponential") {
    return generateExponentialApproximatedData(data, endYear, baseYear);
  }
  // Default: linear
  const validData = data.filter(
    (d): d is ChartData & { total: number } =>
      d.total !== undefined && d.total !== null,
  );

  if (validData.length < 2) {
    return null;
  }

  const lastYearWithData = Math.max(...validData.map((d) => d.year));
  const currentYear = new Date().getFullYear();

  // Calculate trend coefficients using base year logic
  const trendCoefficients = calculateTrendCoefficients(data, baseYear);
  if (!trendCoefficients) {
    return null;
  }

  // Calculate approximated historical data (fill gaps)
  const approximatedHistorical = calculateApproximatedHistorical(
    data,
    lastYearWithData,
    currentYear,
    baseYear,
  );

  // Calculate future trend projection
  const futureTrend = calculateFutureTrend(
    data,
    lastYearWithData,
    currentYear,
    endYear,
    baseYear,
  );

  if (!futureTrend) {
    return null;
  }

  // Generate comprehensive data array
  if (!data.length) return [];
  const firstYear = data[0]?.year;
  if (firstYear === undefined) return [];
  const allYears = Array.from(
    { length: endYear - firstYear + 1 },
    (_, i) => firstYear + i,
  );

  const reductionRate = 0.1172; // Carbon Law reduction rate

  return allYears.map((year) => {
    const actualData = data.find((d) => d.year === year);

    // Determine approximated value
    let approximatedValue = null;
    if (year >= lastYearWithData) {
      if (year <= currentYear && approximatedHistorical) {
        // Use approximated historical for gap years (including lastYearWithData)
        approximatedValue =
          approximatedHistorical.approximatedData[year] ?? null;
      } else if (year > currentYear && futureTrend) {
        // Use future trend for projection years
        approximatedValue = futureTrend.trendData[year] || null;
      }
    }

    // Calculate Paris line value (Carbon Law)
    let parisValue = null;
    if (year >= currentYear) {
      const currentYearValue =
        approximatedHistorical?.approximatedData[currentYear] ||
        validData.find((d) => d.year === currentYear)?.total ||
        trendCoefficients.slope * currentYear + trendCoefficients.intercept;

      const calculatedValue =
        currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
      parisValue = calculatedValue > 0 ? calculatedValue : null;
    }

    return {
      year,
      total: actualData?.total,
      approximated: approximatedValue,
      carbonLaw: parisValue,
      isAIGenerated: actualData?.isAIGenerated,
      scope1: actualData?.scope1,
      scope2: actualData?.scope2,
      scope3: actualData?.scope3,
      scope3Categories: actualData?.scope3Categories,
      originalValues: actualData?.originalValues,
    };
  });
};

// Simple calculation with base year support
export const generateApproximatedData = (
  data: ChartData[],
  regression?: { slope: number; intercept: number },
  endYear: number = 2030,
  baseYear?: number,
) => {
  const validData = data.filter(
    (d): d is ChartData & { total: number } =>
      d.total !== undefined && d.total !== null,
  );

  // If we have no valid data, return empty array
  if (validData.length === 0) return [];

  // If we have only one data point, we can still generate carbon law line
  if (validData.length < 2) {
    const currentYear = new Date().getFullYear();
    const firstYear = validData[0].year;
    const allYears = Array.from(
      { length: endYear - firstYear + 1 },
      (_, i) => firstYear + i,
    );
    const reductionRate = 0.1172;

    return allYears.map((year) => {
      let parisValue = null;
      if (year >= currentYear) {
        const currentYearValue = validData[0].total;
        const calculatedValue =
          currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
        parisValue = calculatedValue > 0 ? calculatedValue : null;
      }
      return {
        year,
        approximated: null,
        total: data.find((d) => d.year === year)?.total,
        carbonLaw: parisValue,
      };
    });
  }

  // If base year is null/undefined, use last two data points
  const baseYearValue = baseYear
    ? baseYear
    : validData.length >= 2
      ? validData[validData.length - 2].year
      : validData[0]?.year;

  if (baseYearValue === undefined) return [];
  const points = validData.filter((d) => d.year >= baseYearValue);

  // Use provided regression if available, otherwise fallback to average annual change
  let slope = 0;
  let intercept = 0;
  if (
    regression &&
    typeof regression.slope === "number" &&
    typeof regression.intercept === "number"
  ) {
    slope = regression.slope;
    intercept = regression.intercept;
  } else if (points.length > 1) {
    let totalChange = 0;
    let totalYears = 0;
    for (let i = 1; i < points.length; i++) {
      totalChange += points[i].total - points[i - 1].total;
      totalYears += points[i].year - points[i - 1].year;
    }
    slope = totalYears !== 0 ? totalChange / totalYears : 0;
    // Anchor at last point
    intercept =
      points[points.length - 1].total - slope * points[points.length - 1].year;
  }

  const lastYearWithData =
    points.length > 0
      ? points[points.length - 1].year
      : validData[validData.length - 1].year;
  const lastValue =
    points.length > 0
      ? points[points.length - 1].total
      : validData[validData.length - 1].total;
  const currentYear = new Date().getFullYear();

  // More robust checks for data array
  if (!data.length) return [];
  if (!data[0] || data[0].year === undefined) return [];

  const firstYear = data[0].year;
  const allYears = Array.from(
    { length: endYear - firstYear + 1 },
    (_, i) => firstYear + i,
  );
  const reductionRate = 0.1172;
  return allYears.map((year) => {
    let approximatedValue = null;
    if (year > lastYearWithData) {
      approximatedValue = slope * year + intercept;
      if (approximatedValue < 0) approximatedValue = 0;
    } else if (year === lastYearWithData) {
      approximatedValue = lastValue;
    }
    let parisValue = null;
    if (year >= currentYear) {
      const currentYearValue = slope * currentYear + intercept;
      const calculatedValue =
        currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
      parisValue = calculatedValue > 0 ? calculatedValue : null;
    }
    return {
      year,
      approximated: approximatedValue,
      total: data.find((d) => d.year === year)?.total,
      carbonLaw: parisValue,
    };
  });
};

/**
 * Calculates missing years in emissions data (base year aware and counts zero emissions as missing)
 * @param data Array of emissions data points
 * @param baseYear Optional base year to filter data from
 * @returns Number of missing years
 */
export function calculateMissingYears(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): number {
  // Filter to valid data points since base year
  const validData = data.filter(
    (d) =>
      d.total !== undefined &&
      d.total !== null &&
      (baseYear === undefined || d.year >= baseYear),
  );

  if (validData.length < 2) return 0;

  const years = validData.map((d) => d.year);
  const startYear = baseYear || years[0];
  const endYear = years[years.length - 1];
  const expectedYears = endYear - startYear + 1;

  // Count years with zero emissions as missing
  const zeroEmissionsYears = validData.filter((d) => d.total === 0).length;

  return expectedYears - validData.length + zeroEmissionsYears;
}

/**
 * Selects the best trend line method for a company based on its emissions data.
 * Returns { method, explanation }.
 */
export function selectBestTrendLineMethod(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): { method: string; explanation: string } {
  // Filter to points since base year
  const points = data
    .filter(
      (d) =>
        d.total !== undefined &&
        d.total !== null &&
        (baseYear === undefined || d.year >= baseYear),
    )
    .map((d) => ({ x: d.year, y: d.total as number }));
  const numPoints = points.length;
  if (numPoints < 3) {
    return {
      method: "simple",
      explanation: `Simple average slope is used because there are only ${numPoints} data points since the base year. More complex methods are unreliable with so little data.`,
    };
  }
  // Check for missing years using the utility function
  const missingYears = calculateMissingYears(data, baseYear);

  // Convert points to DataPoint format for utility functions
  const dataPoints = points.map((p) => ({ year: p.x, value: p.y }));

  // Use utility functions for calculations
  const unusualPointsResult = detectUnusualEmissionsPoints(dataPoints);
  const hasUnusualPoints = unusualPointsResult.hasUnusualPoints;
  const recentStability = calculateRecentStability(dataPoints);
  const r2Lin = calculateR2Linear(dataPoints);
  const r2Exp = calculateR2Exponential(dataPoints);
  const statistics = calculateBasicStatistics(dataPoints);

  // Heuristic selection
  if (missingYears > 2) {
    return {
      method: "linear",
      explanation: `Linear regression is used because there are ${missingYears} missing years in the data, and linear regression is robust to missing data.`,
    };
  }
  // Switch order: check recent stability before unusual points
  if (recentStability < 0.1 && dataPoints.length >= 4) {
    return {
      method: "weightedLinear",
      explanation: `Weighted linear regression is used because the last 4 years are very stable (std dev < 10% of mean). This method gives more weight to recent stable data and reduces the impact of older data or unusual points.`,
    };
  }
  if (hasUnusualPoints) {
    return {
      method: "weightedLinear",
      explanation: `Weighted linear regression is used because unusual year-over-year changes were detected (exceeding 4x the median change). This method downweights unusual points for a more robust trend.`,
    };
  }
  if (r2Exp - r2Lin > 0.05) {
    // Check if we should use weighted exponential for better unusual point handling
    if (
      hasUnusualPoints ||
      statistics.variance > 0.15 * (statistics.mean || 1)
    ) {
      return {
        method: "weightedExponential",
        explanation: `Weighted exponential regression is used because the exponential fit (R²=${r2Exp.toFixed(2)}) is significantly better than linear (R²=${r2Lin.toFixed(2)}), and the data has unusual points or high variance. This method downweights unusual points while fitting an exponential trend.`,
      };
    }
    return {
      method: "exponential",
      explanation: `Exponential regression is used because the exponential fit (R²=${r2Exp.toFixed(2)}) is significantly better than linear (R²=${r2Lin.toFixed(2)}). This suggests a non-linear trend.`,
    };
  }
  if (statistics.variance > 0.2 * (statistics.mean || 1)) {
    return {
      method: "weightedLinear",
      explanation: `Weighted linear regression is used because the data has high variance (std dev > 20% of mean), making it more robust to fluctuations.`,
    };
  }

  // Check for recent exponential patterns (last 4 years show exponential growth/decay)
  if (dataPoints.length >= 4) {
    const recentData = dataPoints.slice(-4);
    const recentR2Exp = calculateR2Exponential(recentData);
    const recentR2Lin = calculateR2Linear(recentData);

    if (recentR2Exp > 0.8 && recentR2Exp - recentR2Lin > 0.1) {
      return {
        method: "recentExponential",
        explanation: `Recent exponential regression is used because the last 4 years show a strong exponential pattern (R²=${recentR2Exp.toFixed(2)}) that is significantly better than linear (R²=${recentR2Lin.toFixed(2)}). This focuses on the recent exponential trend.`,
      };
    }
  }
  // Default
  return {
    method: "linear",
    explanation: `Linear regression is used as the default because the data is sufficiently complete and does not show strong non-linear or outlier behavior.`,
  };
}

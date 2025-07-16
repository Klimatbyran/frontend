import { DataPoint } from "./types";

/**
 * Calculate recent stability based on the last N years of data
 * Returns the coefficient of variation (std dev / mean) for recent data
 */
export function calculateRecentStability(
  data: DataPoint[],
  recentYears: number = 4,
): number {
  if (!data?.length || data.length < recentYears) {
    return 0;
  }

  const recentPoints = data.slice(-recentYears);
  const recentValues = recentPoints.map((p) => p.value);
  const recentMean =
    recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const recentVariance =
    recentValues.reduce((a, b) => a + Math.pow(b - recentMean, 2), 0) /
    recentValues.length;
  const recentStdDev = Math.sqrt(recentVariance);

  return recentStdDev / (recentMean || 1);
}

/**
 * Detect unusual data points in emissions time series
 * For emissions data, we look for significant year-over-year changes
 * that are unusual compared to the typical variation in the dataset
 */
export function detectUnusualEmissionsPoints(
  data: DataPoint[],
  multiplier: number = 4,
): {
  hasUnusualPoints: boolean;
  details?: {
    year: number;
    fromYear: number;
    toYear: number;
    fromValue: number;
    toValue: number;
    change: number;
    threshold: number;
    direction: string;
    reason: string;
  }[];
} {
  if (!data?.length || data.length < 4) {
    return { hasUnusualPoints: false };
  }

  // Sort by year to ensure chronological order
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  const values = sortedData.map((p) => p.value);
  const years = sortedData.map((p) => p.year);

  // Calculate year-over-year percentage changes
  const yearOverYearChanges: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const currentValue = values[i];
    const previousValue = values[i - 1];
    if (previousValue !== 0) {
      const change = Math.abs((currentValue - previousValue) / previousValue);
      yearOverYearChanges.push(change);
    }
  }

  if (yearOverYearChanges.length === 0) {
    return { hasUnusualPoints: false };
  }

  // Calculate median year-over-year change
  const sortedChanges = [...yearOverYearChanges].sort((a, b) => a - b);
  const medianChange = sortedChanges[Math.floor(sortedChanges.length / 2)];

  // A year is unusual if its year-over-year change is more than multiplier x the median change
  // This identifies years with unusually large changes compared to typical variation
  const threshold = multiplier * medianChange;
  const unusualChanges = yearOverYearChanges.filter(
    (change) => change > threshold,
  );
  const hasUnusualPoints = unusualChanges.length > 0;

  // Create detailed information about unusual points
  const details = unusualChanges.map((change, index) => {
    // Find the corresponding year by finding the index in yearOverYearChanges
    const changeIndex = yearOverYearChanges.findIndex((c) => c === change);
    const fromYear = years[changeIndex]; // The year before the change
    const toYear = years[changeIndex + 1]; // The year with the unusual change
    const fromValue = values[changeIndex];
    const toValue = values[changeIndex + 1];

    // Determine if it's an increase or decrease
    const direction = toValue > fromValue ? "increase" : "decrease";

    return {
      year: toYear,
      fromYear,
      toYear,
      fromValue,
      toValue,
      change: change * 100, // Convert to percentage
      threshold: threshold * 100, // Convert to percentage
      direction,
      reason: `${fromYear}→${toYear}: ${(change * 100).toFixed(1)}% ${direction} (${fromValue.toLocaleString()} → ${toValue.toLocaleString()}) exceeds ${(threshold * 100).toFixed(1)}% threshold`,
    };
  });

  return {
    hasUnusualPoints,
    details: hasUnusualPoints ? details : undefined,
  };
}

/**
 * Calculate R² for linear regression
 */
export function calculateR2Linear(data: DataPoint[]): number {
  if (!data?.length || data.length < 2) {
    return 0;
  }

  const n = data.length;
  const sumX = data.reduce((a, p) => a + p.year, 0);
  const sumY = data.reduce((a, p) => a + p.value, 0);
  const sumXY = data.reduce((a, p) => a + p.year * p.value, 0);
  const sumX2 = data.reduce((a, p) => a + p.year * p.year, 0);
  const sumY2 = data.reduce((a, p) => a + p.value * p.value, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ssTot = data.reduce((a, p) => a + Math.pow(p.value - sumY / n, 2), 0);
  const ssRes = data.reduce(
    (a, p) => a + Math.pow(p.value - (slope * p.year + intercept), 2),
    0,
  );

  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

/**
 * Calculate R² for exponential regression
 */
export function calculateR2Exponential(data: DataPoint[]): number {
  if (!data?.length || data.length < 2) {
    return 0;
  }

  // Fit y = a * exp(bx) via log transform
  const logPoints = data
    .filter((p) => p.value > 0)
    .map((p) => ({ year: p.year, value: Math.log(p.value) }));

  if (logPoints.length < 2) {
    return 0;
  }

  const n = logPoints.length;
  const sumX = logPoints.reduce((a, p) => a + p.year, 0);
  const sumY = logPoints.reduce((a, p) => a + p.value, 0);
  const sumXY = logPoints.reduce((a, p) => a + p.year * p.value, 0);
  const sumX2 = logPoints.reduce((a, p) => a + p.year * p.year, 0);
  const meanY = sumY / n;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ssTot = logPoints.reduce((a, p) => a + Math.pow(p.value - meanY, 2), 0);
  const ssRes = logPoints.reduce(
    (a, p) => a + Math.pow(p.value - (slope * p.year + intercept), 2),
    0,
  );

  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

/**
 * Calculate trend slope using linear regression
 */
export function calculateTrendSlope(data: DataPoint[]): number {
  if (!data?.length || data.length < 2) {
    return 0;
  }

  const n = data.length;
  const sumX = data.reduce((a, p) => a + p.year, 0);
  const sumY = data.reduce((a, p) => a + p.value, 0);
  const sumXY = data.reduce((a, p) => a + p.year * p.value, 0);
  const sumX2 = data.reduce((a, p) => a + p.year * p.year, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    return 0;
  }

  return (n * sumXY - sumX * sumY) / denominator;
}

/**
 * Determine trend direction based on slope and data characteristics
 */
export function calculateTrendDirection(
  data: DataPoint[],
  stabilityThreshold: number = 0.01,
  minDataPoints: number = 2,
): "increasing" | "decreasing" | "stable" {
  if (!data?.length || data.length < minDataPoints) {
    return "stable";
  }

  const values = data.map((p) => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const trendSlope = calculateTrendSlope(data);

  if (Math.abs(trendSlope) < stabilityThreshold * mean) {
    return "stable";
  } else {
    return trendSlope > 0 ? "increasing" : "decreasing";
  }
}

/**
 * Calculate basic statistics for a dataset
 */
export function calculateBasicStatistics(data: DataPoint[]): {
  mean: number;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  span: number;
} {
  if (!data?.length) {
    return {
      mean: 0,
      variance: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      span: 0,
    };
  }

  const values = data.map((p) => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  return {
    mean,
    variance,
    stdDev,
    min,
    max,
    span,
  };
}

/**
 * Comprehensive trend analysis that combines all the above calculations
 */
export function analyzeTrendCharacteristics(
  data: DataPoint[],
  baseYear?: number,
): {
  recentStability: number;
  hasOutliers: boolean;
  r2Linear: number;
  r2Exponential: number;
  trendDirection: "increasing" | "decreasing" | "stable";
  trendSlope: number;
  statistics: {
    mean: number;
    variance: number;
    stdDev: number;
    min: number;
    max: number;
    span: number;
  };
} {
  // Filter data to base year if provided, or use all data if no base year
  const filteredData = baseYear ? data.filter((d) => d.year >= baseYear) : data;

  if (!filteredData?.length || filteredData.length < 2) {
    return {
      recentStability: 0,
      hasOutliers: false,
      r2Linear: 0,
      r2Exponential: 0,
      trendDirection: "stable",
      trendSlope: 0,
      statistics: {
        mean: 0,
        variance: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        span: 0,
      },
    };
  }

  const unusualPointsResult = detectUnusualEmissionsPoints(filteredData);
  return {
    recentStability: calculateRecentStability(filteredData),
    hasOutliers: unusualPointsResult.hasUnusualPoints,
    r2Linear: calculateR2Linear(filteredData),
    r2Exponential: calculateR2Exponential(filteredData),
    trendDirection: calculateTrendDirection(filteredData),
    trendSlope: calculateTrendSlope(filteredData),
    statistics: calculateBasicStatistics(filteredData),
  };
}

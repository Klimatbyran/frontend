import { DataPoint } from "./types";

/**
 * Weighted linear regression that gives more weight to recent data points
 */
export const calculateWeightedLinearRegression = (data: DataPoint[]) => {
  const n = data.length;
  if (n < 4) {
    // If less than 4 points, fall back to calculateTrendSlope
    if (n < 2) return null;
    const slope = calculateTrendSlope(data);
    // For intercept, use last point
    const lastPoint = data[data.length - 1];
    const intercept = lastPoint.value - slope * lastPoint.year;
    return { slope, intercept };
  }

  // Sort data by year to ensure proper ordering
  const sortedData = [...data].sort((a, b) => a.year - b.year);

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
    sumWX += weight * point.year;
    sumWY += weight * point.value;
    sumWXY += weight * point.year * point.value;
    sumWXX += weight * point.year * point.year;
  }

  const slope =
    (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
  const lastPoint = sortedData[sortedData.length - 1];
  const intercept = lastPoint.value - slope * lastPoint.year;

  return { slope, intercept };
};

/**
 * Base year-aware exponential regression
 */
export function fitExponentialRegression(data: DataPoint[]) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length < 2) {
    return null;
  }
  const n = filtered.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const { year, value } of filtered) {
    const ly = Math.log(value);
    sumX += year;
    sumY += ly;
    sumXY += year * ly;
    sumXX += year * year;
  }
  const b = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const a = Math.exp((sumY - b * sumX) / n);

  // Check for invalid values
  if (isNaN(a) || isNaN(b) || !isFinite(a) || !isFinite(b)) {
    return null;
  }

  // If 'a' is very small, use a minimum value to prevent the exponential function from being essentially 0
  let adjustedA = a;
  if (Math.abs(a) < 1e-10) {
    adjustedA = 0.1; // Use a minimum value to ensure the exponential function produces visible results
  }

  return { a: adjustedA, b };
}

/**
 * Weighted exponential regression: fit y = a * exp(bx) with exponential decay weights
 */
export function calculateWeightedExponentialRegression(
  data: DataPoint[],
  decay: number = 0.7,
) {
  // Only use points with value > 0
  const filtered = data.filter((d) => d.value > 0);
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
    const x = filtered[i].year;
    const ly = Math.log(filtered[i].value);
    const w = weights[i];
    sumW += w;
    sumWX += w * x;
    sumWY += ly;
    sumWXY += w * x * ly;
    sumWXX += w * x * x;
  }
  const b = (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
  const a = Math.exp((sumWY - b * sumWX) / sumW);
  return { a, b };
}

/**
 * Recent exponential regression: fit y = a * exp(bx) to last N years (unweighted)
 */
export function calculateRecentExponentialRegression(
  data: DataPoint[],
  recentN: number = 4,
) {
  const recent = data.slice(-recentN);
  return fitExponentialRegression(recent);
}

/**
 * Simple linear regression
 * Returns slope and intercept for y = mx + b
 *
 * Uses year - minYear for numerical stability, then converts back to actual year coefficients.
 * Returns coefficients for the formula: y = slope * year + intercept
 */
export function calculateLinearRegression(
  data: DataPoint[],
): { slope: number; intercept: number } | null {
  if (data.length < 2) return null;

  const minYear = Math.min(...data.map((d) => d.year));
  const points = data.map((d) => ({ x: d.year - minYear, y: d.value }));

  const n = points.length;
  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const interceptOffset = (sumY - slope * sumX) / n;

  // Convert back to actual year coefficients
  const intercept = interceptOffset - slope * minYear;

  return { slope, intercept };
}

/**
 * Calculate trend slope using simple linear regression
 */
export function calculateTrendSlope(data: DataPoint[]): number {
  if (data.length < 2) return 0;

  const n = data.length;
  const sumX = data.reduce((a, p) => a + p.year, 0);
  const sumY = data.reduce((a, p) => a + p.value, 0);
  const sumXY = data.reduce((a, p) => a + p.year * p.value, 0);
  const sumX2 = data.reduce((a, p) => a + p.year * p.year, 0);

  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

/**
 * Calculates simple coefficients using the last two data points
 * @param dataPoints Array of data points for analysis
 * @returns Coefficients object or null if calculation fails
 */
export function calculateSimpleCoefficients(
  dataPoints: DataPoint[],
): { slope: number; intercept: number } | undefined {
  if (dataPoints.length < 2) {
    return undefined;
  }

  // Sort by year to ensure chronological order
  const sortedData = [...dataPoints].sort((a, b) => a.year - b.year);

  // Use the last two data points
  const lastTwo = sortedData.slice(-2);
  const [point1, point2] = lastTwo;

  // Calculate slope between the last two points
  const slope = (point2.value - point1.value) / (point2.year - point1.year);

  // Calculate intercept using point1
  const intercept = point1.value - slope * point1.year;

  return { slope, intercept };
}

/**
 * Calculates coefficients for the specified trend line method.
 * @param dataPoints Array of data points for analysis
 * @param method The selected trend line method
 * @returns Coefficients object or null if calculation fails
 */
export function calculateCoefficientsForMethod(
  dataPoints: DataPoint[],
  method: string,
): { slope: number; intercept: number } | { a: number; b: number } | undefined {
  if (dataPoints.length < 2) {
    return undefined;
  }

  switch (method) {
    case "linear":
      return calculateLinearRegression(dataPoints) || undefined;

    case "weightedLinear":
      return calculateWeightedLinearRegression(dataPoints) || undefined;

    case "exponential":
      return fitExponentialRegression(dataPoints) || undefined;

    case "recentExponential":
      if (dataPoints.length >= 4) {
        const recentData = dataPoints.slice(-4);
        return fitExponentialRegression(recentData) || undefined;
      }
      return fitExponentialRegression(dataPoints) || undefined;

    case "simple":
      // For simple method, use the last two points
      return calculateSimpleCoefficients(dataPoints) || undefined;

    default:
      return calculateLinearRegression(dataPoints) || undefined;
  }
}

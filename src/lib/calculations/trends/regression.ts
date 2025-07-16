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
  if (filtered.length < 2) return null;
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
  return { a, b };
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
 * Simple linear regression for backward compatibility
 * Returns slope and intercept for y = mx + b
 *
 * TODO: MIGRATION - This function uses year - minYear for x-values, so intercept is at the first year
 * Legacy functions expect intercept at year 0, so they convert: intercept = regression.intercept - slope * minYear
 * Future: Migrate all legacy functions to use this format directly
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
  const intercept = (sumY - slope * sumX) / n;

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

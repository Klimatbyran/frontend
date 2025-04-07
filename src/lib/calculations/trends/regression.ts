import { DataPoint, RegressionResult } from "./types";

/**
 * Calculate linear regression using least squares method
 */
export function calculateLinearRegression(data: DataPoint[]): RegressionResult {
  // Handle empty or invalid data
  if (!data?.length || data.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  // Filter out invalid points and ensure we have numbers
  const validData = data.filter(
    (point) =>
      point &&
      typeof point.year === "number" &&
      typeof point.value === "number" &&
      !isNaN(point.value),
  );

  if (validData.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const n = validData.length;
  const sumX = validData.reduce((sum, point) => sum + point.year, 0);
  const sumY = validData.reduce((sum, point) => sum + point.value, 0);
  const sumXY = validData.reduce(
    (sum, point) => sum + point.year * point.value,
    0,
  );
  const sumXX = validData.reduce(
    (sum, point) => sum + point.year * point.year,
    0,
  );

  // Calculate slope and intercept
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n, r2: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = validData.reduce((sum, point) => {
    const yPred = slope * point.year + intercept;
    return sum + Math.pow(point.value - yPred, 2);
  }, 0);
  const ssTot = validData.reduce((sum, point) => {
    return sum + Math.pow(point.value - yMean, 2);
  }, 0);

  // Handle case where all values are the same
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

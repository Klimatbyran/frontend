import { DataPoint } from "./types";

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

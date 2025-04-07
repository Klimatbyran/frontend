import { DataPoint, MovingAverageResult } from "./types";

/**
 * Calculate Simple Moving Average (SMA)
 * Returns both the smoothed values and the slope
 */
export function calculateSMA(
  data: DataPoint[],
  window: number,
): MovingAverageResult[] {
  if (!data?.length || window <= 0) {
    return [];
  }

  const result: MovingAverageResult[] = [];

  for (let i = window - 1; i < data.length; i++) {
    const windowData = data.slice(i - window + 1, i + 1);
    const average =
      windowData.reduce((sum, point) => sum + point.value, 0) / window;

    // Calculate local slope within the window
    const firstPoint = windowData[0];
    const lastPoint = windowData[windowData.length - 1];
    const slope =
      (lastPoint.value - firstPoint.value) / (lastPoint.year - firstPoint.year);

    result.push({
      year: data[i].year,
      value: average,
      slope: slope,
    });
  }

  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * Gives more weight to recent data points
 */
export function calculateEMA(
  data: DataPoint[],
  smoothingFactor: number = 0.3,
): MovingAverageResult[] {
  if (!data?.length) {
    return [];
  }

  const result: MovingAverageResult[] = [];
  let prevEMA = data[0]?.value ?? 0;

  for (let i = 0; i < data.length; i++) {
    const currentValue = data[i]?.value ?? 0;
    const ema =
      currentValue * smoothingFactor + prevEMA * (1 - smoothingFactor);

    // Calculate local slope
    const slope =
      i > 0 && data[i - 1]
        ? (ema - prevEMA) / (data[i].year - data[i - 1].year)
        : 0;

    result.push({
      year: data[i].year,
      value: ema,
      slope: slope,
    });

    prevEMA = ema;
  }

  return result;
}

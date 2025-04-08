import { DataPoint, TrendMethod } from "./types";
import { calculateLinearRegression } from "./regression";
import { calculateSMA, calculateEMA } from "./moving-averages";

/**
 * Calculate trend using multiple methods and combine them with adjustments for:
 * - Outlier detection and handling
 * - Weighted recent data
 * - Scope-specific analysis
 */
export function calculateCompositeTrend(
  data: DataPoint[],
  enableOutlierDetection: boolean = true,
): number {
  // Handle empty or invalid data
  if (!data?.length) {
    return 0;
  }

  // Ensure all data points have valid values
  const validData = data.filter(
    (point) =>
      point &&
      typeof point.year === "number" &&
      typeof point.value === "number" &&
      !isNaN(point.value),
  );

  if (validData.length < 2) {
    return 0;
  }

  // Handle outliers if enabled
  const adjustedData = enableOutlierDetection
    ? detectAndHandleOutliers(validData)
    : validData;

  // Define different trend calculation methods
  const methods: TrendMethod[] = [
    {
      name: "Linear Regression",
      calculate: (data) => {
        const result = calculateLinearRegression(data);
        // Reduce weight if R² is low (poor fit)
        return result.r2 < 0.6 ? result.slope * 0.5 : result.slope;
      },
      weight: 0.15, // Reduced weight for linear regression
    },
    {
      name: "SMA-3",
      calculate: (data) => {
        const sma = calculateSMA(data, 3);
        return sma.length > 0 ? sma[sma.length - 1].slope : 0;
      },
      weight: 0.25,
    },
    {
      name: "EMA",
      calculate: (data) => {
        const ema = calculateEMA(data, 0.4); // Increased smoothing factor
        return ema.length > 0 ? ema[ema.length - 1].slope : 0;
      },
      weight: 0.35, // Increased weight for EMA
    },
    {
      name: "Recent Change",
      calculate: (data) => {
        if (data.length < 2) return 0;
        // Use last 3 points if available
        const points = data.length >= 3 ? data.slice(-3) : data.slice(-2);
        const slopes = [];

        for (let i = 1; i < points.length; i++) {
          const yearDiff = points[i].year - points[i - 1].year;
          if (yearDiff === 0) continue; // Skip if years are the same

          slopes.push((points[i].value - points[i - 1].value) / yearDiff);
        }

        // Return average of recent slopes
        return slopes.length > 0
          ? slopes.reduce((a, b) => a + b, 0) / slopes.length
          : 0;
      },
      weight: 0.25,
    },
  ];

  // Calculate weighted average of all methods
  let totalWeight = 0;
  let weightedSlope = 0;

  methods.forEach((method) => {
    try {
      const slope = method.calculate(adjustedData);
      if (typeof slope === "number" && !isNaN(slope)) {
        weightedSlope += slope * method.weight;
        totalWeight += method.weight;
      }
    } catch (error) {
      console.warn(`Error calculating ${method.name} trend:`, error);
      // Skip this method if it fails
    }
  });

  if (totalWeight === 0) return 0;

  const finalSlope = weightedSlope / totalWeight;

  // Apply percentage-based adjustment
  // This ensures the trend doesn't predict unrealistic reductions
  const latestValue = adjustedData[adjustedData.length - 1].value;
  const maxYearlyReduction = latestValue * 0.15; // Max 15% reduction per year

  return Math.max(finalSlope, -maxYearlyReduction);
}

/**
 * Detect and handle outliers in the data series
 * Uses Median Absolute Deviation (MAD) method which is more robust than standard deviation
 */
function detectAndHandleOutliers(data: DataPoint[]): DataPoint[] {
  if (!data?.length || data.length < 4) return data;

  // Calculate median
  const values = [...data].sort((a, b) => a.value - b.value);
  const median = values[Math.floor(values.length / 2)].value;

  // Calculate MAD
  const deviations = values.map((point) => Math.abs(point.value - median));
  const mad = deviations.sort((a, b) => a - b)[
    Math.floor(deviations.length / 2)
  ];

  // Identify outliers (using modified z-score)
  const threshold = 3.5; // Conservative threshold
  const modifiedZScoreThreshold = threshold * mad;

  // Handle outliers by bringing them closer to the median
  return data.map((point) => {
    const deviation = Math.abs(point.value - median);
    if (deviation > modifiedZScoreThreshold) {
      // Adjust the value to be at the threshold
      const direction = point.value > median ? 1 : -1;
      return {
        year: point.year,
        value: median + direction * modifiedZScoreThreshold,
      };
    }
    return point;
  });
}

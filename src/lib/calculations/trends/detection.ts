import { DataPoint } from "./types";

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

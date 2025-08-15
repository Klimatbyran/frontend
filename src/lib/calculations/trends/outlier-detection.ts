/**
 * Outlier Detection Functions
 *
 * Functions for detecting and validating unusual data points in emissions data
 */

import { DataPoint } from "./types";
import { getMedian } from "./data-processing";

/**
 * Validate unusual points by checking if Scope 3 categories were added
 * Only checks Scope 3 if unusual point value > previous year value
 */
export function validateOutliersWithScope3(
  dataPoints: DataPoint[],
  unusualPoints: Array<{
    year: number;
    value: number;
    details: string;
  }>,
  originalData?: { year: number; total: number | null | undefined }[],
): Array<{
  year: number;
  value: number;
  reason: "unusual_change" | "no_scope3_improvement";
}> {
  const validatedOutliers: Array<{
    year: number;
    value: number;
    reason: "unusual_change" | "no_scope3_improvement";
  }> = [];

  // Find the most recent year to avoid excluding it
  const mostRecentYear = Math.max(...dataPoints.map((p) => p.year));

  for (const point of unusualPoints) {
    // Don't exclude the most recent data point - it's needed for the trendline
    if (point.year === mostRecentYear) {
      continue;
    }

    // Find the previous year's data point
    const previousPoint = dataPoints.find((p) => p.year === point.year - 1);

    if (previousPoint) {
      // Check if this is a near-zero emissions point (likely an outlier)
      const isNearZero = point.value < 100; // Less than 100 tons CO2e
      const isSignificantDrop =
        previousPoint.value > 1000 && point.value < previousPoint.value * 0.1; // Drop to less than 10% of previous

      if (isNearZero || isSignificantDrop) {
        // Near-zero emissions or significant drop - mark as outlier
        validatedOutliers.push({
          year: point.year,
          value: point.value,
          reason: "unusual_change",
        });
      } else if (point.value > previousPoint.value) {
        // Increase in emissions - check if it's justified by Scope 3 improvements
        const isScope3Justified = checkIfScope3Justified(
          point.year,
          previousPoint.year,
          originalData,
        );

        if (isScope3Justified) {
          // Increase is justified by new Scope 3 categories - don't mark as outlier
        } else {
          // Increase is not justified - mark as outlier (but not the most recent)
          if (point.year !== mostRecentYear) {
            validatedOutliers.push({
              year: point.year,
              value: point.value,
              reason: "no_scope3_improvement",
            });
          }
        }
      }
      // If point.value <= previousPoint.value and not near-zero, don't mark as outlier
    } else {
      // If no previous year data, check if it's near-zero
      if (point.value < 100) {
        validatedOutliers.push({
          year: point.year,
          value: point.value,
          reason: "unusual_change",
        });
      }
    }
  }

  return validatedOutliers;
}

/**
 * Check if an emission increase is justified by new Scope 3 categories
 * Compares Scope 3 categories between two years to see if new categories were added
 */
export function checkIfScope3Justified(
  currentYear: number,
  previousYear: number,
  originalData?: { year: number; total: number | null | undefined }[],
): boolean {
  if (!originalData) {
    // If we don't have access to the original data, assume it's justified (conservative)
    return true;
  }

  // Find the data for both years
  const currentYearData = originalData.find((d) => d.year === currentYear);
  const previousYearData = originalData.find((d) => d.year === previousYear);

  if (!currentYearData || !previousYearData) {
    // If we can't find data for either year, assume it's justified
    return true;
  }

  // Check if we have Scope 3 category data
  // Note: This assumes the original data includes scope3Categories
  // You might need to adjust this based on your actual data structure
  const currentScope3Categories =
    (currentYearData as any)?.scope3Categories || [];
  const previousScope3Categories =
    (previousYearData as any)?.scope3Categories || [];

  // If we don't have Scope 3 category data, assume it's justified
  if (
    currentScope3Categories.length === 0 &&
    previousScope3Categories.length === 0
  ) {
    return true;
  }

  // Check if new categories were added
  const currentCategoryIds = currentScope3Categories.map(
    (cat: any) => cat.category,
  );
  const previousCategoryIds = previousScope3Categories.map(
    (cat: any) => cat.category,
  );

  const newCategories = currentCategoryIds.filter(
    (id: number) => !previousCategoryIds.includes(id),
  );

  // If new categories were added, the increase is justified
  return newCategories.length > 0;
}

/**
 * Detect phase changes in emissions data that indicate significant shifts in reporting or operations
 * Returns information about detected phase changes for dashboard display
 */
export function detectPhaseChanges(
  data: DataPoint[],
  threshold: number = 0.6, // 60% change threshold
): {
  hasPhaseChanges: boolean;
  phaseChanges?: Array<{
    year: number;
    fromValue: number;
    toValue: number;
    changePercentage: number;
    reason: string;
  }>;
} {
  if (!data?.length || data.length < 4) {
    return { hasPhaseChanges: false };
  }

  const sortedData = [...data].sort((a, b) => a.year - b.year);
  const phaseChanges: Array<{
    year: number;
    fromValue: number;
    toValue: number;
    changePercentage: number;
    reason: string;
  }> = [];

  for (let i = 1; i < sortedData.length; i++) {
    const current = sortedData[i];
    const previous = sortedData[i - 1];

    if (previous.value > 0) {
      const changePercentage =
        Math.abs(current.value - previous.value) / previous.value;

      if (changePercentage > threshold) {
        const direction =
          current.value > previous.value ? "increase" : "decrease";
        const reason =
          changePercentage > 2 ? "major_phase_change" : "phase_change";

        // Mark the PREVIOUS year as the phase change (the last year of the old phase)
        // This way we filter out the old phase and keep the new stable phase
        phaseChanges.push({
          year: previous.year, // Changed from current.year to previous.year
          fromValue: previous.value,
          toValue: current.value,
          changePercentage: changePercentage * 100, // Convert to percentage
          reason: `${direction} of ${(changePercentage * 100).toFixed(1)}% from ${previous.year} to ${current.year} - marking ${previous.year} as end of old phase`,
        });
      }
    }
  }

  return {
    hasPhaseChanges: phaseChanges.length > 0,
    phaseChanges: phaseChanges.length > 0 ? phaseChanges : undefined,
  };
}

/**
 * Enhanced unusual points detection that considers both relative and absolute changes
 */
export function detectUnusualEmissionsPointsEnhanced(
  data: DataPoint[],
  relativeThreshold: number = 4,
  absoluteThreshold: number = 0.5, // 50% change
): {
  hasUnusualPoints: boolean;
  details?: {
    year: number;
    fromYear: number;
    toYear: number;
    fromValue: number;
    toValue: number;
    relativeChange: number;
    absoluteChange: number;
    threshold: number;
    direction: string;
    reason: string;
  }[];
  phaseChanges?: Array<{
    year: number;
    fromValue: number;
    toValue: number;
    changePercentage: number;
    reason: string;
  }>;
} {
  if (!data?.length || data.length < 4) {
    return { hasUnusualPoints: false };
  }

  // Detect phase changes first
  const phaseChangeResult = detectPhaseChanges(data);

  // Sort by year to ensure chronological order
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  const values = sortedData.map((p) => p.value);
  const years = sortedData.map((p) => p.year);

  // Calculate year-over-year changes
  const yearOverYearChanges: Array<{
    relativeChange: number;
    absoluteChange: number;
    fromYear: number;
    toYear: number;
    fromValue: number;
    toValue: number;
  }> = [];

  for (let i = 1; i < values.length; i++) {
    const currentValue = values[i];
    const previousValue = values[i - 1];
    if (previousValue !== 0) {
      const relativeChange = Math.abs(
        (currentValue - previousValue) / previousValue,
      );
      const absoluteChange = Math.abs(
        (currentValue - previousValue) / Math.max(currentValue, previousValue),
      );
      yearOverYearChanges.push({
        relativeChange,
        absoluteChange,
        fromYear: years[i - 1],
        toYear: years[i],
        fromValue: previousValue,
        toValue: currentValue,
      });
    }
  }

  if (yearOverYearChanges.length === 0) {
    return {
      hasUnusualPoints: false,
      phaseChanges: phaseChangeResult.phaseChanges,
    };
  }

  // Calculate thresholds
  const relativeChanges = yearOverYearChanges.map((c) => c.relativeChange);

  const medianRelativeChange = getMedian(relativeChanges);

  const relativeThresholdValue = relativeThreshold * medianRelativeChange;
  const absoluteThresholdValue = absoluteThreshold;

  // Find unusual points that exceed BOTH thresholds
  const unusualChanges = yearOverYearChanges.filter(
    (change) =>
      change.relativeChange > relativeThresholdValue &&
      change.absoluteChange > absoluteThresholdValue,
  );

  const hasUnusualPoints = unusualChanges.length > 0;

  // Create detailed information about unusual points
  const details = unusualChanges.map((change) => {
    const direction =
      change.toValue > change.fromValue ? "increase" : "decrease";

    return {
      year: change.toYear,
      fromYear: change.fromYear,
      toYear: change.toYear,
      fromValue: change.fromValue,
      toValue: change.toValue,
      relativeChange: change.relativeChange * 100, // Convert to percentage
      absoluteChange: change.absoluteChange * 100, // Convert to percentage
      threshold: Math.max(relativeThresholdValue, absoluteThresholdValue) * 100,
      direction,
      reason: `${change.fromYear}→${change.toYear}: ${(change.relativeChange * 100).toFixed(1)}% relative, ${(change.absoluteChange * 100).toFixed(1)}% absolute ${direction}`,
    };
  });

  return {
    hasUnusualPoints,
    details: hasUnusualPoints ? details : undefined,
    phaseChanges: phaseChangeResult.phaseChanges,
  };
}

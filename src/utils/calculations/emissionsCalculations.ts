/**
 * Common utility functions for emissions calculations
 */

/**
 * Get year-over-year emissions change percentage from API
 * Uses API-provided absolute value (all data) if available,
 * falls back to adjusted value (comparable data) if absolute is not present
 *
 * @param latestPeriod - The most recent reporting period
 * @returns The percentage change as a number, or null if not available
 */
export function calculateEmissionsChange(latestPeriod?: {
  emissionsChangeLastTwoYears?: {
    adjusted: number | null;
    absolute: number | null;
  } | null;
}): number | null {
  const adjusted = latestPeriod?.emissionsChangeLastTwoYears?.adjusted;
  const absolute = latestPeriod?.emissionsChangeLastTwoYears?.absolute;

  // Prefer absolute (all data), fallback to adjusted (comparable data)
  return absolute ?? adjusted ?? null;
}

/**
 * Carbon Law reduction rate constant (11.72% annual reduction)
 */
export const CARBON_LAW_REDUCTION_RATE = 0.1172;

/**
 * Generate a range of years from start to end (inclusive)
 * @param startYear - Starting year
 * @param endYear - Ending year
 * @returns Array of years
 */
export function generateYearRange(
  startYear: number,
  endYear: number,
): number[] {
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );
}

/**
 * Get the current year
 * @returns Current year as number
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Validate that data array has valid structure and contains years
 * @param data - Array of data points
 * @returns True if data is valid
 */
export function validateData<T extends { year: number }>(data: T[]): boolean {
  return data.length > 0 && data[0]?.year !== undefined;
}

/**
 * Filter data to only include points with valid total values.
 * @returns Type-safe array where all elements have valid total values
 */
export function getValidData<T extends { total?: number | null | undefined }>(
  data: T[],
): (T & { total: number })[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(
    (d): d is T & { total: number } =>
      d.total !== undefined && d.total !== null && !isNaN(d.total),
  );
}

/**
 * Calculate the minimum year from regression points.
 * When baseYear is provided, it's always the minimum year.
 * Otherwise, uses the earlier of the last two data points.
 * @throws {Error} When data array is empty or baseYear is invalid
 */
export function getMinYear(
  data: { year: number; total: number }[],
  baseYear?: number,
): number {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("getMinYear: Data array must be non-empty");
  }

  if (
    baseYear !== undefined &&
    (typeof baseYear !== "number" || isNaN(baseYear))
  ) {
    throw new Error("getMinYear: Base year must be a valid number");
  }

  if (baseYear) {
    return baseYear;
  }

  const validData = getValidData(data);
  const sorted = validData.sort((a, b) => a.year - b.year);
  const lastTwoPoints = sorted.slice(-2);
  return Math.min(...lastTwoPoints.map((p) => p.year));
}

/**
 * Calculate Paris Agreement line value (Carbon Law) for a given year.
 * Formula: currentValue * (1 - reductionRate)^(year - currentYear)
 * @param year - Target year for calculation
 * @param currentYear - Current year
 * @param currentYearValue - Emissions value for current year
 * @param reductionRate - Annual reduction rate (default: 0.1172 = 11.72%)
 * @returns Calculated Paris Agreement value or null if year is in the past
 */
export function calculateParisValue(
  year: number,
  currentYear: number,
  currentYearValue: number,
  reductionRate: number = CARBON_LAW_REDUCTION_RATE,
): number | null {
  if (typeof year !== "number" || isNaN(year)) {
    throw new Error("calculateParisValue: Year must be a valid number");
  }

  if (typeof currentYear !== "number" || isNaN(currentYear)) {
    throw new Error("calculateParisValue: Current year must be a valid number");
  }

  if (typeof currentYearValue !== "number" || isNaN(currentYearValue)) {
    throw new Error(
      "calculateParisValue: Current year value must be a valid number",
    );
  }

  if (currentYearValue <= 0) {
    return null;
  }

  if (year < currentYear) return null;

  const calculatedValue =
    currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
  return calculatedValue > 0 ? calculatedValue : null;
}

/**
 * Get regression points based on base year logic.
 * When baseYear is provided and different from the latest year, uses all data from baseYear onward.
 * Otherwise, uses the last two data points for regression.
 *
 * @param data - Array of data points with year and total values
 * @param baseYear - Optional base year for trend calculations
 * @returns Array of DataPoint objects for regression analysis
 */
export function getRegressionPoints(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): { year: number; value: number }[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const validData = getValidData(data);
  if (validData.length === 0) {
    return [];
  }

  if (baseYear && baseYear !== Math.max(...validData.map((d) => d.year))) {
    return validData
      .filter((d) => d.year >= baseYear)
      .map((d) => ({ year: d.year, value: d.total }));
  } else {
    const sorted = validData.sort((a, b) => a.year - b.year);
    return sorted.slice(-2).map((d) => ({ year: d.year, value: d.total }));
  }
}

/**
 * Calculate emissions change from base year to latest reporting period
 * Uses calculatedTotalEmissions from the API
 *
 * @param company - The company to calculate change for
 * @param options - Optional configuration
 * @param options.useLastPeriod - If true, uses the last period even if emissions are 0.
 *                                If false (default), finds the last period with >0 emissions.
 * @returns Percentage change as a number, or null if:
 *   - No reporting periods
 *   - No base year defined (no fallback to first period)
 *   - Baseline emissions is 0 or null
 *   - Latest period is the same year as base year (no change possible)
 *   - If useLastPeriod is false: no period with >0 emissions found after base year
 */
export function calculateEmissionsChangeFromBaseYear(
  company: {
    baseYear?: { year?: number } | null;
    reportingPeriods?: Array<{
      startDate: string;
      endDate: string;
      emissions?: {
        calculatedTotalEmissions?: number | null;
      } | null;
    }>;
  },
  options?: {
    useLastPeriod?: boolean;
  },
): number | null {
  if (!company.reportingPeriods || company.reportingPeriods.length === 0) {
    return null;
  }

  // Constraint: require a base year
  if (!company.baseYear?.year) {
    return null;
  }

  const baseYear = company.baseYear.year.toString();

  // Sort periods by start date (oldest first)
  const periods = [...company.reportingPeriods].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  if (periods.length < 1) {
    return null;
  }

  // Find baseline period matching the base year (using endDate year)
  const baselinePeriod = periods.find((p) => {
    const periodYear = new Date(p.endDate).getFullYear().toString();
    return periodYear === baseYear;
  });

  if (!baselinePeriod) {
    return null;
  }

  const baselineEmissions =
    baselinePeriod.emissions?.calculatedTotalEmissions ?? null;

  // Baseline emissions must be valid and > 0
  // Exclude companies where base year data is 0, null, or undefined
  // Cannot calculate meaningful change from base year without valid baseline data
  if (
    baselineEmissions === null ||
    baselineEmissions === undefined ||
    baselineEmissions === 0
  ) {
    return null;
  }

  // Find latest period based on option
  let latestPeriod: (typeof periods)[0] | null = null;

  if (options?.useLastPeriod) {
    // Use the last period in the array (even if 0)
    latestPeriod = periods[periods.length - 1];
  } else {
    // Find latest period with >0 emissions (working backwards from latest)
    for (let i = periods.length - 1; i >= 0; i--) {
      const emissions = periods[i].emissions?.calculatedTotalEmissions ?? null;
      if (emissions !== null && emissions > 0) {
        latestPeriod = periods[i];
        break;
      }
    }
  }

  if (!latestPeriod) {
    return null;
  }

  // Check if latest period is the same year as base year (using endDate year)
  const latestYear = new Date(latestPeriod.endDate).getFullYear().toString();
  if (latestYear === baseYear) {
    return null; // No change possible - same year
  }

  const latestEmissions = latestPeriod.emissions?.calculatedTotalEmissions ?? 0;

  // Calculate percentage change
  const changePercent =
    ((latestEmissions - baselineEmissions) / baselineEmissions) * 100;

  // Filter out extreme outliers (>200% in either direction) as likely data quality issues
  // These often indicate missing base year data, scope changes, mergers, etc.
  if (Math.abs(changePercent) > 200) {
    return null;
  }

  return changePercent;
}

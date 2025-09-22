/**
 * Data Processing Utilities
 *
 * Pure data processing functions for trend analysis
 */

/**
 * Get list of missing years between base year and latest data year
 */
export function getMissingYearsList(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): number[] {
  const validData = data.filter(
    (d) => d.total !== undefined && d.total !== null,
  );
  if (validData.length === 0) return [];

  const years = validData.map((d) => d.year).sort((a, b) => a - b);
  const startYear = baseYear || years[0];
  const endYear = years[years.length - 1];

  const missingYears: number[] = [];
  for (let year = startYear; year <= endYear; year++) {
    if (!years.includes(year)) {
      missingYears.push(year);
    }
  }

  return missingYears;
}

/**
 * Filter data to only include points with valid total values since base year
 */
export function getValidDataSinceBaseYear(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): { year: number; total: number }[] {
  return data.filter(
    (d): d is { year: number; total: number } =>
      d.total !== undefined &&
      d.total !== null &&
      (baseYear === undefined || d.year >= baseYear),
  );
}

/**
 * Calculates missing years in emissions data (base year aware and counts zero emissions as missing)
 * @param data Array of emissions data points
 * @param baseYear Optional base year to filter data from
 * @returns Number of missing years
 */
export function calculateMissingYears(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): number {
  const validData = data.filter(
    (d) => d.total !== undefined && d.total !== null,
  );
  if (validData.length === 0) return 0;

  const years = validData.map((d) => d.year).sort((a, b) => a - b);
  const startYear = baseYear || years[0];
  const endYear = years[years.length - 1];

  const expectedYears = endYear - startYear + 1;
  const actualYears = years.length;

  return Math.max(0, expectedYears - actualYears);
}

/**
 * Get median value from array of numbers
 */
export function getMedian(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

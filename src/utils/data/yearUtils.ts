// Helper function to get latest year's data
export function getSectorsReportingYear(): number {
  return Math.round(new Date().getFullYear() - 1.5);
}

/** Fraction of the calendar year elapsed at `date` (0 at Jan 1, 1 at Dec 31 end). */
export function getYearProgress(date: Date = new Date()): number {
  const year = date.getFullYear();
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const elapsed = date.getTime() - start;
  const total = end - start;
  if (total <= 0) {
    return 1;
  }
  return Math.min(1, Math.max(0, elapsed / total));
}

/** Chart x-position for “today” within the current calendar year. */
export function getCurrentYearChartPosition(date: Date = new Date()): number {
  const year = date.getFullYear();
  return year + getYearProgress(date);
}

export function getLatestYearData<T>(
  data: Record<string, T> | undefined,
): T | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const years = Object.keys(data)
    .map(Number)
    .filter((year) => !isNaN(year))
    .sort((a, b) => b - a);

  return years.length > 0 ? data[years[0].toString()] : undefined;
}

// Helper function to get all years from data
export function getAvailableYears(
  data: Record<string, unknown> | undefined,
): number[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  return Object.keys(data)
    .map(Number)
    .filter((year) => !isNaN(year))
    .sort((a, b) => b - a);
}

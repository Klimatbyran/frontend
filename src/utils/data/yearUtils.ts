// Helper function to get latest year's data
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

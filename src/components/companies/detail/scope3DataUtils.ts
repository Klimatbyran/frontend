interface Scope3Category {
  category: number;
  total: number;
  unit: string;
}

interface HistoricalScope3Data {
  year: number;
  total: number;
  unit: string;
  categories: Scope3Category[];
}

export function getAvailableYears(
  historicalData?: HistoricalScope3Data[],
): number[] {
  return (
    historicalData
      ?.map((data) => data.year)
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort((a, b) => b - a) || []
  );
}

export function getSelectedCategories(
  selectedYear: string,
  currentCategories: Scope3Category[],
  historicalData?: HistoricalScope3Data[],
): Scope3Category[] {
  if (selectedYear === "latest") {
    return currentCategories;
  }

  return (
    historicalData?.find((data) => data.year === parseInt(selectedYear))
      ?.categories ?? currentCategories
  );
}

export function getDisplayYear(
  selectedYear: string,
  availableYears: number[],
): number {
  const latestYear = availableYears[0] ?? new Date().getFullYear();
  return selectedYear === "latest" ? latestYear : parseInt(selectedYear);
}

export function getSelectedScope3Total(
  selectedYear: string,
  currentTotal: number,
  historicalData?: HistoricalScope3Data[],
): number {
  if (selectedYear === "latest") {
    return currentTotal;
  }

  return (
    historicalData?.find((data) => data.year === parseInt(selectedYear))
      ?.total ?? currentTotal
  );
}

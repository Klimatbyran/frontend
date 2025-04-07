import { ChartData } from "@/types/emissions";
import type { EmissionPeriod } from "@/lib/calculations/emissions";

export function getChartData(processedPeriods: EmissionPeriod[]): ChartData[] {
  if (!processedPeriods || processedPeriods.length === 0) return [];

  const sortedPeriods = [...processedPeriods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  // Get last year and add 5 years
  const lastYear = new Date(
    sortedPeriods[sortedPeriods.length - 1].endDate,
  ).getFullYear();
  const futureYears = Array.from({ length: 5 }, (_, i) => lastYear + i + 1);

  // Extract unique category keys from historical data
  const categoryKeys = new Set(
    processedPeriods.flatMap(
      (period) =>
        period.emissions?.scope3?.categories?.map(
          (cat) => `cat${cat.category}`,
        ) || [],
    ),
  );

  const historicalData = sortedPeriods.map((period) => {
    const year = new Date(period.endDate).getFullYear();

    // Capture original values before overriding with 0 for graph continuity
    const categoryData = [...categoryKeys].reduce<
      Record<string, number | null>
    >((acc, key) => {
      const categoryEntry = period.emissions?.scope3?.categories?.find(
        (cat) => `cat${cat.category}` === key,
      );

      acc[key] = categoryEntry?.total ?? null; // Preserve null if data is missing
      return acc;
    }, {});

    return {
      year,
      total: period.emissions?.calculatedTotalEmissions ?? 0,
      scope1: period.emissions?.scope1?.total ?? 0,
      scope2: period.emissions?.scope2?.calculatedTotalEmissions ?? 0,
      scope3: period.emissions?.scope3?.calculatedTotalEmissions ?? 0,
      originalValues: { ...categoryData }, // Keep original null values
      ...Object.fromEntries(
        Object.entries(categoryData).map(([key, value]) => [key, value ?? 0]), // Graph continuity: replace null with 0
      ),
    };
  });

  // Add empty future years
  const futureData = futureYears.map((year) => ({
    year,
    total: undefined,
    scope1: undefined,
    scope2: undefined,
    scope3: undefined,
    ...Object.fromEntries([...categoryKeys].map((key) => [key, undefined])),
    originalValues: Object.fromEntries(
      [...categoryKeys].map((key) => [key, null]),
    ),
  }));

  return [...historicalData, ...futureData];
}

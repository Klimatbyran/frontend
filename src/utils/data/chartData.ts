import { ChartData } from "@/types/emissions";
import type {
  ReportingPeriod,
  ReportingPeriodFromList,
  AIGeneratable,
} from "@/types/company";

export function getChartData(
  processedPeriods: ReportingPeriod[],
  isAIGenerated: (data: AIGeneratable | undefined | null) => boolean,
  isEmissionsAIGenerated: (period: ReportingPeriod | ReportingPeriodFromList) => boolean,
): ChartData[] {
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
    const scope1 = period.emissions?.scope1;
    const scope2 = period.emissions?.scope2;
    const scope3 = period.emissions?.scope3;
    const scope1Data = scope1
      ? { value: scope1.total ?? 0, isAIGenerated: isAIGenerated(scope1) }
      : undefined;
    const scope2Data = scope2
      ? {
          value: scope2.calculatedTotalEmissions ?? 0,
          isAIGenerated: isAIGenerated(scope2),
        }
      : undefined;
    const scope3Categories =
      scope3?.categories?.map((cat) => ({
        category: cat.category,
        value: cat.total ?? 0,
        isAIGenerated: isAIGenerated(cat),
      })) ?? [];
    const scope3Data = scope3
      ? {
          value: scope3.calculatedTotalEmissions ?? 0,
          isAIGenerated: scope3Categories.some((cat) => cat.isAIGenerated),
        }
      : undefined;
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
      isAIGenerated: isEmissionsAIGenerated(period),
      scope1: scope1Data,
      scope2: scope2Data,
      scope3: scope3Data,
      scope3Categories,
      originalValues: { ...categoryData },
      ...Object.fromEntries(
        Object.entries(categoryData).map(([key, value]) => [key, value ?? 0]),
      ),
    };
  });

  // Add empty future years
  const futureData = futureYears.map((year) => ({
    year,
    total: undefined,
    isAIGenerated: false,
    scope1: undefined,
    scope2: undefined,
    scope3: undefined,
    scope3Categories: [],
    ...Object.fromEntries([...categoryKeys].map((key) => [key, undefined])),
    originalValues: Object.fromEntries(
      [...categoryKeys].map((key) => [key, null]),
    ),
  }));

  return [...historicalData, ...futureData];
}

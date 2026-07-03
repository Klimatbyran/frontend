import { ChartData } from "@/types/emissions";
import type {
  ReportingPeriod,
  ReportingPeriodFromList,
  AIGeneratable,
} from "@/types/company";

type AIGeneratedChecker = (data: AIGeneratable | undefined | null) => boolean;
type EmissionsAIGeneratedChecker = (
  period: ReportingPeriod | ReportingPeriodFromList,
) => boolean;

function buildScopeData(
  period: ReportingPeriod,
  isAIGenerated: AIGeneratedChecker,
) {
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

  return { scope1Data, scope2Data, scope3Data, scope3Categories };
}

function buildCategoryData(
  period: ReportingPeriod,
  categoryKeys: Set<string>,
): Record<string, number | null> {
  return [...categoryKeys].reduce<Record<string, number | null>>((acc, key) => {
    const categoryEntry = period.emissions?.scope3?.categories?.find(
      (cat) => `cat${cat.category}` === key,
    );
    acc[key] = categoryEntry?.total ?? null;
    return acc;
  }, {});
}

function buildHistoricalDataPoint(
  period: ReportingPeriod,
  categoryKeys: Set<string>,
  isAIGenerated: AIGeneratedChecker,
  isEmissionsAIGenerated: EmissionsAIGeneratedChecker,
): ChartData {
  const year = new Date(period.endDate).getFullYear();
  const { scope1Data, scope2Data, scope3Data, scope3Categories } =
    buildScopeData(period, isAIGenerated);
  const categoryData = buildCategoryData(period, categoryKeys);

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
}

function buildFutureDataPoints(
  futureYears: number[],
  categoryKeys: Set<string>,
): ChartData[] {
  return futureYears.map((year) => ({
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
}

export function getChartData(
  processedPeriods: ReportingPeriod[],
  isAIGenerated: AIGeneratedChecker,
  isEmissionsAIGenerated: EmissionsAIGeneratedChecker,
): ChartData[] {
  if (!processedPeriods || processedPeriods.length === 0) return [];

  const sortedPeriods = [...processedPeriods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  const lastYear = new Date(
    sortedPeriods[sortedPeriods.length - 1].endDate,
  ).getFullYear();
  const futureYears = Array.from({ length: 5 }, (_, i) => lastYear + i + 1);

  const categoryKeys = new Set(
    processedPeriods.flatMap(
      (period) =>
        period.emissions?.scope3?.categories?.map(
          (cat) => `cat${cat.category}`,
        ) || [],
    ),
  );

  const historicalData = sortedPeriods.map((period) =>
    buildHistoricalDataPoint(
      period,
      categoryKeys,
      isAIGenerated,
      isEmissionsAIGenerated,
    ),
  );

  return [
    ...historicalData,
    ...buildFutureDataPoints(futureYears, categoryKeys),
  ];
}

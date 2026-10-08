import type { ChartData } from "@/types/emissions";
import type {
  PageCompanyEmissionsHistory,
  PageCompanyHeader,
  PageCompanyScope3,
  PageCompanyTurnoverHistory,
} from "@/types/pages";

/** Minimal period rows for the auth-only emissions assessment dialog. */
export function periodsFromAvailableYears(years: number[]) {
  return [...years]
    .sort((a, b) => b - a)
    .map((year) => ({
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    }));
}

export function chartDataFromEmissionsHistory(
  history: PageCompanyEmissionsHistory,
): ChartData[] {
  if (history.periods.length === 0) return [];

  const sorted = [...history.periods].sort((a, b) => a.year - b.year);
  const lastYear = sorted[sorted.length - 1].year;
  const futureYears = Array.from({ length: 5 }, (_, i) => lastYear + i + 1);
  const categoryKeys = new Set(
    sorted.flatMap((period) =>
      period.scope3Categories.map((cat) => `cat${cat.category}`),
    ),
  );

  const historical: ChartData[] = sorted.map((period) => {
    const categoryData = Object.fromEntries(
      [...categoryKeys].map((key) => {
        const category = period.scope3Categories.find(
          (cat) => `cat${cat.category}` === key,
        );
        return [key, category?.value ?? null];
      }),
    );

    return {
      year: period.year,
      total: period.total ?? 0,
      isAIGenerated: period.isAIGenerated,
      scope1: period.scope1
        ? {
            value: period.scope1.value ?? 0,
            isAIGenerated: period.scope1.isAIGenerated,
          }
        : undefined,
      scope2: period.scope2
        ? {
            value: period.scope2.value ?? 0,
            isAIGenerated: period.scope2.isAIGenerated,
          }
        : undefined,
      scope3: period.scope3
        ? {
            value: period.scope3.value ?? 0,
            isAIGenerated: period.scope3.isAIGenerated,
          }
        : undefined,
      scope3Categories: period.scope3Categories.map((cat) => ({
        category: cat.category,
        value: cat.value ?? 0,
        isAIGenerated: cat.isAIGenerated,
      })),
      originalValues: categoryData,
      ...Object.fromEntries(
        Object.entries(categoryData).map(([key, value]) => [key, value ?? 0]),
      ),
    };
  });

  const future: ChartData[] = futureYears.map((year) => ({
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

  return [...historical, ...future];
}

export function chartDataFromTurnoverHistory(
  history: PageCompanyTurnoverHistory,
): ChartData[] {
  return [...history.periods]
    .sort((a, b) => a.year - b.year)
    .map((period) => ({
      year: period.year,
      total: period.total ?? 0,
      isAIGenerated: period.isAIGenerated,
      turnover: period.turnover ?? undefined,
      turnoverCurrency: period.turnoverCurrency ?? undefined,
      turnoverIsAIGenerated: period.turnoverIsAIGenerated,
      scope1: undefined,
      scope2: undefined,
      scope3: undefined,
      scope3Categories: [],
    }));
}

export function scope3EmissionsFromPage(scope3: PageCompanyScope3, unit: string) {
  if (!scope3.categories.length) return null;
  return {
    scope3: {
      total: scope3.calculatedTotalEmissions ?? 0,
      unit,
      categories: scope3.categories.map((category) => ({
        category: category.category,
        total: category.total ?? 0,
        unit,
        metadata: category.isAIGenerated
          ? null
          : { verifiedBy: { name: "verified" } },
      })),
    },
  };
}

export function companyIndustryFromHeader(header: PageCompanyHeader) {
  if (!header.sectorCode && !header.industryGroupCode) return null;
  return {
    industryGics: {
      sectorCode: header.sectorCode ?? undefined,
      groupCode: header.industryGroupCode ?? undefined,
    },
  };
}

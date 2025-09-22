import { ChartData } from "@/types/emissions";
import type { EmissionPeriod } from "@/types/emissions";

/**
 * Interpolate missing Scope 3 category data between periods
 * This helps create smoother visualisations while clearly marking interpolated values
 */
export function interpolateScope3Categories(
  periods: EmissionPeriod[],
): EmissionPeriod[] {
  // Sort periods by date
  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  // Find all unique categories across all periods
  const allCategories = new Set<number>();
  sortedPeriods.forEach((period) => {
    period.emissions?.scope3?.categories?.forEach((cat) => {
      allCategories.add(cat.category);
    });
  });

  // For each period, interpolate missing categories
  return sortedPeriods.map((period, index) => {
    if (
      !period.emissions?.scope3?.categories ||
      index === 0 ||
      index === sortedPeriods.length - 1
    ) {
      return period;
    }

    const prevPeriod = sortedPeriods[index - 1];
    const nextPeriod = sortedPeriods[index + 1];
    const currentCategories = new Set(
      period.emissions.scope3.categories.map((c) => c.category),
    );
    const interpolatedCategories = [...period.emissions.scope3.categories];

    // Check each category for potential interpolation
    allCategories.forEach((category) => {
      if (currentCategories.has(category)) return;

      const prevValue = prevPeriod.emissions?.scope3?.categories?.find(
        (c) => c.category === category,
      )?.total;
      const nextValue = nextPeriod.emissions?.scope3?.categories?.find(
        (c) => c.category === category,
      )?.total;

      // Only interpolate if we have both previous and next values
      if (prevValue !== undefined && nextValue !== undefined) {
        const prevDate = new Date(prevPeriod.startDate).getTime();
        const nextDate = new Date(nextPeriod.startDate).getTime();
        const currentDate = new Date(period.startDate).getTime();

        // Linear interpolation
        const progress = (currentDate - prevDate) / (nextDate - prevDate);
        const interpolatedValue =
          prevValue + (nextValue - prevValue) * progress;

        interpolatedCategories.push({
          category,
          total: interpolatedValue,
          unit: "tCO₂e",
          isInterpolated: true,
        });
      }
    });

    return {
      ...period,
      emissions: {
        ...period.emissions,
        scope3: {
          ...period.emissions.scope3,
          categories: interpolatedCategories,
        },
      },
    };
  });
}

export function getChartData(
  processedPeriods: EmissionPeriod[],
  isAIGenerated: (data: any) => boolean,
  isEmissionsAIGenerated: (period: any) => boolean,
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

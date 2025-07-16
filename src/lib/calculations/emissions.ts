
export interface EmissionPeriod {
  startDate: string;
  endDate: string;
  emissions: {
    calculatedTotalEmissions: number;
    scope1?: { total: number; unit: string } | null;
    scope2?: {
      calculatedTotalEmissions: number;
    } | null;
    scope3?: {
      calculatedTotalEmissions: number;
      categories?: Array<{
        category: number;
        total: number;
        unit: string;
        isInterpolated?: boolean;
      }>;
    } | null;
  } | null;
}


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

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff =
    squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}



export function getDataQualityColor(
  quality: "high" | "medium" | "low",
): string {
  switch (quality) {
    case "high":
      return "var(--green-3)";
    case "medium":
      return "var(--orange-3)";
    case "low":
      return "var(--pink-3)";
  }
}

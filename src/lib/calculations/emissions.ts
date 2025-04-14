import { calculateCompositeTrend } from "./trends/composite";
import { calculateLinearRegression } from "./trends/regression";
import type { DataPoint } from "./trends/types";

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

export interface TrendAnalysis {
  trend: {
    slope: number;
    r2: number;
    type: "total" | "scope12" | "unreliable";
    startYear: number;
    endYear: number;
    dataPoints: DataPoint[];
  };
  standardDeviation: number;
  dataQuality: "high" | "medium" | "low";
  hasScope3: boolean;
  consistentScope3: boolean;
  scope3Coverage: number;
  message: string;
  baseYear: number;
  hasEmissions: boolean;
}

/**
 * Interpolate missing Scope 3 category data between periods
 * This helps create smoother visualizations while clearly marking interpolated values
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

export function analyzeTrend(
  periods: EmissionPeriod[],
  features: {
    interpolateScope3?: boolean;
    guessBaseYear?: boolean;
    compositeTrend?: boolean;
    outlierDetection?: boolean;
  } = {
    interpolateScope3: true,
    guessBaseYear: true,
    compositeTrend: true,
    outlierDetection: true,
  },
): TrendAnalysis {
  // Sort periods by date
  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  // Find first period with non-zero emissions if guessBaseYear is enabled
  const firstNonZeroPeriod = features.guessBaseYear
    ? sortedPeriods.find(
        (period) =>
          period.emissions && period.emissions.calculatedTotalEmissions > 0,
      )
    : sortedPeriods[0];

  // If no emissions, return early with default values
  if (!firstNonZeroPeriod) {
    const startYear = new Date(sortedPeriods[0].startDate).getFullYear();
    const endYear = new Date(
      sortedPeriods[sortedPeriods.length - 1].endDate,
    ).getFullYear();

    return {
      trend: {
        slope: 0,
        r2: 0,
        type: "unreliable",
        startYear,
        endYear,
        dataPoints: sortedPeriods.map((period) => ({
          year: new Date(period.startDate).getFullYear(),
          value: 0,
        })),
      },
      standardDeviation: 0,
      dataQuality: "low",
      hasScope3: false,
      consistentScope3: false,
      scope3Coverage: 0,
      message: "Inga utsläpp har rapporterats.",
      baseYear: startYear,
      hasEmissions: false,
    };
  }

  // Only include periods from first non-zero emissions onwards
  const firstNonZeroYear = new Date(firstNonZeroPeriod.startDate).getFullYear();
  const relevantPeriods = features.guessBaseYear
    ? sortedPeriods.filter(
        (period) =>
          new Date(period.startDate).getFullYear() >= firstNonZeroYear,
      )
    : sortedPeriods;

  // Extract different emission series
  const totalEmissions = relevantPeriods
    .filter((period) => (period.emissions?.calculatedTotalEmissions || 0) > 0)
    .map((period) => ({
      year: new Date(period.startDate).getFullYear(),
      value: period.emissions?.calculatedTotalEmissions || 0,
    }));

  const scope12Emissions = relevantPeriods
    .filter(
      (period) =>
        (period.emissions?.scope1?.total || 0) +
          (period.emissions?.scope2?.calculatedTotalEmissions || 0) >
        0,
    )
    .map((period) => ({
      year: new Date(period.startDate).getFullYear(),
      value:
        (period.emissions?.scope1?.total || 0) +
        (period.emissions?.scope2?.calculatedTotalEmissions || 0),
    }));

  // Check Scope 3 consistency
  const hasScope3 = relevantPeriods.some(
    (p) => p.emissions?.scope3?.calculatedTotalEmissions,
  );
  const scope3Count = relevantPeriods.filter(
    (p) => p.emissions?.scope3?.calculatedTotalEmissions,
  ).length;
  const scope3Coverage = scope3Count / relevantPeriods.length;
  const consistentScope3 = hasScope3 && scope3Coverage > 0.8;

  // Calculate standard deviation
  const totalStdDev = calculateStandardDeviation(
    totalEmissions.map((e) => e.value),
  );
  const scope12StdDev = calculateStandardDeviation(
    scope12Emissions.map((e) => e.value),
  );

  // Calculate trend based on enabled features
  let bestTrend;
  let trendType: "total" | "scope12" | "unreliable";
  let dataQuality: "high" | "medium" | "low";
  let message: string;

  const slope = features.compositeTrend
    ? calculateCompositeTrend(totalEmissions, features.outlierDetection)
    : calculateLinearRegression(totalEmissions).slope;

  if (consistentScope3 && scope3Coverage > 0.8) {
    bestTrend = {
      slope,
      r2: 0.7,
      dataPoints: totalEmissions,
    };
    trendType = "total";
    dataQuality = "high";
    message =
      "Trendberäkningen baseras på totala utsläpp (scope 1-3) med hög tillförlitlighet.";
  } else if (scope12StdDev < totalStdDev * 0.5) {
    bestTrend = {
      slope: features.compositeTrend
        ? calculateCompositeTrend(scope12Emissions, features.outlierDetection)
        : calculateLinearRegression(scope12Emissions).slope,
      r2: 0.6,
      dataPoints: scope12Emissions,
    };
    trendType = "scope12";
    dataQuality = "medium";
    message =
      "Trendberäkningen baseras endast på scope 1-2 utsläpp då scope 3 data är inkonsekvent.";
  } else {
    bestTrend = {
      slope,
      r2: 0.5,
      dataPoints: totalEmissions,
    };
    trendType = "unreliable";
    dataQuality = "low";
    message =
      "Trendberäkningen har låg tillförlitlighet på grund av stora variationer eller bristfällig data.";
  }

  return {
    trend: {
      ...bestTrend,
      type: trendType,
      startYear: firstNonZeroYear,
      endYear:
        totalEmissions[totalEmissions.length - 1]?.year || firstNonZeroYear,
    },
    standardDeviation: trendType === "total" ? totalStdDev : scope12StdDev,
    dataQuality,
    hasScope3,
    consistentScope3,
    scope3Coverage,
    message,
    baseYear: firstNonZeroYear,
    hasEmissions: true,
  };
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff =
    squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Project future emissions using a progressive reduction model
 *
 * This approach:
 * 1. Starts with the initial trend rate
 * 2. Gradually reduces the rate of change over time
 * 3. Uses a damping factor to prevent unrealistic long-term projections
 * 4. Ensures projections stay within reasonable bounds
 */
export function projectEmissions(
  analysis: TrendAnalysis,
  startValue: number,
  endYear: number = 2050,
): Array<{ year: number; trend: number; paris: number }> {
  const startYear = analysis.baseYear;
  const years = endYear - startYear + 1;
  // If no emissions, return flat zero projections
  if (!analysis.hasEmissions) {
    return Array.from({ length: years }, (_, i) => ({
      year: startYear + i,
      trend: 0,
      paris: 0,
    }));
  }

  // Find first non-zero value with safety checks
  const firstNonZeroValue = Math.max(
    analysis.trend.dataPoints.find((point) => point.value > 0)?.value ||
      startValue,
    0.1, // Minimum value to prevent division by zero
  );

  // Calculate initial annual change with bounds and safety checks
  const historicalPoints = analysis.trend.dataPoints
    .filter((point) => point.value > 0)
    .sort((a, b) => a.year - b.year);

  let initialAnnualChange = 0;

  if (historicalPoints.length >= 2) {
    const firstPoint = historicalPoints[0];
    const lastPoint = historicalPoints[historicalPoints.length - 1];
    const yearDiff = lastPoint.year - firstPoint.year;

    if (yearDiff > 0) {
      // Use compound annual growth rate (CAGR) formula
      initialAnnualChange =
        Math.pow(lastPoint.value / firstPoint.value, 1 / yearDiff) - 1;

      // Limit initial change to reasonable bounds (-15% to +15% per year)
      initialAnnualChange = Math.max(
        Math.min(initialAnnualChange, 0.15),
        -0.15,
      );
    }
  }

  // Paris agreement requires 7.6% reduction per year
  const parisAnnualReduction = 0.076;

  // Calculate damping factors
  const getDampingFactor = (yearsFromStart: number) => {
    // Progressive reduction in rate of change
    // - First 5 years: 100% of initial rate
    // - Years 5-10: Linear reduction to 70% of initial rate
    // - Years 10-15: Linear reduction to 50% of initial rate
    // - Years 15+: Exponential decay to 30% of initial rate
    if (yearsFromStart <= 5) {
      return 1;
    } else if (yearsFromStart <= 10) {
      return 1 - (0.3 * (yearsFromStart - 5)) / 5;
    } else if (yearsFromStart <= 15) {
      return 0.7 - (0.2 * (yearsFromStart - 10)) / 5;
    } else {
      return 0.5 * Math.exp(-0.05 * (yearsFromStart - 15));
    }
  };

  return Array.from({ length: years }, (_, i) => {
    const year = startYear + i;
    const dampingFactor = getDampingFactor(i);
    // Calculate trend value using damped percentage change
    // Use Math.max to ensure we don't go below zero
    const dampedChange = initialAnnualChange * dampingFactor;
    const trend = Math.max(
      0,
      firstNonZeroValue * Math.pow(1 + dampedChange, i),
    );

    // Calculate Paris agreement target using compound reduction
    // The Paris target remains constant as it's a policy goal
    const paris = Math.max(
      0,
      firstNonZeroValue * Math.pow(1 - parisAnnualReduction, i),
    );

    return { year, trend, paris };
  });
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

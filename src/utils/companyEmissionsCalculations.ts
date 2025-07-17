import type { ChartData } from "@/types/emissions";
import type { DataPoint } from "@/lib/calculations/trends/types";
import {
  calculateLinearRegression,
  fitExponentialRegression,
} from "@/lib/calculations/trends/regression";

// Helper to convert ChartData[] to DataPoint[]
export function toDataPoints(
  data: { year: number; total: number }[],
): DataPoint[] {
  return data
    .filter((d) => d.total !== undefined && d.total !== null)
    .map((d) => ({ year: d.year, value: d.total }));
}

// Helper to get regression points based on base year logic
function getRegressionPoints(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): DataPoint[] {
  const validData = data.filter(
    (d) => d.total !== undefined && d.total !== null,
  );
  if (baseYear && baseYear !== Math.max(...validData.map((d) => d.year))) {
    // Use all data from base year onward
    return validData
      .filter((d) => d.year >= baseYear)
      .map((d) => ({ year: d.year, value: d.total! }));
  } else {
    // Use last two data points
    const sorted = validData.sort((a, b) => a.year - b.year);
    return sorted.slice(-2).map((d) => ({ year: d.year, value: d.total! }));
  }
}

// Base year-aware trend coefficients calculation
export const calculateTrendCoefficients = (
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
) => {
  const regressionPoints = getRegressionPoints(data, baseYear);
  if (regressionPoints.length < 2) {
    return null;
  }

  const regression = calculateLinearRegression(regressionPoints);
  if (!regression) {
    return null;
  }

  // TODO: MIGRATION - The new regression function returns intercept at the first year in the data
  // We need to convert it to intercept at year 0 for compatibility with existing code
  // Future: Migrate all functions to use the new format directly and remove this conversion
  const minYear = Math.min(...regressionPoints.map((p) => p.year));
  const intercept = regression.intercept - regression.slope * minYear;

  return { slope: regression.slope, intercept };
};

// Last-point anchored trend coefficients calculation
export const calculateAnchoredTrendCoefficients = (
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
) => {
  const regressionPoints = getRegressionPoints(data, baseYear);
  if (regressionPoints.length < 2) {
    return null;
  }

  const regression = calculateLinearRegression(regressionPoints);
  if (!regression) {
    return null;
  }

  // Get the last actual data point
  const validData = data.filter(
    (d): d is { year: number; total: number } =>
      d.total !== undefined && d.total !== null,
  );
  const lastYearWithData = Math.max(...validData.map((d) => d.year));
  const lastActualValue = validData.find(
    (d) => d.year === lastYearWithData,
  )?.total;

  if (lastActualValue === undefined) {
    return null;
  }

  // Use the slope from regression but calculate intercept to pass through last point
  const slope = regression.slope;
  const intercept = lastActualValue - slope * lastYearWithData;

  return { slope, intercept };
};

export const calculateApproximatedHistorical = (
  data: ChartData[],
  lastYearWithData: number,
  currentYear: number,
  baseYear?: number,
) => {
  const filteredData = data
    .filter((d) => typeof d.total === "number" && d.total !== null)
    .map((d) => ({ year: d.year, total: d.total! }));

  // Use anchored trend coefficients to avoid visual "humps"
  const trendCoefficients = calculateAnchoredTrendCoefficients(
    filteredData,
    baseYear,
  );
  if (!trendCoefficients) {
    return null;
  }

  // Include the last year with data as the starting point
  const approximatedYears = Array.from(
    { length: currentYear - lastYearWithData + 1 },
    (_, i) => lastYearWithData + i,
  );

  if (approximatedYears.length === 0) {
    return null;
  }

  const lastDataPoint = data.find((d) => d.year === lastYearWithData);
  if (!lastDataPoint?.total) {
    return null;
  }

  const approximatedData: Record<number, number> = {};

  for (const year of approximatedYears) {
    if (year === lastYearWithData) {
      // Use the actual value for the last reported year
      approximatedData[year] = lastDataPoint.total;
    } else {
      // Use the trend for subsequent years
      const approximatedValue = Math.max(
        0,
        trendCoefficients.slope * year + trendCoefficients.intercept,
      );
      approximatedData[year] = approximatedValue;
    }
  }

  // Calculate cumulative emissions using trapezoidal integration
  const years = Object.keys(approximatedData)
    .map(Number)
    .sort((a, b) => a - b);
  let cumulativeEmissions = 0;

  for (let i = 1; i < years.length; i++) {
    const year1 = years[i - 1];
    const year2 = years[i];
    const value1 = approximatedData[year1];
    const value2 = approximatedData[year2];

    // Trapezoidal rule: area = (base * (height1 + height2)) / 2
    cumulativeEmissions += ((year2 - year1) * (value1 + value2)) / 2;
  }

  return {
    approximatedData,
    cumulativeEmissions,
    trendCoefficients,
  };
};

export const calculateFutureTrend = (
  data: ChartData[],
  lastYearWithData: number,
  currentYear: number,
  endYear: number = 2050,
  baseYear?: number,
) => {
  const filteredData = data
    .filter((d) => typeof d.total === "number" && d.total !== null)
    .map((d) => ({ year: d.year, total: d.total! }));

  // Use anchored trend coefficients to avoid visual "humps"
  const trendCoefficients = calculateAnchoredTrendCoefficients(
    filteredData,
    baseYear,
  );
  if (!trendCoefficients) {
    return null;
  }

  const futureYears = Array.from(
    { length: endYear - currentYear },
    (_, i) => currentYear + 1 + i,
  );

  if (futureYears.length === 0) {
    return null;
  }

  // Get starting value - either from actual data or approximated historical
  let startingValue: number;
  const lastDataPoint = data.find((d) => d.year === lastYearWithData);

  if (currentYear > lastYearWithData && lastDataPoint?.total) {
    // Use approximated historical value if available
    const approximatedHistorical = calculateApproximatedHistorical(
      data,
      lastYearWithData,
      currentYear,
      baseYear,
    );
    startingValue =
      approximatedHistorical?.approximatedData[currentYear] ||
      lastDataPoint.total;
  } else {
    startingValue = lastDataPoint?.total || 0;
  }

  const trendData: Record<number, number> = {
    [currentYear]: startingValue,
  };

  // Project future values using trend coefficients
  for (const year of futureYears) {
    const trendValue = Math.max(
      0,
      trendCoefficients.slope * year + trendCoefficients.intercept,
    );
    trendData[year] = trendValue;
  }

  // Calculate cumulative emissions using trapezoidal integration
  const years = Object.keys(trendData)
    .map(Number)
    .sort((a, b) => a - b);
  let cumulativeEmissions = 0;

  for (let i = 1; i < years.length; i++) {
    const year1 = years[i - 1];
    const year2 = years[i];
    const value1 = trendData[year1];
    const value2 = trendData[year2];

    cumulativeEmissions += ((year2 - year1) * (value1 + value2)) / 2;
  }

  return {
    trendData,
    cumulativeEmissions,
    trendCoefficients,
  };
};

export const generateExponentialApproximatedData = (
  data: ChartData[],
  endYear: number = 2050,
  baseYear?: number,
) => {
  const filteredData = data
    .filter((d) => typeof d.total === "number" && d.total !== null)
    .map((d) => ({ year: d.year, total: d.total! }));

  const regressionPoints = getRegressionPoints(filteredData, baseYear);
  if (regressionPoints.length < 2) return null;

  // Get the actual last year with data from the full dataset
  const validData = data.filter(
    (d): d is ChartData & { total: number } =>
      d.total !== undefined && d.total !== null,
  );
  const lastYearWithData = Math.max(...validData.map((d) => d.year));
  const lastActualValue = validData.find(
    (d) => d.year === lastYearWithData,
  )?.total;
  const currentYear = new Date().getFullYear();

  const expFit = fitExponentialRegression(regressionPoints);
  if (!expFit) return null;

  // Calculate scale so the exponential curve passes through the last data point
  const fitValueAtLast = expFit.a * Math.exp(expFit.b * lastYearWithData);
  const scale =
    lastActualValue && fitValueAtLast ? lastActualValue / fitValueAtLast : 1;

  if (!data.length) return [];
  const firstYear = data[0]?.year;
  if (firstYear === undefined) return [];

  const allYears = Array.from(
    { length: endYear - firstYear + 1 },
    (_, i) => firstYear + i,
  );
  const reductionRate = 0.1172;

  return allYears.map((year) => {
    const actualData = data.find((d) => d.year === year);
    let approximatedValue = null;

    if (year > lastYearWithData) {
      approximatedValue = scale * expFit.a * Math.exp(expFit.b * year);
      if (approximatedValue < 0) approximatedValue = 0;
    } else if (year === lastYearWithData) {
      approximatedValue = lastActualValue ?? null;
    } // else: leave as null for years before lastYearWithData

    let parisValue = null;
    if (year >= currentYear) {
      const currentYearValue =
        scale * expFit.a * Math.exp(expFit.b * currentYear);
      const calculatedValue =
        currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
      parisValue = calculatedValue > 0 ? calculatedValue : null;
    }

    return {
      year,
      total: actualData?.total,
      approximated: approximatedValue,
      carbonLaw: parisValue,
      isAIGenerated: actualData?.isAIGenerated,
      scope1: actualData?.scope1,
      scope2: actualData?.scope2,
      scope3: actualData?.scope3,
      scope3Categories: actualData?.scope3Categories,
      originalValues: actualData?.originalValues,
    };
  });
};

// Update main generator to support mode
export type SophisticatedTrendMode = "linear" | "exponential";

export const generateSophisticatedApproximatedData = (
  data: ChartData[],
  endYear: number = 2050,
  mode: SophisticatedTrendMode = "linear",
  baseYear?: number,
) => {
  const filteredData = data
    .filter((d) => typeof d.total === "number" && d.total !== null)
    .map((d) => ({ year: d.year, total: d.total! }));

  if (mode === "exponential") {
    return generateExponentialApproximatedData(data, endYear, baseYear);
  }
  // Default: linear
  if (filteredData.length < 2) {
    return null;
  }

  const lastYearWithData = Math.max(...filteredData.map((d) => d.year));
  const currentYear = new Date().getFullYear();

  // Calculate trend coefficients using base year logic
  const trendCoefficients = calculateTrendCoefficients(filteredData, baseYear);
  if (!trendCoefficients) {
    return null;
  }

  // Calculate approximated historical data (fill gaps)
  const approximatedHistorical = calculateApproximatedHistorical(
    data,
    lastYearWithData,
    currentYear,
    baseYear,
  );

  // Calculate future trend projection
  const futureTrend = calculateFutureTrend(
    data,
    lastYearWithData,
    currentYear,
    endYear,
    baseYear,
  );

  if (!futureTrend) {
    return null;
  }

  // Generate comprehensive data array
  if (!data.length) return [];
  const firstYear = data[0]?.year;
  if (firstYear === undefined) return [];
  const allYears = Array.from(
    { length: endYear - firstYear + 1 },
    (_, i) => firstYear + i,
  );

  const reductionRate = 0.1172; // Carbon Law reduction rate

  return allYears.map((year) => {
    const actualData = data.find((d) => d.year === year);

    // Determine approximated value
    let approximatedValue = null;
    if (year >= lastYearWithData) {
      if (year <= currentYear && approximatedHistorical) {
        // Use approximated historical for gap years (including lastYearWithData)
        approximatedValue =
          approximatedHistorical.approximatedData[year] ?? null;
      } else if (year > currentYear && futureTrend) {
        // Use future trend for projection years
        approximatedValue = futureTrend.trendData[year] || null;
      }
    }

    // Calculate Paris line value (Carbon Law)
    let parisValue = null;
    if (year >= currentYear) {
      const currentYearValue =
        approximatedHistorical?.approximatedData[currentYear] ||
        filteredData.find((d) => d.year === currentYear)?.total ||
        trendCoefficients.slope * currentYear + trendCoefficients.intercept;

      const calculatedValue =
        currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
      parisValue = calculatedValue > 0 ? calculatedValue : null;
    }

    return {
      year,
      total: actualData?.total,
      approximated: approximatedValue,
      carbonLaw: parisValue,
      isAIGenerated: actualData?.isAIGenerated,
      scope1: actualData?.scope1,
      scope2: actualData?.scope2,
      scope3: actualData?.scope3,
      scope3Categories: actualData?.scope3Categories,
      originalValues: actualData?.originalValues,
    };
  });
};

// Simple calculation with base year support
export const generateApproximatedData = (
  data: ChartData[],
  regression?: { slope: number; intercept: number },
  endYear: number = 2030,
  baseYear?: number,
) => {
  const filteredData = data
    .filter((d) => typeof d.total === "number" && d.total !== null)
    .map((d) => ({ year: d.year, total: d.total! }));

  // If we have no valid data, return empty array
  if (filteredData.length === 0) return [];

  // If we have only one data point, we can still generate carbon law line
  if (filteredData.length < 2) {
    const currentYear = new Date().getFullYear();
    const firstYear = filteredData[0].year;
    const allYears = Array.from(
      { length: endYear - firstYear + 1 },
      (_, i) => firstYear + i,
    );
    const reductionRate = 0.1172;

    return allYears.map((year) => {
      let parisValue = null;
      if (year >= currentYear) {
        const currentYearValue = filteredData[0].total;
        const calculatedValue =
          currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
        parisValue = calculatedValue > 0 ? calculatedValue : null;
      }
      return {
        year,
        approximated: null,
        total: data.find((d) => d.year === year)?.total,
        carbonLaw: parisValue,
      };
    });
  }

  // If base year is null/undefined, use last two data points
  const baseYearValue = baseYear
    ? baseYear
    : filteredData.length >= 2
      ? filteredData[filteredData.length - 2].year
      : filteredData[0]?.year;

  if (baseYearValue === undefined) return [];
  const points = filteredData.filter((d) => d.year >= baseYearValue);

  // Use provided regression if available, otherwise fallback to average annual change
  let slope = 0;
  let intercept = 0;
  if (
    regression &&
    typeof regression.slope === "number" &&
    typeof regression.intercept === "number"
  ) {
    slope = regression.slope;
    // TODO: MIGRATION - The new regression function returns intercept at the first year in the data
    // We need to convert it to intercept at year 0 for the formula: slope * year + intercept
    // Future: Migrate this function to use the new format: slope * (year - minYear) + intercept
    const minYear = Math.min(...points.map((p) => p.year));
    intercept = regression.intercept - slope * minYear;
  } else if (points.length > 1) {
    let totalChange = 0;
    let totalYears = 0;
    for (let i = 1; i < points.length; i++) {
      totalChange += points[i].total - points[i - 1].total;
      totalYears += points[i].year - points[i - 1].year;
    }
    slope = totalYears !== 0 ? totalChange / totalYears : 0;
    // Anchor at last point
    intercept =
      points[points.length - 1].total - slope * points[points.length - 1].year;
  }

  const lastYearWithData =
    points.length > 0
      ? points[points.length - 1].year
      : filteredData[filteredData.length - 1].year;
  const lastValue =
    points.length > 0
      ? points[points.length - 1].total
      : filteredData[filteredData.length - 1].total;
  const currentYear = new Date().getFullYear();

  // More robust checks for data array
  if (!data.length) return [];
  if (!data[0] || data[0].year === undefined) return [];

  const firstYear = data[0].year;
  const allYears = Array.from(
    { length: endYear - firstYear + 1 },
    (_, i) => firstYear + i,
  );
  const reductionRate = 0.1172;
  return allYears.map((year) => {
    let approximatedValue = null;
    if (year > lastYearWithData) {
      approximatedValue = slope * year + intercept;
      if (approximatedValue < 0) approximatedValue = 0;
    } else if (year === lastYearWithData) {
      approximatedValue = lastValue;
    }
    let parisValue = null;
    if (year >= currentYear) {
      const currentYearValue = slope * currentYear + intercept;
      const calculatedValue =
        currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
      parisValue = calculatedValue > 0 ? calculatedValue : null;
    }
    return {
      year,
      approximated: approximatedValue,
      total: data.find((d) => d.year === year)?.total,
      carbonLaw: parisValue,
    };
  });
};

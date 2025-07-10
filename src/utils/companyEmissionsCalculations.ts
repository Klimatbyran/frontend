import type { ChartData } from "@/types/emissions";

export const calculateLinearRegression = (data: { x: number; y: number }[]) => {
  const n = data.length;
  if (n < 2) {
    return null;
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const lastPoint = data[data.length - 1];
  const intercept = lastPoint.y - slope * lastPoint.x;

  return { slope, intercept };
};

// Weighted linear regression that gives more weight to recent data points
export const calculateWeightedLinearRegression = (
  data: { x: number; y: number }[],
) => {
  const n = data.length;
  if (n < 4) {
    // If less than 4 points, fall back to regular linear regression
    return calculateLinearRegression(data);
  }

  // Sort data by year to ensure proper ordering
  const sortedData = [...data].sort((a, b) => a.x - b.x);

  // Exponential decay weights: most recent gets 1, next gets decay, then decay^2, ...
  const decay = 0.7;
  const weights = sortedData.map((_, index) => Math.pow(decay, n - 1 - index));

  let sumW = 0;
  let sumWX = 0;
  let sumWY = 0;
  let sumWXY = 0;
  let sumWXX = 0;

  for (let i = 0; i < n; i++) {
    const point = sortedData[i];
    const weight = weights[i];

    sumW += weight;
    sumWX += weight * point.x;
    sumWY += weight * point.y;
    sumWXY += weight * point.x * point.y;
    sumWXX += weight * point.x * point.x;
  }

  const slope =
    (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
  const lastPoint = sortedData[sortedData.length - 1];
  const intercept = lastPoint.y - slope * lastPoint.x;

  return { slope, intercept };
};

// Helper to get regression points based on base year logic
function getRegressionPoints(
  data: ChartData[],
  baseYear?: number,
): { x: number; y: number }[] {
  const validData = data.filter(
    (d): d is ChartData & { total: number } =>
      d.total !== undefined && d.total !== null,
  );
  if (baseYear && baseYear !== Math.max(...validData.map((d) => d.year))) {
    // Use all data from base year onward
    return validData
      .filter((d) => d.year >= baseYear)
      .map((d) => ({ x: d.year, y: d.total }));
  } else {
    // Use last two data points
    const sorted = validData.sort((a, b) => a.year - b.year);
    return sorted.slice(-2).map((d) => ({ x: d.year, y: d.total }));
  }
}

// Base year-aware trend coefficients calculation
export const calculateTrendCoefficients = (
  data: ChartData[],
  baseYear?: number,
) => {
  const regressionPoints = getRegressionPoints(data, baseYear);
  if (regressionPoints.length < 2) {
    return null;
  }
  const x = regressionPoints.map((d) => d.x);
  const y = regressionPoints.map((d) => d.y);
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

export const calculateApproximatedHistorical = (
  data: ChartData[],
  lastYearWithData: number,
  currentYear: number,
  baseYear?: number,
) => {
  const trendCoefficients = calculateTrendCoefficients(data, baseYear);
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
  const trendCoefficients = calculateTrendCoefficients(data, baseYear);
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

// Base year-aware exponential regression
export function fitExponentialRegression(data: { x: number; y: number }[]) {
  const filtered = data.filter((d) => d.y > 0);
  if (filtered.length < 2) return null;
  const n = filtered.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const { x, y } of filtered) {
    const ly = Math.log(y);
    sumX += x;
    sumY += ly;
    sumXY += x * ly;
    sumXX += x * x;
  }
  const b = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const a = Math.exp((sumY - b * sumX) / n);
  return { a, b };
}

// Weighted exponential regression: fit y = a * exp(bx) with exponential decay weights
export function calculateWeightedExponentialRegression(
  data: { x: number; y: number }[],
  decay: number = 0.7,
) {
  // Only use points with y > 0
  const filtered = data.filter((d) => d.y > 0);
  const n = filtered.length;
  if (n < 2) return null;
  // Most recent gets weight 1, next gets decay, then decay^2, ...
  const weights = filtered.map((_, i) => Math.pow(decay, n - 1 - i));
  let sumW = 0,
    sumWX = 0,
    sumWY = 0,
    sumWXY = 0,
    sumWXX = 0;
  for (let i = 0; i < n; i++) {
    const x = filtered[i].x;
    const ly = Math.log(filtered[i].y);
    const w = weights[i];
    sumW += w;
    sumWX += w * x;
    sumWY += w * ly;
    sumWXY += w * x * ly;
    sumWXX += w * x * x;
  }
  const b = (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
  const a = Math.exp((sumWY - b * sumWX) / sumW);
  return { a, b };
}

// Recent exponential regression: fit y = a * exp(bx) to last N years (unweighted)
export function calculateRecentExponentialRegression(
  data: { x: number; y: number }[],
  recentN: number = 4,
) {
  // Only use points with y > 0
  const filtered = data.filter((d) => d.y > 0);
  if (filtered.length < 2) return null;
  const recent = filtered.slice(-recentN);
  const n = recent.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = recent[i].x;
    const ly = Math.log(recent[i].y);
    sumX += x;
    sumY += ly;
    sumXY += x * ly;
    sumXX += x * x;
  }
  const b = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const a = Math.exp((sumY - b * sumX) / n);
  return { a, b };
}

export const generateExponentialApproximatedData = (
  data: ChartData[],
  endYear: number = 2050,
  baseYear?: number,
) => {
  const regressionPoints = getRegressionPoints(data, baseYear);
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

  const allYears = Array.from(
    { length: endYear - data[0].year + 1 },
    (_, i) => data[0].year + i,
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
  if (mode === "exponential") {
    return generateExponentialApproximatedData(data, endYear, baseYear);
  }
  // Default: linear
  const validData = data.filter(
    (d): d is ChartData & { total: number } =>
      d.total !== undefined && d.total !== null,
  );

  if (validData.length < 2) {
    return null;
  }

  const lastYearWithData = Math.max(...validData.map((d) => d.year));
  const currentYear = new Date().getFullYear();

  // Calculate trend coefficients using base year logic
  const trendCoefficients = calculateTrendCoefficients(data, baseYear);
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
  const allYears = Array.from(
    { length: endYear - data[0].year + 1 },
    (_, i) => data[0].year + i,
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
        validData.find((d) => d.year === currentYear)?.total ||
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
  const validData = data.filter(
    (d): d is ChartData & { total: number } =>
      d.total !== undefined && d.total !== null,
  );
  if (validData.length < 2) return [];
  const baseYearValue =
    baseYear && baseYear !== Math.max(...validData.map((d) => d.year))
      ? baseYear
      : validData[validData.length - 2].year;
  const points = validData.filter((d) => d.year >= baseYearValue);

  // Use provided regression if available, otherwise fallback to average annual change
  let slope = 0;
  let intercept = 0;
  if (
    regression &&
    typeof regression.slope === "number" &&
    typeof regression.intercept === "number"
  ) {
    slope = regression.slope;
    intercept = regression.intercept;
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

  const lastYearWithData = points[points.length - 1].year;
  const lastValue = points[points.length - 1].total;
  const currentYear = new Date().getFullYear();
  const allYears = Array.from(
    { length: endYear - data[0].year + 1 },
    (_, i) => data[0].year + i,
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

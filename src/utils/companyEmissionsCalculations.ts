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

export const generateApproximatedData = (
  data: ChartData[],
  regression: { slope: number; intercept: number },
  endYear: number = 2030,
) => {
  const lastReportedYear = data
    .filter(
      (d): d is ChartData & { total: number } =>
        d.total !== undefined && d.total !== null,
    )
    .reduce((lastYear, d) => Math.max(lastYear, d.year), 0);

  const approximatedStartYear = data[0].year;
  const currentYear = new Date().getFullYear();

  const currentYearApproximatedValue =
    regression.slope * currentYear + regression.intercept;

  const allYears = Array.from(
    { length: endYear - approximatedStartYear + 1 },
    (_, i) => approximatedStartYear + i,
  );

  const reductionRate = 0.1172;

  return allYears.map((year) => {
    const shouldShowApproximated = year >= lastReportedYear;

    // Calculate trend line value
    let approximatedValue = null;
    if (shouldShowApproximated) {
      const calculatedValue = regression.slope * year + regression.intercept;
      // Only show trend line if it's above 0
      approximatedValue = calculatedValue > 0 ? calculatedValue : null;
    }

    // Calculate Paris line value
    let parisValue = null;
    if (year >= currentYear) {
      const calculatedValue =
        currentYearApproximatedValue *
        Math.pow(1 - reductionRate, year - currentYear);
      // Only show Paris line if it's above 0
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

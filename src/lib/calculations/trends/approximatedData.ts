import { ChartData } from "@/types/emissions";

// Carbon Law reduction rate constant (11.72% annual reduction)
const CARBON_LAW_REDUCTION_RATE = 0.1172;

type LinearCoefficients = { slope: number; intercept: number };
type ExponentialCoefficients = { a: number; b: number };
type Coefficients = LinearCoefficients | ExponentialCoefficients;

function hasTotalEmissions(d: ChartData): d is ChartData & { total: number } {
  return d.total !== undefined && d.total !== null;
}

function getEmissionsData(data: ChartData[]) {
  return data.filter(hasTotalEmissions);
}

function getLastEmissionsValue(data: ChartData[]): number {
  return getEmissionsData(data).sort((a, b) => b.year - a.year)[0]?.total || 0;
}

function getLastYearWithData(data: ChartData[]): number {
  return Math.max(...getEmissionsData(data).map((d) => d.year));
}

function applyCoefficients(
  lastDataValue: number,
  yearsFromLast: number,
  coefficients: Coefficients,
): number {
  if ("slope" in coefficients && "intercept" in coefficients) {
    return Math.max(0, lastDataValue + coefficients.slope * yearsFromLast);
  }

  if ("a" in coefficients && "b" in coefficients) {
    const growthFactor = Math.exp(coefficients.b * yearsFromLast);
    const expValue = lastDataValue * growthFactor;
    const maxReasonableValue = 1000000;
    const minReasonableValue = 0.1;
    return Math.max(minReasonableValue, Math.min(expValue, maxReasonableValue));
  }

  return lastDataValue;
}

function calculateApproximatedValue(
  year: number,
  data: ChartData[],
  coefficients: Coefficients,
  lastYearWithData: number,
): number | null {
  if (year < lastYearWithData) {
    return null;
  }

  const lastDataValue = getLastEmissionsValue(data);
  if (year === lastYearWithData) {
    return lastDataValue;
  }

  return applyCoefficients(
    lastDataValue,
    year - lastYearWithData,
    coefficients,
  );
}

function getParisLineStartYear(): number {
  return new Date().getFullYear();
}

/**
 * Emissions in the Paris line's start year: reported data when it exists,
 * otherwise the trend estimate for that year.
 */
function calculateEmissionsAtYear(
  data: ChartData[],
  coefficients: Coefficients,
  year: number,
): number {
  const actual = data.find((d) => d.year === year)?.total;
  if (actual !== undefined && actual !== null) {
    return actual;
  }

  const lastDataValue = getLastEmissionsValue(data);
  const lastYearWithData = getLastYearWithData(data);
  return applyCoefficients(
    lastDataValue,
    year - lastYearWithData,
    coefficients,
  );
}

/**
 * Paris line starts at the current year and then falls by Carbon Law.
 * Years before today have no Paris value.
 */
function calculateParisLineValue(
  year: number,
  data: ChartData[],
  coefficients: Coefficients,
): number | null {
  const startYear = getParisLineStartYear();
  if (year < startYear) {
    return null;
  }

  const startEmissions = calculateEmissionsAtYear(
    data,
    coefficients,
    startYear,
  );
  if (startEmissions <= 0) {
    return null;
  }

  const calculatedValue =
    startEmissions * Math.pow(1 - CARBON_LAW_REDUCTION_RATE, year - startYear);
  return calculatedValue > 0 ? calculatedValue : null;
}

function buildYearChartData(
  year: number,
  data: ChartData[],
  coefficients: Coefficients,
  lastYearWithData: number,
): ChartData {
  const actualData = data.find((d) => d.year === year);

  return {
    year,
    total: actualData?.total,
    approximated: calculateApproximatedValue(
      year,
      data,
      coefficients,
      lastYearWithData,
    ),
    carbonLaw: calculateParisLineValue(year, data, coefficients),
    isAIGenerated: actualData?.isAIGenerated,
    scope1: actualData?.scope1,
    scope2: actualData?.scope2,
    scope3: actualData?.scope3,
    scope3Categories: actualData?.scope3Categories,
    originalValues: actualData?.originalValues,
  };
}

// Helper to get last two periods with emissions
function getLastTwoEmissionsPoints(data: ChartData[]) {
  return getEmissionsData(data)
    .map((d) => ({ year: d.year, value: d.total as number }))
    .slice(-2);
}

/**
 * Generates approximated data with support for both linear and exponential coefficients.
 */
export function generateApproximatedDataWithCoefficients(
  data: ChartData[],
  coefficients: Coefficients,
  endYear: number,
): ChartData[] | null {
  if (!data.length) return null;

  const firstYear = data[0].year;
  const allYears = Array.from(
    { length: endYear - firstYear + 1 },
    (_, i) => firstYear + i,
  );
  const lastYearWithData = getLastYearWithData(data);

  return allYears.map((year) =>
    buildYearChartData(year, data, coefficients, lastYearWithData),
  );
}

/**
 * Main function to generate approximated data.
 */
export function generateApproximatedData(
  data: ChartData[],
  endYear: number = 2030,
  coefficients?: Coefficients,
): ChartData[] {
  if (coefficients) {
    const result = generateApproximatedDataWithCoefficients(
      data,
      coefficients,
      endYear,
    );
    return result || [];
  }

  return [];
}

export { getLastTwoEmissionsPoints };

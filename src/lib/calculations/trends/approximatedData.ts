import { ChartData } from "@/types/emissions";
import { generateApproximatedData as legacyGenerateApproximatedData } from "@/utils/calculations/emissions";

// Carbon Law reduction rate constant (11.72% annual reduction)
const CARBON_LAW_REDUCTION_RATE = 0.1172;

function hasTotalEmissions(d: ChartData): d is ChartData & { total: number } {
  return d.total !== undefined && d.total !== null;
}

// Helper to get last two periods with emissions
function getLastTwoEmissionsPoints(data: ChartData[]) {
  return data
    .filter(hasTotalEmissions)
    .map((d) => ({ year: d.year, value: d.total as number }))
    .slice(-2);
}

/**
 * Generates approximated data with support for both linear and exponential coefficients.
 * This is a consolidated version that handles both simple and advanced regression scenarios.
 *
 * @param data - Array of ChartData objects
 * @param coefficients - Either linear { slope, intercept } or exponential { a, b } coefficients
 * @param endYear - End year for the projection
 * @param baseYear - Optional base year for calculations
 * @param cleanData - Optional clean data from trend analysis
 * @returns Array of ChartData objects with approximated and Paris line values
 */
export function generateApproximatedDataWithCoefficients(
  data: ChartData[],
  coefficients: { slope: number; intercept: number } | { a: number; b: number },
  endYear: number,
  baseYear?: number,
  cleanData?: { year: number; value: number }[],
): ChartData[] | null {
  if (!data.length) return null;

  const firstYear = data[0].year;
  const allYears = Array.from(
    { length: endYear - firstYear + 1 },
    (_, i) => firstYear + i,
  );

  // Use the actual last year with data from the original data
  const lastYearWithData = Math.max(
    ...data.filter((d) => hasTotalEmissions(d)).map((d) => d.year),
  );
  const currentYear = new Date().getFullYear();

  return allYears.map((year) => {
    const actualData = data.find((d) => d.year === year);

    // Calculate approximated value based on method and coefficients
    // Modified: approximated data only extends until current year
    let approximatedValue: number | null = null;
    if (year >= lastYearWithData && year <= currentYear) {
      // Get the actual last data point value
      const lastDataValue =
        data
          .filter((d) => hasTotalEmissions(d))
          .sort((a, b) => b.year - a.year)[0]?.total || 0;

      if (year === lastYearWithData) {
        // Use the actual last data point value
        approximatedValue = lastDataValue;
      } else {
        // Apply the calculated slope/growth rate from the last actual data point
        const yearsFromLast = year - lastYearWithData;

        if ("slope" in coefficients && "intercept" in coefficients) {
          // Linear coefficients - apply slope from last data point
          approximatedValue = Math.max(
            0,
            lastDataValue + coefficients.slope * yearsFromLast,
          );
        } else if ("a" in coefficients && "b" in coefficients) {
          // Exponential coefficients - apply growth rate from last data point
          const growthFactor = Math.exp(coefficients.b * yearsFromLast);
          const expValue = lastDataValue * growthFactor;
          // Cap exponential values to prevent extreme values
          const maxReasonableValue = 1000000; // 1 million tCO2e
          const minReasonableValue = 0.1; // 0.1 tCO2e
          approximatedValue = Math.max(
            minReasonableValue,
            Math.min(expValue, maxReasonableValue),
          );
        }
      }
    }

    // Calculate Paris line value (Carbon Law) - Modified: starts at current year
    let parisValue: number | null = null;
    if (year >= currentYear) {
      // Get the current year value - either from actual data or trendline
      let emissionsCurrentYear: number;
      const actualCurrentYearData = data.find(
        (d) => d.year === currentYear,
      )?.total;

      if (
        actualCurrentYearData !== undefined &&
        actualCurrentYearData !== null
      ) {
        // Use actual current year data if available
        emissionsCurrentYear = actualCurrentYearData;
      } else {
        // Calculate current year value from trendline
        const lastDataValue =
          data
            .filter((d) => hasTotalEmissions(d))
            .sort((a, b) => b.year - a.year)[0]?.total || 0;
        const lastYearWithData = Math.max(
          ...data.filter((d) => hasTotalEmissions(d)).map((d) => d.year),
        );
        const yearsFromLast = currentYear - lastYearWithData;

        if ("slope" in coefficients && "intercept" in coefficients) {
          emissionsCurrentYear = Math.max(
            0,
            lastDataValue + coefficients.slope * yearsFromLast,
          );
        } else if ("a" in coefficients && "b" in coefficients) {
          const growthFactor = Math.exp(coefficients.b * yearsFromLast);
          const expValue = lastDataValue * growthFactor;
          const maxReasonableValue = 1000000; // 1 million tCO2e
          const minReasonableValue = 0.1; // 0.1 tCO2e
          emissionsCurrentYear = Math.max(
            minReasonableValue,
            Math.min(expValue, maxReasonableValue),
          );
        } else {
          emissionsCurrentYear = lastDataValue;
        }
      }

      // Apply Carbon Law reduction from current year onwards
      const calculatedValue =
        emissionsCurrentYear *
        Math.pow(1 - CARBON_LAW_REDUCTION_RATE, year - currentYear);
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
}

/**
 * Main function to generate approximated data.
 * Handles both simple regression (fallback) and advanced coefficient-based calculations.
 *
 * @param data - Array of ChartData objects
 * @param regression - Optional regression parameters for simple calculations
 * @param endYear - End year for the projection
 * @param baseYear - Optional base year for calculations
 * @param coefficients - Optional advanced coefficients (linear or exponential)
 * @param cleanData - Optional clean data from trend analysis
 * @returns Array of ChartData objects
 */
export function generateApproximatedData(
  data: ChartData[],
  regression?: { slope: number; intercept: number },
  endYear: number = 2030,
  baseYear?: number,
  coefficients?:
    | { slope: number; intercept: number }
    | { a: number; b: number },
  cleanData?: { year: number; value: number }[],
): ChartData[] {
  // If we have advanced coefficients, use the new function
  if (coefficients) {
    const result = generateApproximatedDataWithCoefficients(
      data,
      coefficients,
      endYear,
      baseYear,
      cleanData,
    );
    return result || [];
  }

  // Otherwise, fall back to the legacy function for simple regression
  return legacyGenerateApproximatedData(data, regression, endYear, baseYear);
}

// Export the helper function for use in other components
export { getLastTwoEmissionsPoints };

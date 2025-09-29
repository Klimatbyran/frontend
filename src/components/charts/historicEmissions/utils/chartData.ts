/**
 * Chart data filtering utilities
 */

export const filterValidTotalData = (data: any[]) => {
  return data.filter((d) => d.total !== undefined && d.total !== null);
};

export const filterValidScopeData = (data: any[]) => {
  return data.filter((d) => {
    return (
      (d.scope1?.value !== undefined && d.scope1?.value !== null) ||
      (d.scope2?.value !== undefined && d.scope2?.value !== null) ||
      (d.scope3?.value !== undefined && d.scope3?.value !== null)
    );
  });
};

export const filterValidCategoryData = (data: any[]) => {
  return data.filter((d) => {
    return Object.keys(d).some((key) => {
      if (key.startsWith("cat") && d[key]) {
        const categoryValue = d[key];
        return (
          categoryValue !== undefined &&
          categoryValue !== null &&
          categoryValue !== 0
        );
      }
      return false;
    });
  });
};

export const filterDataByYearRange = (data: any[], endYear: number) => {
  return data.filter((point) => point.year <= endYear);
};

/**
 * Merge main chart data with approximated data for tooltip compatibility
 * Similar to municipality data structure with all properties in single dataset
 * Splits approximated data into:
 * - approximated: current year and before
 * - trend: future years
 */
export const mergeChartDataWithApproximated = (
  mainData: any[],
  approximatedData: any[] | null | undefined,
) => {
  if (!approximatedData) return mainData;

  const currentYear = new Date().getFullYear();

  // Create a map of approximated data by year
  const approximatedMap = new Map(
    approximatedData.map((item) => [item.year, item]),
  );

  // Get all unique years from both datasets
  const allYears = new Set([
    ...mainData.map((item) => item.year),
    ...approximatedData.map((item) => item.year),
  ]);

  // Create merged data similar to municipality structure
  return Array.from(allYears)
    .sort((a, b) => a - b)
    .map((year) => {
      const mainDataPoint = mainData.find((d) => d.year === year);
      const approxDataPoint = approximatedMap.get(year);

      // For companies: approximated covers current year and before, trend covers future years
      // This matches municipality behavior exactly
      const approximatedValue =
        year <= currentYear ? approxDataPoint?.approximated : undefined;
      const trendValue =
        year >= currentYear ? approxDataPoint?.approximated : undefined;

      return {
        year,
        total: mainDataPoint?.total,
        approximated: approximatedValue,
        trend: trendValue,
        carbonLaw: approxDataPoint?.carbonLaw,
        // Preserve other properties from main data
        isAIGenerated: mainDataPoint?.isAIGenerated,
        scope1: mainDataPoint?.scope1,
        scope2: mainDataPoint?.scope2,
        scope3: mainDataPoint?.scope3,
        scope3Categories: mainDataPoint?.scope3Categories,
        originalValues: mainDataPoint?.originalValues,
      };
    });
};

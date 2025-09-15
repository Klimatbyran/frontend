/**
 * Chart tick generation utilities
 */

// Generate chart ticks based on year range and view type
export const generateChartTicks = (
  dataStartYear: number,
  chartEndYear: number,
  shortEndYear: number,
  currentYear: number = new Date().getFullYear(),
) => {
  const baseTicks = [dataStartYear, 2020, currentYear, 2025];
  if (chartEndYear === shortEndYear) {
    return [...baseTicks, shortEndYear];
  } else {
    return [...baseTicks, shortEndYear, 2030, 2040, 2050];
  }
};

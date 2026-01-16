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
  // Only include currentYear if it's within the data range
  const baseTicks = [dataStartYear, 2020];
  if (currentYear <= chartEndYear && currentYear < shortEndYear) {
    baseTicks.push(currentYear);
  }
  if (2025 <= chartEndYear) {
    baseTicks.push(2025);
  }

  if (chartEndYear === shortEndYear) {
    return [...baseTicks, shortEndYear];
  } else {
    return [...baseTicks, shortEndYear, 2030, 2040, 2050];
  }
};

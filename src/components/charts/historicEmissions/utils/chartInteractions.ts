/**
 * Chart interaction utilities
 */

export const createChartClickHandler =
  (onYearSelect: (year: number) => void) => (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const year = data.activePayload[0].payload.year;
      onYearSelect(year);
    }
  };

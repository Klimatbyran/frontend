/**
 * Chart interaction utilities
 */

interface ChartClickPayload {
  activePayload?: Array<{ payload: { year: number } }>;
}

export const createChartClickHandler =
  (onYearSelect: (year: number) => void) => (data: ChartClickPayload) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const year = data.activePayload[0].payload.year;
      onYearSelect(year);
    }
  };

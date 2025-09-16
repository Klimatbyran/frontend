/**
 * Chart props utilities
 */

// Shared chart container styling utilities
export const getChartContainerProps = (
  height: string = "100%",
  width: string = "100%",
) => ({
  height,
  width,
  className: "w-full",
});

// Line chart props
export const getLineChartProps = (
  data: any[],
  onClick?: (data: any) => void,
  margin: { top: number; right: number; left: number; bottom: number } = {
    top: 20,
    right: 0,
    left: 0,
    bottom: 0,
  },
) => ({
  data,
  margin,
  ...(onClick && { onClick }),
});

// Composed chart props
export const getComposedChartProps = (
  data: any[],
  onClick?: (data: any) => void,
  margin: { top: number; right: number; left: number; bottom: number } = {
    top: 20,
    right: 0,
    left: 0,
    bottom: 0,
  },
) => ({
  data,
  margin,
  ...(onClick && { onClick }),
});

// Unified chart props factory
export const getChartProps = (
  chartType: "line" | "composed",
  data: any[],
  onClick?: (data: any) => void,
  margin?: { top: number; right: number; left: number; bottom: number },
) => {
  if (chartType === "composed") {
    return getComposedChartProps(data, onClick, margin);
  }
  return getLineChartProps(data, onClick, margin);
};

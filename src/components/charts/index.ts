// Base chart components
export { ChartContainer } from "./ChartContainer";
export { ChartWrapper } from "./ChartWrapper";
export { ChartArea } from "./ChartArea";
export { ChartFooter } from "./ChartFooter";

// Chart elements
export { DynamicLegendContainer } from "./DynamicLegendContainer";
export { EnhancedLegend } from "./EnhancedLegend";

// Chart controls
export { ChartYearControls } from "./ChartYearControls";
export { ChartHeader } from "./ChartHeader";
export { DataViewSelector } from "./DataViewSelector";

// Types
export type * from "./ChartTypes";

// Styling utilities
export * from "./chartStyles";
export * from "./legendStyles";

// Chart utilities - re-exported from chartStyles and utils
export {
  generateChartTicks,
  createChartClickHandler,
  createCustomTickRenderer,
  filterValidTotalData,
  filterValidScopeData,
  filterValidCategoryData,
  filterDataByYearRange,
  createReferenceLine,
  getReferenceLinesForChart,
  getComposedChartProps,
  getChartProps,
} from "./chartStyles";

// Reference line types
export type { ReferenceLineConfig } from "./chartStyles";

// State management hooks
export {
  useChartState,
  useHiddenItems,
  useDataView,
  useChartStateManager,
} from "./useChartState";

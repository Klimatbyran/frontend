// Base chart components
export { ChartWrapper } from "./ChartWrapper";
export { ChartArea } from "./ChartArea";
export { ChartFooter } from "./ChartFooter";

// Chart elements
export { DynamicLegendContainer } from "./historicEmissions/DynamicLegendContainer";
export { EnhancedLegend } from "./historicEmissions/EnhancedLegend";
export { SharedTooltip } from "./historicEmissions/SharedTooltip";

// Chart controls
export { ChartYearControls } from "./ChartYearControls";
export { DataViewSelector } from "./DataViewSelector";

// Data view helpers
export * from "./historicEmissions/utils/dataViewHelpers";

// Types
export type * from "./ChartTypes";

// Styling utilities
export * from "./historicEmissions/chartStyles";
export * from "./historicEmissions/legendStyles";

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
  getResponsiveChartMargin,
  getDynamicChartHeight,
  getLegendContainerHeight,
} from "./historicEmissions/chartStyles";

// Reference line types
export type { ReferenceLineConfig } from "./historicEmissions/chartStyles";

// State management hooks
export {
  useHiddenItems,
  useDataView,
  useTimeSeriesChartState,
  useEmissionsChartState,
} from "./useChartState";

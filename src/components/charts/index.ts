// Base chart components
export { ChartWrapper } from "./ChartWrapper";
export { ChartArea } from "./ChartArea";
export { ChartFooter } from "./ChartFooter";

// Chart elements
export { DynamicLegendContainer } from "./historicEmissions/DynamicLegendContainer";
export { EnhancedLegend } from "./historicEmissions/EnhancedLegend";
export { ChartTooltip } from "./historicEmissions/ChartTooltip";

// Chart controls
export { ChartYearControls } from "./ChartYearControls";
export { DataViewSelector } from "./DataViewSelector";
export { ChartModeSelector } from "./ChartModeSelector";

// Data view hooks
export * from "../../hooks/charts/useDataViewOptions";

// Types
export type * from "../../types/charts";

// Styling utilities
export * from "./historicEmissions/styles/chartStyles";
export * from "./historicEmissions/styles/legendStyles";
export * from "./historicEmissions/utils/legendUtils";
export * from "./historicEmissions/utils/chartUtils";

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
} from "./historicEmissions/styles/chartStyles";

// Reference line types
export type { ReferenceLineConfig } from "./historicEmissions/styles/chartStyles";

// State management hooks
export {
  useHiddenItems,
  useDataView,
  useTimeSeriesChartState,
} from "../../hooks/charts/useChartState";
export type { ChartMode } from "../../hooks/charts/useChartState";

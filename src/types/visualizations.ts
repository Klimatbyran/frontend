/**
 * Shared types for visualization components
 */

/**
 * Industry group structure used in visualizations
 */
export interface IndustryGroup<T> {
  key: string;
  comps: T[];
}

/**
 * Base props for visualization components
 */
export interface BaseVisualizationProps<T> {
  companies: T[];
  onCompanyClick?: (company: T) => void;
}

/**
 * Color function type for visualizations
 */
export type ColorFunction = (value: number) => string;

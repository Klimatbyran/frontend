/**
 * Standardized data format for all trend/statistics functions
 *
 * This is the canonical format for statistical analysis functions.
 * Legacy code may still use { x, y } or { year, total } formats in some places,
 * but new code should use this standardized format.
 */
export interface DataPoint {
  year: number;
  value: number;
}

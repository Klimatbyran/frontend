/**
 * Form input utilities
 */

/**
 * Safely extracts a numeric value from a period, returning empty string for null/undefined
 */
export function getNumericValue(value: number | null | undefined): string {
  return value === undefined || value === null ? "" : String(value);
}

/**
 * Safely extracts a string value from a period, returning empty string for null/undefined
 */
export function getStringValue(value: string | null | undefined): string {
  return value === undefined || value === null ? "" : value;
}

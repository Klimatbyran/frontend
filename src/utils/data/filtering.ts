/**
 * Simple data filtering utilities for visualizations
 */

/**
 * Filter items into valid and invalid based on numeric value extraction
 *
 * @param items - Array of items to filter
 * @param getValue - Function to extract the value from an item
 * @returns Object with valid and invalid arrays
 */
export function filterValidNumericData<T>(
  items: T[],
  getValue: (item: T) => unknown,
): { valid: T[]; invalid: T[] } {
  const valid: T[] = [];
  const invalid: T[] = [];

  for (const item of items) {
    const value = getValue(item);
    if (typeof value === "number" && Number.isFinite(value)) {
      valid.push(item);
    } else {
      invalid.push(item);
    }
  }

  return { valid, invalid };
}

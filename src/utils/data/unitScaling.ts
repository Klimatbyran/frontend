/**
 * Utilities for scaling large numeric values to appropriate display units
 */

export type UnitScale = {
  unit: string;
  divisor: number;
  label: string;
};

type UnitSystem = "tonnes" | "generic";

const UNIT_LABELS: Record<
  UnitSystem,
  Record<number, { unit: string; label: string }>
> = {
  tonnes: {
    1_000_000_000: { unit: " Gt", label: "Gt" },
    1_000_000: { unit: " Mt", label: "Mt" },
    1_000: { unit: " kt", label: "kt" },
    1: { unit: " t", label: "t" },
  },
  generic: {
    1_000_000_000: { unit: "B", label: "B" },
    1_000_000: { unit: "M", label: "M" },
    1_000: { unit: "k", label: "k" },
    1: { unit: "", label: "" },
  },
};

/**
 * Determine the best unit for displaying values based on magnitude
 * @param maxAbsValue - The maximum absolute value in the dataset
 * @param unitSystem - Unit system to use: "tonnes" (Gt/Mt/kt/t) or "generic" (B/M/k)
 * @param options.maxDivisor - Largest allowed divisor (e.g. 1_000_000 caps at Mt, not Gt)
 * @returns Unit scale configuration
 */
export function getBestUnit(
  maxAbsValue: number,
  unitSystem: UnitSystem = "tonnes",
  options?: { maxDivisor?: number },
): UnitScale {
  const absValue = Math.abs(maxAbsValue);
  const labels = UNIT_LABELS[unitSystem];
  const thresholds = [1_000_000_000, 1_000_000, 1_000, 1].filter(
    (threshold) =>
      !options?.maxDivisor || threshold <= options.maxDivisor,
  );

  for (const threshold of thresholds) {
    if (absValue >= threshold) {
      return {
        unit: labels[threshold].unit,
        divisor: threshold,
        label: labels[threshold].label,
      };
    }
  }

  const fallback = thresholds.at(-1) ?? 1;
  return {
    unit: labels[fallback].unit,
    divisor: fallback,
    label: labels[fallback].label,
  };
}

/**
 * Format a value with a pre-selected unit scale.
 */
export function formatWithScale(
  value: number,
  scale: UnitScale,
  decimals: number = 1,
): string {
  const scaled = value / scale.divisor;
  return `${scaled.toFixed(decimals)}${scale.unit}`;
}

/**
 * Format a value using the best unit scale
 * @param value - The value to format
 * @param maxAbsValue - The maximum absolute value in the dataset (for determining scale)
 * @param unitSystem - Unit system to use
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.5B" or "2.3 Mt")
 */
export function formatWithBestUnit(
  value: number,
  maxAbsValue: number,
  unitSystem: UnitSystem = "tonnes",
  decimals: number = 1,
  options?: { maxDivisor?: number },
): string {
  const scale = getBestUnit(maxAbsValue, unitSystem, options);
  return formatWithScale(value, scale, decimals);
}

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
 * @param maxDivisor - Optional cap on unit size (e.g. 1_000_000 to avoid Gt for company data)
 * @returns Unit scale configuration
 */
export function getBestUnit(
  maxAbsValue: number,
  unitSystem: UnitSystem = "tonnes",
  maxDivisor?: number,
): UnitScale {
  const absValue = Math.abs(maxAbsValue);
  const labels = UNIT_LABELS[unitSystem];

  let divisor: number;
  if (absValue >= 1_000_000_000) {
    divisor = 1_000_000_000;
  } else if (absValue >= 1_000_000) {
    divisor = 1_000_000;
  } else if (absValue >= 1_000) {
    divisor = 1_000;
  } else {
    divisor = 1;
  }

  if (maxDivisor !== undefined && divisor > maxDivisor) {
    divisor = maxDivisor;
  }

  return {
    unit: labels[divisor].unit,
    divisor,
    label: labels[divisor].label,
  };
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
  maxDivisor?: number,
): string {
  const scale = getBestUnit(maxAbsValue, unitSystem, maxDivisor);
  const scaled = value / scale.divisor;
  return `${scaled.toFixed(decimals)}${scale.unit}`;
}

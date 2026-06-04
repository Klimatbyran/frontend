/**
 * Format and parse numeric strings for editor inputs (space as thousand separator).
 */

/** Removes space thousand separators from a numeric input string. */
export function stripNumberFormatting(value: string): string {
  return value.replace(/\s/g, "");
}

/**
 * Formats a numeric string for display in inputs, using spaces as thousand separators.
 * Preserves partial input (e.g. trailing decimal point) while typing.
 */
export function formatNumberForInput(value: string | number): string {
  if (value === "" || value === null || value === undefined) return "";
  const raw = stripNumberFormatting(String(value).trim());
  if (raw === "" || raw === "-" || raw === "." || raw === "-.") return raw;

  const isNegative = raw.startsWith("-");
  const unsigned = isNegative ? raw.slice(1) : raw;
  const [integerPart, ...decimalParts] = unsigned.split(".");
  const decimalPart = decimalParts.join(".");

  if (!/^\d*$/.test(integerPart)) return String(value);

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const prefix = isNegative ? "-" : "";
  if (raw.includes(".")) {
    return `${prefix}${formattedInteger}.${decimalPart}`;
  }
  return `${prefix}${formattedInteger}`;
}

/** Parses a form numeric value, tolerating space thousand separators. */
export function parseFormNumber(value: string | undefined): number {
  return parseFloat(stripNumberFormatting(value ?? ""));
}

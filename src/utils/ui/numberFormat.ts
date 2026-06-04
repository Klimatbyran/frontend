/**
 * Format and parse numeric strings for editor inputs (Swedish sv-SE conventions).
 * - Thousand separator: space
 * - Decimal separator: comma
 *
 * Values stored in form state use a canonical form (no spaces, dot as decimal)
 * for API parsing.
 */

// Regular space for display (easier to edit than Intl sv-SE narrow no-break space).
const GROUP_SEPARATOR = " ";
const DECIMAL_SEPARATOR = ",";

/** Removes Swedish grouping and normalizes decimals to dot for storage/parsing. */
export function stripNumberFormatting(value: string): string {
  const trimmed = value.trim();
  if (
    trimmed === "" ||
    trimmed === "-" ||
    trimmed === DECIMAL_SEPARATOR ||
    trimmed === `-${DECIMAL_SEPARATOR}`
  ) {
    return trimmed.replace(DECIMAL_SEPARATOR, ".");
  }

  let normalized = trimmed.replace(/[\s\u00A0\u202F]/g, "");

  if (normalized.includes(DECIMAL_SEPARATOR)) {
    const lastComma = normalized.lastIndexOf(DECIMAL_SEPARATOR);
    const integerPart = normalized.slice(0, lastComma).replace(/\./g, "");
    const decimalPart = normalized.slice(lastComma + 1);
    normalized = `${integerPart}.${decimalPart}`;
  }

  return normalized;
}

/**
 * Formats a numeric string for display in inputs (sv-SE).
 * Preserves partial input (e.g. trailing decimal comma) while typing.
 */
export function formatNumberForInput(value: string | number): string {
  if (value === "" || value === null || value === undefined) return "";

  const canonical = stripNumberFormatting(String(value).trim());
  if (
    canonical === "" ||
    canonical === "-" ||
    canonical === "." ||
    canonical === "-."
  ) {
    return canonical.replace(".", DECIMAL_SEPARATOR);
  }

  const isNegative = canonical.startsWith("-");
  const unsigned = isNegative ? canonical.slice(1) : canonical;
  const [integerPart, ...decimalParts] = unsigned.split(".");
  const decimalPart = decimalParts.join(".");

  if (!/^\d*$/.test(integerPart)) return String(value);

  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    GROUP_SEPARATOR,
  );
  const prefix = isNegative ? "-" : "";
  if (canonical.includes(".")) {
    return `${prefix}${formattedInteger}${DECIMAL_SEPARATOR}${decimalPart}`;
  }
  return `${prefix}${formattedInteger}`;
}

/** Parses a form numeric value, tolerating Swedish formatting. */
export function parseFormNumber(value: string | undefined): number {
  return parseFloat(stripNumberFormatting(value ?? ""));
}

/** Like parseFormNumber, but returns null for empty strings. */
export function parseNullableFormNumber(value: string): number | null {
  return value === "" ? null : parseFormNumber(value);
}

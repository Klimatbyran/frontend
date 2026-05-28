/**
 * Returns the calendar year from an ISO date string (e.g. "2024-12-31" or "2024-12-31T23:59:59.999Z").
 * Use this instead of new Date(s).getFullYear() to avoid timezone bugs when the time is end-of-day UTC
 * (e.g. 2024-12-31T23:59:59Z becomes 2025-01-01 in UTC+1, so getFullYear() would return 2025).
 */
export function yearFromIsoDate(isoDate: string): string {
  return isoDate.substring(0, 4);
}

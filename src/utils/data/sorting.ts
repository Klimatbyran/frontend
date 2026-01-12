import { KPIValue } from "@/types/rankings";

export function getSortedEntityKPIValues<
  T,
  KPI extends KPIValue<T> = KPIValue<T>,
>(data: T[], kpi: KPI): T[] {
  return [...data].sort((a, b) => {
    const aValue = a[kpi.key as keyof T];
    const bValue = b[kpi.key as keyof T];

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Handle boolean values if KPI is binary
    if (kpi.isBoolean) {
      const aBoolean = Boolean(aValue);
      const bBoolean = Boolean(bValue);
      return kpi.higherIsBetter
        ? (bBoolean ? 1 : 0) - (aBoolean ? 1 : 0)
        : (aBoolean ? 1 : 0) - (bBoolean ? 1 : 0);
    }

    // Handle numeric values
    return kpi.higherIsBetter
      ? (bValue as number) - (aValue as number)
      : (aValue as number) - (bValue as number);
  });
}

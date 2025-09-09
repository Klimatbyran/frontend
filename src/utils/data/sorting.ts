import type { Municipality, KPIValue } from "@/types/municipality";

export function getSortedMunicipalKPIValues(
  municipalities: Municipality[],
  kpi: KPIValue,
): Municipality[] {
  return [...municipalities].sort((a, b) => {
    const aValue = a[kpi.key] ?? null;
    const bValue = b[kpi.key] ?? null;

    if (aValue === null && bValue === null) {
      return 0;
    } else if (aValue === null) {
      return 1;
    } else if (bValue === null) {
      return -1;
    }

    return kpi.higherIsBetter
      ? (bValue as number) - (aValue as number)
      : (aValue as number) - (bValue as number);
  });
}

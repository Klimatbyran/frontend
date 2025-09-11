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

    if (kpi.isBoolean) {
      if (kpi.higherIsBetter) {
        // true should come first if higherIsBetter is true
        return (bValue === true ? 1 : 0) - (aValue === true ? 1 : 0);
      } else {
        // false should come first if higherIsBetter is false
        return (aValue === true ? 1 : 0) - (bValue === true ? 1 : 0);
      }
    }

    return kpi.higherIsBetter
      ? (bValue as number) - (aValue as number)
      : (aValue as number) - (bValue as number);
  });
}

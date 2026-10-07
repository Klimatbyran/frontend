import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import { yearFromIsoDate } from "@/utils/date";

type DatedPeriod = {
  endDate: string;
};

export function sortPeriodsNewestFirst<T extends DatedPeriod>(
  periods: readonly T[],
): T[] {
  return [...periods].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );
}

export function periodForComparisonYear<T extends DatedPeriod>(
  periods: readonly T[],
  year: string,
): { selected: T; previous?: T } | null {
  const sorted = sortPeriodsNewestFirst(periods);
  if (sorted.length === 0) return null;

  const selected =
    year === "latest"
      ? sorted[0]
      : sorted.find((period) => yearFromIsoDate(period.endDate) === year);

  if (!selected) return null;

  const index = sorted.findIndex(
    (period) => period.endDate === selected.endDate,
  );
  return {
    selected,
    previous: index >= 0 ? sorted[index + 1] : undefined,
  };
}

type EmissionsPeriod = DatedPeriod & {
  emissionsChangeLastTwoYears?: {
    adjusted: number | null;
    absolute: number | null;
  } | null;
  emissions?: {
    calculatedTotalEmissions?: number | null;
    scope1And2?: {
      total?: number | null;
    } | null;
  } | null;
};

export function yearOverYearForComparisonYear(
  periods: readonly EmissionsPeriod[],
  year: string,
): number | null {
  const match = periodForComparisonYear(periods, year);
  if (!match) return null;
  return calculateEmissionsChange(match.selected, match.previous);
}

export function totalEmissionsForComparisonYear(
  periods: readonly EmissionsPeriod[],
  year: string,
): number | null {
  const match = periodForComparisonYear(periods, year);
  const value = match?.selected.emissions?.calculatedTotalEmissions;
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) {
    return null;
  }
  return value;
}

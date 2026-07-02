import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import type { EmissionDataPoint } from "@/types/municipality";
import type { DataPoint } from "@/types/emissions";

const EMISSIONS_DATA_START_YEAR = 1990;
const EMISSIONS_DATA_END_YEAR = 2050;
const KG_PER_TONNE = 1000;

export type TerritoryEmissionsSource = {
  emissions: (EmissionDataPoint | null)[];
  approximatedHistoricalEmission: (EmissionDataPoint | null)[];
  trend: (EmissionDataPoint | null)[];
};

type TransformOptions = {
  /** Input values are stored in kilograms and should be converted to tonnes. */
  valuesInKg?: boolean;
};

function toDisplayTonnes(
  value: number | undefined,
  valuesInKg: boolean,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return valuesInKg ? value / KG_PER_TONNE : value;
}

function getLastReportedEmissionsYear(
  emissions: (EmissionDataPoint | null)[],
): number | undefined {
  const reportedYears = emissions
    .filter((d): d is EmissionDataPoint => d != null)
    .map((d) => d.year);

  return reportedYears.length > 0 ? Math.max(...reportedYears) : undefined;
}

function shouldShowApproximatedForYear(
  yearNum: number,
  lastReportedYear: number | undefined,
  historical: number | undefined,
): boolean {
  if (historical !== undefined) {
    return false;
  }

  if (lastReportedYear !== undefined && yearNum <= lastReportedYear) {
    return false;
  }

  return true;
}

export function transformTerritoryEmissionsData(
  territory: TerritoryEmissionsSource,
  options: TransformOptions = { valuesInKg: true },
): DataPoint[] {
  const valuesInKg = options.valuesInKg ?? true;
  const years = new Set<number>();

  territory.emissions.forEach((d) => d?.year && years.add(d.year));
  territory.approximatedHistoricalEmission.forEach(
    (d) => d?.year && years.add(d.year),
  );
  territory.trend.forEach((d) => d?.year && years.add(d.year));

  const lastReportedYear = getLastReportedEmissionsYear(territory.emissions);
  const carbonLawBaseYear = lastReportedYear;
  const carbonLawBaseValue =
    carbonLawBaseYear !== undefined
      ? (territory.emissions.find((d) => d?.year === carbonLawBaseYear)
          ?.value ??
        territory.approximatedHistoricalEmission.find(
          (d) => d?.year === carbonLawBaseYear,
        )?.value)
      : undefined;

  return Array.from(years)
    .sort((a, b) => a - b)
    .map((yearNum) => {
      const historical = territory.emissions.find(
        (d) => d?.year === yearNum,
      )?.value;
      const approximated = territory.approximatedHistoricalEmission.find(
        (d) => d?.year === yearNum,
      )?.value;
      const trend = territory.trend.find((d) => d?.year === yearNum)?.value;

      const carbonLawRaw =
        carbonLawBaseValue != null &&
        carbonLawBaseYear != null &&
        yearNum >= carbonLawBaseYear
          ? (calculateParisValue(
              yearNum,
              carbonLawBaseYear,
              carbonLawBaseValue,
              CARBON_LAW_REDUCTION_RATE,
            ) ?? undefined)
          : undefined;

      return {
        year: yearNum,
        total: toDisplayTonnes(historical, valuesInKg),
        trend: toDisplayTonnes(trend, valuesInKg),
        approximated: shouldShowApproximatedForYear(
          yearNum,
          lastReportedYear,
          historical,
        )
          ? toDisplayTonnes(approximated, valuesInKg)
          : undefined,
        carbonLaw: toDisplayTonnes(carbonLawRaw, valuesInKg),
      };
    })
    .filter(
      (d) =>
        d.year >= EMISSIONS_DATA_START_YEAR &&
        d.year <= EMISSIONS_DATA_END_YEAR,
    );
}

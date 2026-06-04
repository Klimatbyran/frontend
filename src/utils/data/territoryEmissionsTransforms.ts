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

function toTonnes(value: number | undefined): number | undefined {
  return value !== undefined ? value / KG_PER_TONNE : undefined;
}

export function transformTerritoryEmissionsData(
  territory: TerritoryEmissionsSource,
): DataPoint[] {
  const years = new Set<number>();

  territory.emissions.forEach((d) => d?.year && years.add(d.year));
  territory.approximatedHistoricalEmission.forEach(
    (d) => d?.year && years.add(d.year),
  );
  territory.trend.forEach((d) => d?.year && years.add(d.year));

  const currentYear = new Date().getFullYear();

  const approximatedDataAtCurrentYear =
    territory.approximatedHistoricalEmission
      .filter((d): d is EmissionDataPoint => d != null && d.year <= currentYear)
      .sort((a, b) => b.year - a.year)[0];

  const carbonLawBaseValue = approximatedDataAtCurrentYear?.value;
  const carbonLawBaseYear = approximatedDataAtCurrentYear?.year ?? currentYear;

  return Array.from(years)
    .sort((a, b) => a - b)
    .map((yearNum) => {
      const historical = territory.emissions.find((d) => d?.year === yearNum)
        ?.value;
      const approximated = territory.approximatedHistoricalEmission.find(
        (d) => d?.year === yearNum,
      )?.value;
      const trend = territory.trend.find((d) => d?.year === yearNum)?.value;

      let carbonLaw: number | undefined;
      if (carbonLawBaseValue != null && yearNum >= currentYear) {
        carbonLaw =
          calculateParisValue(
            yearNum,
            carbonLawBaseYear,
            carbonLawBaseValue,
            CARBON_LAW_REDUCTION_RATE,
          ) ?? undefined;
      }

      return {
        year: yearNum,
        total: toTonnes(historical),
        trend: toTonnes(trend),
        approximated: toTonnes(approximated),
        carbonLaw: toTonnes(carbonLaw),
      };
    })
    .filter(
      (d) =>
        d.year >= EMISSIONS_DATA_START_YEAR && d.year <= EMISSIONS_DATA_END_YEAR,
    );
}

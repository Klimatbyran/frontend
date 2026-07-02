import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import type { EmissionDataPoint } from "@/types/municipality";
import type { DataPoint } from "@/types/emissions";
import { getYearProgress } from "@/utils/data/yearUtils";

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

function applyCurrentYearToDate<T extends number | undefined>(
  value: T,
  yearNum: number,
  calendarYear: number,
  yearProgress: number,
): T {
  if (value === undefined || yearNum !== calendarYear || yearProgress >= 1) {
    return value;
  }

  return (value * yearProgress) as T;
}

export function transformTerritoryEmissionsData(
  territory: TerritoryEmissionsSource,
  now: Date = new Date(),
): DataPoint[] {
  const years = new Set<number>();

  territory.emissions.forEach((d) => d?.year && years.add(d.year));
  territory.approximatedHistoricalEmission.forEach(
    (d) => d?.year && years.add(d.year),
  );
  territory.trend.forEach((d) => d?.year && years.add(d.year));

  const calendarYear = now.getFullYear();
  const yearProgress = getYearProgress(now);

  const approximatedDataAtCurrentYear = territory.approximatedHistoricalEmission
    .filter((d): d is EmissionDataPoint => d != null && d.year <= calendarYear)
    .sort((a, b) => b.year - a.year)[0];

  const carbonLawBaseValue = approximatedDataAtCurrentYear?.value;
  const carbonLawBaseYear = approximatedDataAtCurrentYear?.year ?? calendarYear;

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

      let carbonLaw: number | undefined;
      if (carbonLawBaseValue != null && yearNum >= calendarYear) {
        carbonLaw =
          calculateParisValue(
            yearNum,
            carbonLawBaseYear,
            carbonLawBaseValue,
            CARBON_LAW_REDUCTION_RATE,
          ) ?? undefined;
      }

      const isPartialCurrentYear =
        yearNum === calendarYear && yearProgress > 0 && yearProgress < 1;

      return {
        year: isPartialCurrentYear ? yearNum + yearProgress : yearNum,
        total: toTonnes(
          applyCurrentYearToDate(
            historical,
            yearNum,
            calendarYear,
            yearProgress,
          ),
        ),
        trend: toTonnes(
          applyCurrentYearToDate(trend, yearNum, calendarYear, yearProgress),
        ),
        approximated: toTonnes(
          applyCurrentYearToDate(
            approximated,
            yearNum,
            calendarYear,
            yearProgress,
          ),
        ),
        carbonLaw: toTonnes(carbonLaw),
      };
    })
    .filter(
      (d) =>
        d.year >= EMISSIONS_DATA_START_YEAR &&
        d.year <= EMISSIONS_DATA_END_YEAR,
    );
}

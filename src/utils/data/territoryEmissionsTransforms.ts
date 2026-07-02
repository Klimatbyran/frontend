import type { EmissionDataPoint } from "@/types/municipality";
import type { DataPoint } from "@/types/emissions";
import {
  adjustCarbonLawFromToday,
  adjustTrendFromToday,
  getChartYearPosition,
  getEstimatedEmissionsAtToday,
  getYearToDateContext,
  isBeforeTodayOnChart,
} from "@/utils/data/chartYearToDate";

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

export function transformTerritoryEmissionsData(
  territory: TerritoryEmissionsSource,
  now: Date = new Date(),
  options: TransformOptions = { valuesInKg: true },
): DataPoint[] {
  const valuesInKg = options.valuesInKg ?? true;
  const years = new Set<number>();

  territory.emissions.forEach((d) => d?.year && years.add(d.year));
  territory.approximatedHistoricalEmission.forEach(
    (d) => d?.year && years.add(d.year),
  );
  territory.trend.forEach((d) => d?.year && years.add(d.year));

  const { calendarYear, yearProgress } = getYearToDateContext(now);
  const trendAtCalendarYear = territory.trend.find(
    (d) => d?.year === calendarYear,
  )?.value;
  const trendAtNextYear = territory.trend.find(
    (d) => d?.year === calendarYear + 1,
  )?.value;

  const approximatedDataAtCurrentYear = territory.approximatedHistoricalEmission
    .filter((d): d is EmissionDataPoint => d != null && d.year <= calendarYear)
    .sort((a, b) => b.year - a.year)[0];

  const approximatedDataAtPreviousYear = territory.approximatedHistoricalEmission
    .find((d) => d?.year === calendarYear - 1)?.value;

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

      const hideProjectionBeforeToday = isBeforeTodayOnChart(
        yearNum,
        calendarYear,
        yearProgress,
      );

      const carbonLawRaw =
        carbonLawBaseValue != null && !hideProjectionBeforeToday
          ? adjustCarbonLawFromToday(
              yearNum,
              calendarYear,
              yearProgress,
              carbonLawBaseYear,
              carbonLawBaseValue,
            )
          : undefined;

      const trendRaw =
        trend !== undefined && !hideProjectionBeforeToday
          ? adjustTrendFromToday(
              trend,
              yearNum,
              calendarYear,
              yearProgress,
              trendAtCalendarYear,
              trendAtNextYear,
            )
          : undefined;

      return {
        year: getChartYearPosition(yearNum, calendarYear, yearProgress),
        total: toDisplayTonnes(
          getEstimatedEmissionsAtToday(
            historical,
            territory.emissions.find((d) => d?.year === calendarYear - 1)?.value,
            yearNum,
            calendarYear,
            yearProgress,
          ),
          valuesInKg,
        ),
        trend: toDisplayTonnes(trendRaw, valuesInKg),
        approximated: toDisplayTonnes(
          getEstimatedEmissionsAtToday(
            approximated,
            approximatedDataAtPreviousYear,
            yearNum,
            calendarYear,
            yearProgress,
          ),
          valuesInKg,
        ),
        carbonLaw: toDisplayTonnes(carbonLawRaw, valuesInKg),
      };
    })
    .filter(
      (d) =>
        d.year >= EMISSIONS_DATA_START_YEAR &&
        d.year <= EMISSIONS_DATA_END_YEAR,
    );
}

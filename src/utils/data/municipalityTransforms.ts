import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import type { Municipality, DataPoint } from "@/types/municipality";

export function transformEmissionsData(
  municipality: Municipality,
): DataPoint[] {
  const years = new Set<number>();

  municipality.emissions.forEach((d) => d?.year && years.add(d.year));
  municipality.approximatedHistoricalEmission.forEach(
    (d) => d?.year && years.add(d.year),
  );
  municipality.trend.forEach((d) => d?.year && years.add(d.year));

  const getYearsToNumber = (year: number) => {
    return year && parseInt(String(year));
  };

  const actual2025 = municipality.emissions?.find(
    (item) => item && getYearsToNumber(item.year) === 2025,
  )?.value;

  const approximated2025 = municipality.approximatedHistoricalEmission?.find(
    (item) => item && getYearsToNumber(item.year) === 2025,
  )?.value;

  const carbonLawBaseValue =
    actual2025 !== undefined && actual2025 !== null
      ? actual2025
      : approximated2025 !== undefined && approximated2025 !== null
        ? approximated2025
        : undefined;

  const carbonLawBaseYear = 2025;

  return Array.from(years)
    .sort()
    .map((year) => {
      const yearNum = getYearsToNumber(year);
      const historical = municipality.emissions.find(
        (d) => d?.year === year,
      )?.value;
      const approximated = municipality.approximatedHistoricalEmission.find(
        (d) => d?.year === year,
      )?.value;
      const trend = municipality.trend.find((d) => d?.year === year)?.value;

      let carbonLaw: number | undefined = undefined;
      if (carbonLawBaseValue !== undefined && yearNum >= 2025) {
        carbonLaw =
          calculateParisValue(
            yearNum,
            carbonLawBaseYear,
            carbonLawBaseValue,
            CARBON_LAW_REDUCTION_RATE,
          ) || undefined;
      }

      return {
        year: yearNum,
        total: historical,
        trend,
        approximated: approximated,
        carbonLaw,
      };
    })
    .filter((d) => d.year >= 1990 && d.year <= 2050);
}

import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import type { Municipality } from "@/types/municipality";
import type { DataPoint } from "@/types/emissions";

export function transformEmissionsData(
  municipality: Municipality,
): DataPoint[] {
  const years = new Set<string>();

  municipality.emissions.forEach((d) => d?.year && years.add(d.year));
  municipality.approximatedHistoricalEmission.forEach(
    (d) => d?.year && years.add(d.year),
  );
  municipality.trend.forEach((d) => d?.year && years.add(d.year));

  const currentYear = new Date().getFullYear();

  const approximatedDataAtCurrentYear =
    municipality.approximatedHistoricalEmission
      .filter((d) => d && parseInt(d.year) <= currentYear)
      .sort((a, b) => parseInt(b!.year) - parseInt(a!.year))[0];

  const carbonLawBaseValue = approximatedDataAtCurrentYear?.value;
  const carbonLawBaseYear = approximatedDataAtCurrentYear
    ? parseInt(approximatedDataAtCurrentYear.year)
    : currentYear;

  return Array.from(years)
    .sort()
    .map((year) => {
      const yearNum = parseInt(year, 10);
      const historical = municipality.emissions.find(
        (d) => d?.year === year,
      )?.value;
      const approximated = municipality.approximatedHistoricalEmission.find(
        (d) => d?.year === year,
      )?.value;
      const trend = municipality.trend.find((d) => d?.year === year)?.value;

      let carbonLaw: number | undefined = undefined;
      if (carbonLawBaseValue && yearNum >= currentYear) {
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

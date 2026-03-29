import { DataPoint } from "@/types/emissions";

const EMISSIONS_DATA_START_YEAR = 1990;
const EMISSIONS_DATA_END_YEAR = 2050;

export function transformNationEmissionsData(nation: {
  territorialFossilEmissions: Record<string, number>;
  approximatedHistoricalEmission?: Record<string, number>;
  trend?: Record<string, number>;
  carbonLaw?: Record<string, number>;
  biogenicEmissions?: Record<string, number>;
  consumptionAbroadEmissions?: Record<string, number>;
  exportOfOilProductsEmissions?: Record<string, number>;
}): DataPoint[] {
  if (!nation || !nation.territorialFossilEmissions) return [];

  const years = new Set<string>();
  Object.keys(nation.territorialFossilEmissions).forEach((year) =>
    years.add(year),
  );
  Object.keys(nation.approximatedHistoricalEmission || {}).forEach((year) =>
    years.add(year),
  );
  Object.keys(nation.trend || {}).forEach((year) => years.add(year));
  Object.keys(nation.carbonLaw || {}).forEach((year) => years.add(year));
  Object.keys(nation.biogenicEmissions || {}).forEach((year) =>
    years.add(year),
  );
  Object.keys(nation.consumptionAbroadEmissions || {}).forEach((year) =>
    years.add(year),
  );
  Object.keys(nation.exportOfOilProductsEmissions || {}).forEach((year) =>
    years.add(year),
  );

  return Array.from(years)
    .filter((year) => !isNaN(Number(year)))
    .map((year) => {
      const yearNum = Number(year);
      return {
        year: yearNum,
        total: nation.territorialFossilEmissions[year]
          ? nation.territorialFossilEmissions[year] / 1000
          : undefined,
        approximated: nation.approximatedHistoricalEmission?.[year]
          ? nation.approximatedHistoricalEmission[year] / 1000
          : undefined,
        trend: nation.trend?.[year] ? nation.trend[year] / 1000 : undefined,
        carbonLaw: nation.carbonLaw?.[year]
          ? nation.carbonLaw[year] / 1000
          : undefined,
        biogenicEmissions: nation.biogenicEmissions?.[year]
          ? nation.biogenicEmissions[year] / 1000
          : undefined,
        consumptionAbroadEmissions: nation.consumptionAbroadEmissions?.[year]
          ? nation.consumptionAbroadEmissions[year] / 1000
          : undefined,
        exportOfOilProductsEmissions: nation.exportOfOilProductsEmissions?.[
          year
        ]
          ? nation.exportOfOilProductsEmissions[year] / 1000
          : undefined,
      } as DataPoint;
    })
    .sort((a, b) => a.year - b.year)
    .filter(
      (d) =>
        d.year >= EMISSIONS_DATA_START_YEAR &&
        d.year <= EMISSIONS_DATA_END_YEAR,
    );
}

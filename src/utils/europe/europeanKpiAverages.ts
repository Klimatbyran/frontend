import { FeatureCollection } from "geojson";
import { ClimateTraceEmissionsByIso } from "@/lib/climateTrace";
import { CLIMATE_TRACE_REPORTED_END_YEAR } from "@/utils/europe/climateTraceKpis";

export type EuropeanKpiAverages = {
  historicalEmissionChangePercent: number | null;
  totalEmissions2025: number | null;
  emissionsPerCapita: number | null;
};

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateEuropeanKpiAverages(
  geoData: FeatureCollection,
  emissionsByIso: ClimateTraceEmissionsByIso,
): EuropeanKpiAverages {
  const changeValues: number[] = [];
  const totalEmissionsValues: number[] = [];
  const perCapitaValues: number[] = [];

  for (const feature of geoData.features) {
    const iso3 = feature.properties?.ISO3;
    if (typeof iso3 !== "string") {
      continue;
    }

    const ranking = emissionsByIso[iso3];
    if (!ranking) {
      continue;
    }

    if (typeof ranking.historicalEmissionChangePercent === "number") {
      changeValues.push(ranking.historicalEmissionChangePercent);
    }

    const emissions2025 =
      ranking.emissionsByYear[CLIMATE_TRACE_REPORTED_END_YEAR];
    if (typeof emissions2025 === "number" && !Number.isNaN(emissions2025)) {
      totalEmissionsValues.push(emissions2025);
    }

    if (typeof ranking.emissionsPerCapita === "number") {
      perCapitaValues.push(ranking.emissionsPerCapita);
    }
  }

  return {
    historicalEmissionChangePercent: average(changeValues),
    totalEmissions2025: average(totalEmissionsValues),
    emissionsPerCapita: average(perCapitaValues),
  };
}

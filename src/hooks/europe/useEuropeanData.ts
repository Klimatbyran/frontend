import { useMemo } from "react";
import { Feature, FeatureCollection } from "geojson";
import { DataItem, RankedListItem, KPIValue } from "@/types/rankings";
import { EuropeData } from "./useEuropeKPIs";
import { EuropeanCountry } from "@/types/europe";
import {
  ClimateTraceEmissionsByIso,
  isClimateTraceKpiKey,
} from "@/lib/climateTrace";

type EuropeGeoProperties = {
  NAME: string;
  ISO3: string;
};

function getGeoProperties(feature: Feature): EuropeGeoProperties | undefined {
  const properties = feature.properties;
  if (
    !properties ||
    typeof properties.NAME !== "string" ||
    typeof properties.ISO3 !== "string"
  ) {
    return undefined;
  }

  return {
    NAME: properties.NAME,
    ISO3: properties.ISO3,
  };
}

function buildClimateTraceEntities(
  geoData: FeatureCollection,
  emissionsByIso: ClimateTraceEmissionsByIso,
): RankedListItem[] {
  return geoData.features.flatMap((feature) => {
    const properties = getGeoProperties(feature);
    if (!properties) {
      return [];
    }

    const ranking = emissionsByIso[properties.ISO3];
    if (!ranking) {
      return [];
    }

    return [
      {
        name: properties.NAME,
        id: properties.NAME,
        displayName: properties.NAME,
        mapName: properties.NAME,
        emissionsPerCapita: ranking.emissionsPerCapita,
        emissionsPercentChange: ranking.emissionsPercentChange,
        historicalEmissionChangePercent: null,
        meetsParis: null,
      },
    ];
  });
}

export function useEuropeanData(
  countriesData: EuropeData[],
  selectedKPI: KPIValue<EuropeanCountry>,
  geoData: FeatureCollection,
  emissionsByIso: ClimateTraceEmissionsByIso = {},
) {
  const countryEntities: RankedListItem[] = useMemo(() => {
    if (isClimateTraceKpiKey(selectedKPI.key)) {
      return buildClimateTraceEntities(geoData, emissionsByIso).filter(
        (country) => {
          const value = country[selectedKPI.key];
          return value !== null && value !== undefined;
        },
      );
    }

    return countriesData
      .filter((countryData: EuropeData) => {
        const value = countryData[selectedKPI.key as keyof EuropeData];
        return value !== null && value !== undefined;
      })
      .map((countryData: EuropeData) => ({
        name: countryData.name,
        id: countryData.name,
        displayName: countryData.name,
        mapName: countryData.name,
        emissionsPerCapita: null,
        emissionsPercentChange: null,
        historicalEmissionChangePercent:
          countryData.historicalEmissionChangePercent,
        meetsParis: countryData.meetsParis,
      }));
  }, [countriesData, selectedKPI, geoData, emissionsByIso]);

  const mapData: DataItem[] = useMemo(() => {
    return countryEntities.map((country) => ({
      ...country,
      id: country.mapName,
      name: country.mapName,
      displayName: country.displayName,
    }));
  }, [countryEntities]);

  const filteredGeoData: FeatureCollection = geoData;

  const countriesAsEntities: EuropeanCountry[] = useMemo(() => {
    return countryEntities.map((country) => ({
      id: String(country.id),
      name: country.displayName,
      emissionsPerCapita:
        typeof country.emissionsPerCapita === "number"
          ? country.emissionsPerCapita
          : null,
      emissionsPercentChange:
        typeof country.emissionsPercentChange === "number"
          ? country.emissionsPercentChange
          : null,
      historicalEmissionChangePercent:
        typeof country.historicalEmissionChangePercent === "number"
          ? country.historicalEmissionChangePercent
          : null,
      meetsParis:
        typeof country.meetsParis === "boolean" ? country.meetsParis : null,
    }));
  }, [countryEntities]);

  return {
    countryEntities,
    mapData,
    filteredGeoData,
    countriesAsEntities,
  };
}

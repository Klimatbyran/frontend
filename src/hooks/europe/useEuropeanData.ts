import { useMemo } from "react";
import { Feature, FeatureCollection } from "geojson";
import { useLanguage } from "@/components/LanguageProvider";
import { DataItem, RankedListItem, KPIValue } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";
import { ClimateTraceEmissionsByIso } from "@/lib/climateTrace";
import { SupportedLanguage } from "@/lib/languageDetection";
import { getLocalizedCountryName } from "@/utils/europe/countryNames";

type EuropeGeoProperties = {
  NAME: string;
  ISO2: string;
  ISO3: string;
};

function getGeoProperties(feature: Feature): EuropeGeoProperties | undefined {
  const { properties } = feature;
  if (
    !properties ||
    typeof properties.NAME !== "string" ||
    typeof properties.ISO2 !== "string" ||
    typeof properties.ISO3 !== "string"
  ) {
    return undefined;
  }

  return {
    NAME: properties.NAME,
    ISO2: properties.ISO2,
    ISO3: properties.ISO3,
  };
}

function buildCountryEntity(
  iso3: string,
  iso2: string,
  mapName: string,
  language: SupportedLanguage,
  values: Partial<RankedListItem>,
): RankedListItem {
  return {
    name: mapName,
    id: iso3,
    displayName: getLocalizedCountryName(iso2, language, mapName),
    mapName,
    emissionsPerCapita: null,
    emissionsPercentChange: null,
    historicalEmissionChangePercent: null,
    meetsParis: null,
    ...values,
  };
}

function hasKpiValue<T extends Record<string, unknown>>(
  entity: T,
  key: keyof T,
): boolean {
  const value = entity[key];
  return value !== null && value !== undefined;
}

function buildClimateTraceEntities(
  geoData: FeatureCollection,
  emissionsByIso: ClimateTraceEmissionsByIso,
  language: SupportedLanguage,
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
      buildCountryEntity(
        properties.ISO3,
        properties.ISO2,
        properties.NAME,
        language,
        {
          emissionsPerCapita: ranking.emissionsPerCapita,
          emissionsPercentChange: ranking.emissionsPercentChange,
          historicalEmissionChangePercent:
            ranking.historicalEmissionChangePercent,
          meetsParis: ranking.meetsParis,
        },
      ),
    ];
  });
}

function buildCountryEntities(
  selectedKPI: KPIValue<EuropeanCountry>,
  geoData: FeatureCollection,
  emissionsByIso: ClimateTraceEmissionsByIso,
  language: SupportedLanguage,
): RankedListItem[] {
  return buildClimateTraceEntities(geoData, emissionsByIso, language).filter(
    (country) => hasKpiValue(country, selectedKPI.key),
  );
}

function toMapData(countryEntities: RankedListItem[]): DataItem[] {
  return countryEntities.map((country) => ({
    ...country,
    id: country.mapName,
    name: country.mapName,
    displayName: country.displayName,
  }));
}

function toEuropeanCountries(
  countryEntities: RankedListItem[],
): EuropeanCountry[] {
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
}

export function useEuropeanData(
  selectedKPI: KPIValue<EuropeanCountry>,
  geoData: FeatureCollection,
  emissionsByIso: ClimateTraceEmissionsByIso = {},
) {
  const { currentLanguage } = useLanguage();

  const countryEntities = useMemo(
    () =>
      buildCountryEntities(
        selectedKPI,
        geoData,
        emissionsByIso,
        currentLanguage,
      ),
    [selectedKPI, geoData, emissionsByIso, currentLanguage],
  );

  const mapData = useMemo(() => toMapData(countryEntities), [countryEntities]);
  const countriesAsEntities = useMemo(
    () => toEuropeanCountries(countryEntities),
    [countryEntities],
  );

  return {
    countryEntities,
    mapData,
    filteredGeoData: geoData,
    countriesAsEntities,
  };
}

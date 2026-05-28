import { useMemo } from "react";
import { Feature, FeatureCollection } from "geojson";
import { useLanguage } from "@/components/LanguageProvider";
import { DataItem, RankedListItem, KPIValue } from "@/types/rankings";
import { EuropeData } from "./useEuropeKPIs";
import { EuropeanCountry } from "@/types/europe";
import {
  ClimateTraceEmissionsByIso,
  isClimateTraceKpiKey,
} from "@/lib/climateTrace";
import { SupportedLanguage } from "@/lib/languageDetection";
import {
  buildCountryGeoIndex,
  getLocalizedCountryName,
  resolveCountryIso3,
} from "@/utils/europe/countryNames";

type EuropeGeoProperties = {
  NAME: string;
  ISO2: string;
  ISO3: string;
};

function getGeoProperties(feature: Feature): EuropeGeoProperties | undefined {
  const properties = feature.properties;
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
        },
      ),
    ];
  });
}

export function useEuropeanData(
  countriesData: EuropeData[],
  selectedKPI: KPIValue<EuropeanCountry>,
  geoData: FeatureCollection,
  emissionsByIso: ClimateTraceEmissionsByIso = {},
) {
  const { currentLanguage } = useLanguage();

  const { nameToIso3, iso3ToEnglishName, iso3ToIso2 } = useMemo(
    () => buildCountryGeoIndex(geoData),
    [geoData],
  );

  const countryEntities: RankedListItem[] = useMemo(() => {
    if (isClimateTraceKpiKey(selectedKPI.key)) {
      return buildClimateTraceEntities(
        geoData,
        emissionsByIso,
        currentLanguage,
      ).filter((country) => {
        const value = country[selectedKPI.key];
        return value !== null && value !== undefined;
      });
    }

    return countriesData
      .filter((countryData: EuropeData) => {
        const value = countryData[selectedKPI.key as keyof EuropeData];
        return value !== null && value !== undefined;
      })
      .flatMap((countryData: EuropeData) => {
        const iso3 = resolveCountryIso3(countryData.name, nameToIso3);
        const mapName = iso3
          ? (iso3ToEnglishName.get(iso3) ?? countryData.name)
          : countryData.name;

        if (!iso3) {
          return [
            {
              name: mapName,
              id: mapName,
              displayName: countryData.name,
              mapName,
              emissionsPerCapita: null,
              emissionsPercentChange: null,
              historicalEmissionChangePercent:
                countryData.historicalEmissionChangePercent,
              meetsParis: countryData.meetsParis,
            },
          ];
        }

        return [
          buildCountryEntity(
            iso3,
            iso3ToIso2.get(iso3) ?? iso3,
            mapName,
            currentLanguage,
            {
              historicalEmissionChangePercent:
                countryData.historicalEmissionChangePercent,
              meetsParis: countryData.meetsParis,
            },
          ),
        ];
      });
  }, [
    countriesData,
    selectedKPI,
    geoData,
    emissionsByIso,
    currentLanguage,
    nameToIso3,
    iso3ToEnglishName,
    iso3ToIso2,
  ]);

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

import { useMemo } from "react";
import { FeatureCollection } from "geojson";
import { DataItem } from "@/components/maps/SwedenMap";
import { RankedListItem } from "@/types/rankings";
import { KPIValue } from "@/types/rankings";
import { EuropeData } from "./useEuropeKPIs";
import { EuropeanCountry } from "@/types/europe";

export function useEuropeanData(
  countriesData: EuropeData[],
  selectedKPI: KPIValue<EuropeanCountry>,
  geoData: FeatureCollection,
) {
  // Transform countries data from European KPIs endpoint into required formats
  // Filter out countries with no data for the selected KPI
  const countryEntities: RankedListItem[] = useMemo(() => {
    return countriesData
      .filter((countryData: EuropeData) => {
        const value = countryData[selectedKPI.key as keyof EuropeData];
        return value !== null && value !== undefined;
      })
      .map((countryData: EuropeData) => {
        return {
          name: countryData.name,
          id: countryData.name,
          displayName: countryData.name,
          mapName: countryData.name,
          historicalEmissionChangePercent:
            countryData.historicalEmissionChangePercent,
          meetsParis: countryData.meetsParis,
        };
      });
  }, [countriesData, selectedKPI]);

  const mapData: DataItem[] = useMemo(() => {
    return countryEntities.map((country) => ({
      ...country,
      id: country.mapName,
      name: country.mapName,
      displayName: country.displayName,
    }));
  }, [countryEntities]);

  // Don't filter geoData - let the map show all countries, with countries without data shown in grey
  const filteredGeoData: FeatureCollection = geoData;

  const countriesAsEntities: EuropeanCountry[] = useMemo(() => {
    return countryEntities.map((country) => ({
      id: String(country.id),
      name: country.displayName,
      emissions: null,
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

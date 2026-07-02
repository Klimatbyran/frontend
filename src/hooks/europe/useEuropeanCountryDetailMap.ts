import { useMemo } from "react";
import { FeatureCollection } from "geojson";
import { DataItem } from "@/types/rankings";
import { useEuropeanKPIs } from "@/hooks/europe/useEuropeKPIs";
import { useClimateTraceEmissions } from "@/hooks/europe/useClimateTraceEmissions";
import { useEuropeanData } from "@/hooks/europe/useEuropeanData";
import europeGeoJson from "@/data/europeGeo.json";

const DETAIL_MAP_KPI_KEY = "historicalEmissionChangePercent";

export function useEuropeanCountryDetailMap(countryIso3: string | undefined) {
  const europeanKPIs = useEuropeanKPIs();
  const geoData = europeGeoJson as FeatureCollection;
  const { emissionsByIso, isLoading } = useClimateTraceEmissions();

  const selectedKPI = useMemo(
    () =>
      europeanKPIs.find((kpi) => kpi.key === DETAIL_MAP_KPI_KEY) ??
      europeanKPIs[0],
    [europeanKPIs],
  );

  const { mapData, filteredGeoData } = useEuropeanData(
    selectedKPI,
    geoData,
    emissionsByIso,
  );

  const countryMapName = useMemo(() => {
    if (!countryIso3) {
      return null;
    }

    const feature = geoData.features.find(
      (entry) => entry.properties?.ISO3 === countryIso3.toUpperCase(),
    );

    const name = feature?.properties?.NAME;
    return typeof name === "string" ? name : null;
  }, [countryIso3, geoData]);

  return {
    geoData: filteredGeoData,
    mapData: mapData as DataItem[],
    selectedKPI,
    countryMapName,
    isLoading,
  };
}

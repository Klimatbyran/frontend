import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FeatureCollection } from "geojson";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import regionGeoJson from "@/data/regionGeo.json";
import {
  useMunicipalityKPIs,
  useMunicipalityKPIDefinitions,
} from "@/hooks/municipalities/useMunicipalityKPIs";
import {
  useRegionalKPIs,
  useRegions as useRegionsKPI,
} from "@/hooks/regions/useRegionKPIs";
import { DataItem, MapEntityType } from "@/types/rankings";
import { createEntityClickHandler } from "@/utils/routing";
import { filterGeoDataByNames } from "@/utils/geoUtils";
import { toMapRegionName } from "@/utils/regionUtils";

interface UseRelatedTerritoriesMapOptions {
  items: string[];
  entityType: MapEntityType;
}

export function useRelatedTerritoriesMap({
  items,
  entityType,
}: UseRelatedTerritoriesMapOptions) {
  const navigate = useNavigate();
  const municipalityKPIs = useMunicipalityKPIDefinitions();
  const regionalKPIs = useRegionalKPIs();
  const { regionsData, loading: regionsLoading } = useRegionsKPI();
  const { municipalitiesData, loading: municipalitiesLoading } =
    useMunicipalityKPIs();

  const selectedKPI = useMemo(() => {
    const kpis =
      entityType === "municipalities" ? municipalityKPIs : regionalKPIs;
    return (
      kpis.find((kpi) => kpi.key === "historicalEmissionChangePercent") ??
      kpis[0]
    );
  }, [entityType, municipalityKPIs, regionalKPIs]);

  const handleEntityClick = useMemo(
    () =>
      createEntityClickHandler(
        navigate,
        entityType === "municipalities" ? "municipality" : "region",
      ),
    [navigate, entityType],
  );

  const onAreaClick = useCallback(
    (mapName: string) => {
      if (entityType === "regions") {
        const region = regionsData.find(
          (entry) =>
            toMapRegionName(entry.name) === mapName || entry.name === mapName,
        );
        handleEntityClick(region?.name ?? mapName);
        return;
      }

      handleEntityClick(mapName);
    },
    [entityType, regionsData, handleEntityClick],
  );

  const itemsSet = useMemo(
    () => new Set(items.map((item) => item.toLowerCase())),
    [items],
  );

  const mapData: DataItem[] = useMemo(() => {
    if (entityType === "regions") {
      return regionsData
        .filter((region) => itemsSet.has(region.name.toLowerCase()))
        .map((region) => {
          const mapName = toMapRegionName(region.name);
          return {
            ...region,
            id: mapName,
            name: mapName,
            displayName: region.name,
          };
        });
    }

    return municipalitiesData
      .filter((municipality) => itemsSet.has(municipality.name.toLowerCase()))
      .map((municipality) => ({
        ...municipality,
        id: municipality.name,
        name: municipality.name,
        displayName: municipality.name,
      }));
  }, [entityType, regionsData, municipalitiesData, itemsSet]);

  const geoData = useMemo(() => {
    const source =
      entityType === "municipalities"
        ? (municipalityGeoJson as FeatureCollection)
        : (regionGeoJson as FeatureCollection);

    const namesForFilter =
      entityType === "regions"
        ? new Set(items.map((item) => toMapRegionName(item).toLowerCase()))
        : itemsSet;

    return filterGeoDataByNames(source, namesForFilter);
  }, [entityType, items, itemsSet]);

  const defaultCenter: [number, number] =
    entityType === "regions" ? [63.7, 17] : [63, 17];

  return {
    selectedKPI,
    mapData,
    geoData,
    onAreaClick,
    defaultCenter,
    loading: entityType === "regions" ? regionsLoading : municipalitiesLoading,
  };
}

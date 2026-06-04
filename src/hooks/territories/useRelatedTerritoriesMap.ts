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
import { resolveRegionFromMapName } from "@/utils/regionUtils";
import {
  toMunicipalityMapDataItem,
  toRegionMapDataItem,
} from "@/utils/territoryMapData";
import {
  buildTerritoryListEntries,
  DETAIL_TERRITORY_KPI_KEY,
  TerritoryKpi,
  toTerritoryMapName,
} from "@/utils/territoryMapUtils";

interface UseRelatedTerritoriesMapOptions {
  items: string[];
  entityType: MapEntityType;
}

const DEFAULT_CENTERS: Record<MapEntityType, [number, number]> = {
  regions: [63.7, 17],
  municipalities: [63, 17],
};

const GEO_JSON_BY_ENTITY: Record<MapEntityType, FeatureCollection> = {
  municipalities: municipalityGeoJson as FeatureCollection,
  regions: regionGeoJson as FeatureCollection,
};

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

  const kpiDefinitions =
    entityType === "municipalities" ? municipalityKPIs : regionalKPIs;

  const selectedKPI = useMemo((): TerritoryKpi | undefined => {
    if (kpiDefinitions.length === 0) {
      return undefined;
    }

    return (
      kpiDefinitions.find((kpi) => kpi.key === DETAIL_TERRITORY_KPI_KEY) ??
      kpiDefinitions[0]
    );
  }, [kpiDefinitions]);

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
        const region = resolveRegionFromMapName(mapName, regionsData);
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

  const mapData = useMemo((): DataItem[] => {
    if (entityType === "regions") {
      return regionsData
        .filter((region) => itemsSet.has(region.name.toLowerCase()))
        .map(toRegionMapDataItem);
    }

    return municipalitiesData
      .filter((municipality) => itemsSet.has(municipality.name.toLowerCase()))
      .map(toMunicipalityMapDataItem);
  }, [entityType, regionsData, municipalitiesData, itemsSet]);

  const territories = useMemo(() => {
    if (!selectedKPI) {
      return [];
    }

    return buildTerritoryListEntries(items, entityType, mapData, selectedKPI);
  }, [items, entityType, mapData, selectedKPI]);

  const geoData = useMemo(() => {
    const namesForFilter = new Set(
      items.map((item) => toTerritoryMapName(entityType, item).toLowerCase()),
    );

    return filterGeoDataByNames(GEO_JSON_BY_ENTITY[entityType], namesForFilter);
  }, [entityType, items]);

  return {
    selectedKPI,
    mapData,
    territories,
    geoData,
    onAreaClick,
    defaultCenter: DEFAULT_CENTERS[entityType],
    loading: entityType === "regions" ? regionsLoading : municipalitiesLoading,
  };
}

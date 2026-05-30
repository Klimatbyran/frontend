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
import type { RegionData } from "@/hooks/regions/useRegionKPIs";
import type { MunicipalityData } from "@/hooks/municipalities/useMunicipalityKPIs";
import { DataItem, MapEntityType } from "@/types/rankings";
import { createEntityClickHandler } from "@/utils/routing";
import { filterGeoDataByNames } from "@/utils/geoUtils";
import {
  buildTerritoryListEntries,
  DETAIL_TERRITORY_KPI_KEY,
  TerritoryKpi,
} from "@/utils/territoryMapUtils";
import { toMapRegionName } from "@/utils/regionUtils";

interface UseRelatedTerritoriesMapOptions {
  items: string[];
  entityType: MapEntityType;
}

const DEFAULT_CENTERS: Record<MapEntityType, [number, number]> = {
  regions: [63.7, 17],
  municipalities: [63, 17],
};

function buildRegionMapData(
  regionsData: RegionData[],
  itemsSet: Set<string>,
): DataItem[] {
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

function buildMunicipalityMapData(
  municipalitiesData: MunicipalityData[],
  itemsSet: Set<string>,
): DataItem[] {
  return municipalitiesData
    .filter((municipality) => itemsSet.has(municipality.name.toLowerCase()))
    .map(({ meetsParis, ...municipality }) => ({
      ...municipality,
      meetsParisGoal: meetsParis,
      id: municipality.name,
      name: municipality.name,
      displayName: municipality.name,
    }));
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

  const kpiDefinitions =
    entityType === "municipalities" ? municipalityKPIs : regionalKPIs;

  const selectedKPI = useMemo((): TerritoryKpi => {
    return (kpiDefinitions.find((kpi) => kpi.key === DETAIL_TERRITORY_KPI_KEY) ??
      kpiDefinitions[0]) as TerritoryKpi;
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

  const mapData = useMemo((): DataItem[] => {
    if (entityType === "regions") {
      return buildRegionMapData(regionsData, itemsSet);
    }

    return buildMunicipalityMapData(municipalitiesData, itemsSet);
  }, [entityType, regionsData, municipalitiesData, itemsSet]);

  const territories = useMemo(
    () => buildTerritoryListEntries(items, entityType, mapData, selectedKPI),
    [items, entityType, mapData, selectedKPI],
  );

  const geoData = useMemo(() => {
    const source =
      entityType === "municipalities"
        ? (municipalityGeoJson as FeatureCollection)
        : (regionGeoJson as FeatureCollection);

    const namesForFilter = new Set(
      territories.map((territory) => territory.mapName.toLowerCase()),
    );

    return filterGeoDataByNames(source, namesForFilter);
  }, [entityType, territories]);

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

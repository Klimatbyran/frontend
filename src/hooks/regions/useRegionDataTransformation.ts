import { useMemo } from "react";
import { Region, RegionListItem } from "@/types/region";
import { DataItem } from "@/components/maps/SwedenMap";
import { toMapRegionName } from "@/utils/regionUtils";

export const useRegionDataTransformation = (
  regionNames: string[],
  regionsData: any[]
) => {
  // Transform regions into list items with map names
  const regionEntities: RegionListItem[] = useMemo(() => {
    return regionNames.map((displayName) => {
      const regionData = regionsData.find((r) => r.name === displayName);
      const mapName = toMapRegionName(displayName);

      if (!regionData || !regionData.emissions) {
        return {
          name: displayName,
          id: displayName,
          displayName,
          mapName,
          emissions: null,
          historicalEmissionChangePercent: null,
          meetsParis: null,
        };
      }

      const years = Object.keys(regionData.emissions)
        .filter((key) => !isNaN(Number(key)))
        .map((year) => Number(year))
        .sort((a, b) => a - b);

      const latestYear = years[years.length - 1];
      const latestYearData =
        latestYear !== undefined
          ? regionData.emissions[latestYear.toString()]
          : null;

      return {
        name: displayName,
        id: displayName,
        displayName,
        mapName,
        emissions:
          typeof latestYearData === "number" ? latestYearData / 1000 : null,
        historicalEmissionChangePercent:
          typeof regionData.historicalEmissionChangePercent === "number"
            ? regionData.historicalEmissionChangePercent
            : null,
        meetsParis:
          typeof regionData.meetsParis === "boolean"
            ? regionData.meetsParis
            : null,
      };
    });
  }, [regionNames, regionsData]);

  // Transform region entities for map display
  const mapData: DataItem[] = useMemo(() => {
    return regionEntities.map((region) => ({
      ...region,
      id: region.mapName,
      name: region.mapName,
      displayName: region.displayName,
    }));
  }, [regionEntities]);

  // Transform region entities to Region type
  const regionsAsEntities = useMemo<Region[]>(() => {
    return regionEntities.map((region) => ({
      id: String(region.id),
      name: region.displayName,
      emissions: typeof region.emissions === "number" ? region.emissions : null,
      historicalEmissionChangePercent:
        typeof region.historicalEmissionChangePercent === "number"
          ? region.historicalEmissionChangePercent
          : null,
      meetsParis:
        typeof region.meetsParis === "boolean" ? region.meetsParis : null,
    }));
  }, [regionEntities]);

  return {
    regionEntities,
    mapData,
    regionsAsEntities,
  };
};

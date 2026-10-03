import { useMemo } from "react";
import { useHiddenItems } from "@/components/charts";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { useSectors } from "@/hooks/territories/useSectors";
import { useSectorYearSelection } from "@/hooks/territories/useSectorYearSelection";
import {
  useTerritoryDetailHeaderStats,
  type TerritoryBenchmarkPeer,
  type TerritoryDetailStatsSource,
} from "@/hooks/territories/useTerritoryDetailHeaderStats";
import {
  useRegionsForExplore,
  type RegionForExplore,
} from "@/hooks/regions/useRegionsForExplore";
import {
  transformTerritoryEmissionsData,
  type TerritoryEmissionsSource,
} from "@/utils/data/territoryEmissionsTransforms";

type TerritoryDetailPageEntity = TerritoryEmissionsSource &
  TerritoryDetailStatsSource;

type SectorTerritoryType = "regions" | "nation";

function latestRegionEmission(region: RegionForExplore): number | null {
  const years = Object.keys(region.emissions)
    .map(Number)
    .filter((year) => !Number.isNaN(year));
  if (!years.length) return null;
  const latestYear = Math.max(...years);
  const value = region.emissions[String(latestYear)];
  return Number.isFinite(value) ? value : null;
}

export function useTerritoryDetailPageData(
  entity: TerritoryDetailPageEntity | null,
  sectorTerritoryType: SectorTerritoryType,
  sectorTerritoryId?: string,
) {
  const { sectorEmissions } = useSectorEmissions(
    sectorTerritoryType,
    sectorTerritoryId,
  );
  const { regions } = useRegionsForExplore();
  const peers = useMemo<TerritoryBenchmarkPeer[]>(
    () =>
      regions.map((region) => ({
        historicalEmissionChangePercent: region.historicalEmissionChangePercent,
        meetsParis: region.meetsParis,
        totalEmissions: latestRegionEmission(region),
      })),
    [regions],
  );
  const { getSectorInfo } = useSectors();
  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);

  const emissionsData = useMemo(
    () => (entity ? transformTerritoryEmissionsData(entity) : []),
    [entity],
  );

  const lastYearEmissions = useMemo(() => {
    return emissionsData
      .filter((d) => d.total !== undefined)
      .sort((a, b) => b.year - a.year)[0];
  }, [emissionsData]);

  const lastYear = lastYearEmissions?.year;
  const headerStats = useTerritoryDetailHeaderStats(entity, lastYear, {
    peers,
    compareTotalEmissions: sectorTerritoryType !== "nation",
  });

  const { availableYears, currentYear } = useSectorYearSelection(
    sectorEmissions,
    lastYear ?? 2023,
  );

  return {
    emissionsData,
    lastYear,
    headerStats,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    availableYears,
    currentYear,
  };
}

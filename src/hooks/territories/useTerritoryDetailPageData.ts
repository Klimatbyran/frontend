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

function regionTotalForYear(
  region: RegionForExplore,
  year: number,
): number | null {
  const value = region.emissions[String(year)];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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
  const selfName =
    entity && "name" in entity && typeof entity.name === "string"
      ? entity.name
      : null;
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
  const peers = useMemo<TerritoryBenchmarkPeer[]>(
    () =>
      regions
        .filter((region) => region.name !== selfName)
        .map((region) => ({
          historicalEmissionChangePercent:
            region.historicalEmissionChangePercent,
          meetsParis: region.meetsParis,
          totalEmissions:
            lastYear == null ? null : regionTotalForYear(region, lastYear),
        })),
    [regions, selfName, lastYear],
  );
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

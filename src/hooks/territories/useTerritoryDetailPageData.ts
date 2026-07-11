import { useMemo } from "react";
import { useHiddenItems } from "@/components/charts";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { useSectors } from "@/hooks/territories/useSectors";
import { useSectorYearSelection } from "@/hooks/territories/useSectorYearSelection";
import {
  useTerritoryDetailHeaderStats,
  type TerritoryDetailStatsSource,
} from "@/hooks/territories/useTerritoryDetailHeaderStats";
import {
  transformTerritoryEmissionsData,
  type TerritoryEmissionsSource,
} from "@/utils/data/territoryEmissionsTransforms";

type TerritoryDetailPageEntity = TerritoryEmissionsSource &
  TerritoryDetailStatsSource;

type SectorTerritoryType = "regions" | "nation";

export function useTerritoryDetailPageData(
  entity: TerritoryDetailPageEntity | null,
  sectorTerritoryType: SectorTerritoryType,
  sectorTerritoryId?: string,
) {
  const { sectorEmissions } = useSectorEmissions(
    sectorTerritoryType,
    sectorTerritoryId,
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
  const headerStats = useTerritoryDetailHeaderStats(entity, lastYear);

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

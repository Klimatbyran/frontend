import type { ReactNode } from "react";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import { TerritoryBenchmarkSection } from "@/components/territories/benchmarks/TerritoryBenchmarkSection";
import type { DataGuideItemId } from "@/data-guide/items";
import type { TerritoryBenchmarkEntityType } from "@/types/territoryBenchmarks";
import type { DataPoint } from "@/types/emissions";
import type { SectorEmissionsByYear } from "@/types/emissions";

interface TerritoryDetailCoreProps {
  entityType: TerritoryBenchmarkEntityType;
  entityId: string;
  entityName: string;
  regionName?: string;
  emissionsData: DataPoint[];
  sectorEmissions?: SectorEmissionsByYear | null;
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  currentYear: number;
  getSectorInfo: (sector: string) => {
    key: string;
    translatedName: string;
    color: string;
  };
  filteredSectors: string[];
  onFilteredSectorsChange: (sectors: string[]) => void;
  sectorHelpItems?: DataGuideItemId[];
  entityValueOverrides?: Partial<Record<string, number | null>>;
  children?: ReactNode;
}

export function TerritoryDetailCore({
  entityType,
  entityId,
  entityName,
  regionName,
  emissionsData,
  sectorEmissions,
  availableYears,
  selectedYear,
  onYearChange,
  currentYear,
  getSectorInfo,
  filteredSectors,
  onFilteredSectorsChange,
  sectorHelpItems = ["municipalityAndRegionEmissionSources"],
  entityValueOverrides,
  children,
}: TerritoryDetailCoreProps) {
  return (
    <>
      <TerritoryEmissions
        emissionsData={emissionsData}
        sectorEmissions={sectorEmissions}
      />

      <TerritoryBenchmarkSection
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
        regionName={regionName}
        entityValueOverrides={entityValueOverrides}
      />

      <SectorEmissionsChart
        sectorEmissions={sectorEmissions}
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={onYearChange}
        currentYear={currentYear}
        getSectorInfo={getSectorInfo}
        filteredSectors={filteredSectors}
        onFilteredSectorsChange={onFilteredSectorsChange}
        helpItems={sectorHelpItems}
      />

      {children}
    </>
  );
}

import { useTranslation } from "react-i18next";
import { CardHeader } from "@/components/layout/CardHeader";
import { YearSelector } from "@/components/layout/YearSelector";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DetailPieSectorGrid } from "@/components/detail/DetailGrid";
import { DataGuideItemId } from "@/data-guide/items";
import { SectorInfo } from "@/types/charts";
import { SectorEmissions } from "@/types/emissions";
import SectorPieChart from "./SectorPieChart";
import SectorPieLegend from "./SectorPieLegend";

interface SectorEmissionsProps {
  sectorEmissions: SectorEmissions | null;
  availableYears: number[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  currentYear: number;
  getSectorInfo: (name: string) => SectorInfo;
  filteredSectors: Set<string>;
  onFilteredSectorsChange: (sectors: Set<string>) => void;
  helpItems: DataGuideItemId[];
}

export function SectorEmissionsChart({
  sectorEmissions,
  availableYears,
  selectedYear,
  onYearChange,
  currentYear,
  getSectorInfo,
  filteredSectors,
  onFilteredSectorsChange,
  helpItems,
}: SectorEmissionsProps) {
  const { t } = useTranslation();

  if (!sectorEmissions?.sectors || availableYears.length === 0) {
    return null;
  }

  const yearData = sectorEmissions.sectors[currentYear] || {};
  const hasData = Object.keys(yearData).length > 0;

  return (
    <SectionWithHelp helpItems={helpItems}>
      <CardHeader
        title={t("detailPage.sectorEmissions")}
        description={t("detailPage.sectorEmissionsYear", {
          year: currentYear,
        })}
        customDataViewSelector={
          <YearSelector
            selectedYear={selectedYear}
            onYearChange={onYearChange}
            availableYears={availableYears}
          />
        }
        className="gap-8 md:gap-16"
      />

      <DetailPieSectorGrid>
        <SectorPieChart
          sectorEmissions={sectorEmissions}
          year={currentYear}
          getSectorInfo={getSectorInfo}
          filteredSectors={filteredSectors}
          onFilteredSectorsChange={onFilteredSectorsChange}
        />
        {hasData && (
          <SectorPieLegend
            data={Object.entries(yearData as Record<string, number>).map(
              ([sector, value]) => ({
                name: sector,
                value,
                color: "",
              }),
            )}
            total={Object.values(yearData as Record<string, number>).reduce(
              (sum, value) => sum + value,
              0,
            )}
            getSectorInfo={getSectorInfo}
            filteredSectors={filteredSectors}
            onFilteredSectorsChange={onFilteredSectorsChange}
          />
        )}
      </DetailPieSectorGrid>
    </SectionWithHelp>
  );
}

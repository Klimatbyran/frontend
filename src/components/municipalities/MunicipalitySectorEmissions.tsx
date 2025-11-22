import { useTranslation } from "react-i18next";
import { CardHeader } from "@/components/layout/CardHeader";
import { YearSelector } from "@/components/layout/YearSelector";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DetailPieSectorGrid } from "@/components/detail/sectorChart/DetailGrid";
import SectorPieChart from "@/components/detail/sectorChart/SectorPieChart";
import SectorPieLegend from "@/components/detail/sectorChart/SectorPieLegend";
import { SectorEmissions } from "@/types/entity-rankings";

interface MunicipalitySectorEmissionsProps {
  sectorEmissions: SectorEmissions | null;
  availableYears: number[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  currentYear: number;
  getSectorInfo: (name: string) => {
    color: string;
    translatedName: string;
  };
  filteredSectors: Set<string>;
  onFilteredSectorsChange: (sectors: Set<string>) => void;
  translateNamespace?: string;
}

export function MunicipalitySectorEmissions({
  sectorEmissions,
  availableYears,
  selectedYear,
  onYearChange,
  currentYear,
  getSectorInfo,
  filteredSectors,
  onFilteredSectorsChange,
  translateNamespace = "municipalityDetailPage",
}: MunicipalitySectorEmissionsProps) {
  const { t } = useTranslation();

  if (!sectorEmissions?.sectors || availableYears.length === 0) {
    return null;
  }

  const yearData = sectorEmissions.sectors[currentYear] || {};
  const hasData = Object.keys(yearData).length > 0;

  return (
    <SectionWithHelp helpItems={["municipalityEmissionSources"]}>
      <CardHeader
        title={t(`${translateNamespace}.sectorEmissions`)}
        description={t(`${translateNamespace}.sectorEmissionsYear`, {
          year: currentYear,
        })}
        customDataViewSelector={
          <YearSelector
            selectedYear={selectedYear}
            onYearChange={onYearChange}
            availableYears={availableYears}
            translateNamespace={translateNamespace}
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

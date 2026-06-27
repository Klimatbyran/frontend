import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sectorColors, getCompanyColors } from "@/lib/constants/companyColors";
import { RankedCompany } from "@/types/company";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChartData } from "@/hooks/companies/useChartData";
import { getSectorsReportingYear } from "@/utils/data/yearUtils";
import SectorPieChart, {
  PieChartItem,
} from "@/components/charts/sectorChart/SectorPieChart";
import SectorPieLegend from "@/components/charts/sectorChart/SectorPieLegend";
import { DetailPieSectorGrid } from "@/components/detail/DetailGrid";
import ChartHeader from "./ChartHeader";

interface EmissionsChartProps {
  companies: RankedCompany[];
  selectedSectors: string[];
}

interface PieChartClickData {
  name?: string;
  value?: number;
  color?: string;
  category?: number;
  total?: number;
  sectorCode?: string;
  wikidataId?: string;
}

const SectorEmissionsChart: React.FC<EmissionsChartProps> = ({
  companies,
  selectedSectors,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const screenSize = useScreenSize();

  const reportingYear = getSectorsReportingYear().toString();

  const { pieChartData, totalEmissions } = useChartData(
    companies,
    selectedSectors,
    selectedSector,
    reportingYear,
  );

  const handlePieClick = (data: PieChartClickData) => {
    if (!selectedSector && data?.sectorCode) {
      setSelectedSector(data.sectorCode);
    } else if (selectedSector && data?.wikidataId) {
      navigate(`/companies/${data.wikidataId}`);
    }
  };

  const pieChartDataWithColor: PieChartItem[] = pieChartData.map(
    (entry, index) => ({
      ...entry,
      color: selectedSector
        ? getCompanyColors(index).base
        : "sectorCode" in entry
          ? sectorColors[entry.sectorCode as keyof typeof sectorColors]?.base ||
            "var(--grey)"
          : "var(--grey)",
    }),
  );

  const actionTooltipKey = selectedSector
    ? "pieLegendCompany"
    : "pieLegendSector";

  return (
    <div className="w-full space-y-6">
      <ChartHeader
        selectedSector={selectedSector}
        totalEmissions={totalEmissions}
        onSectorClear={() => setSelectedSector(null)}
      />

      <div>
        {totalEmissions > 0 ? (
          <DetailPieSectorGrid>
            <SectorPieChart
              data={pieChartDataWithColor}
              onItemClick={handlePieClick}
              customActionLabel={t(
                `companyDetailPage.sectorGraphs.${actionTooltipKey}`,
              )}
              desktopScale={!screenSize.isMobile}
            />
            <div className="w-full flex lg:items-center">
              <SectorPieLegend
                data={pieChartDataWithColor}
                total={totalEmissions}
                onItemClick={(entry) => {
                  if (entry.wikidataId) {
                    navigate(`/companies/${entry.wikidataId as string}`);
                  } else if (entry.sectorCode) {
                    handlePieClick({ sectorCode: entry.sectorCode as string });
                  }
                }}
                getActionTooltip={() =>
                  t(`companyDetailPage.sectorGraphs.${actionTooltipKey}`)
                }
                gridColumns={2}
              />
            </div>
          </DetailPieSectorGrid>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-grey">
              {t("companyDetailPage.sectorGraphs.noDataAvailablePieChart")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectorEmissionsChart;

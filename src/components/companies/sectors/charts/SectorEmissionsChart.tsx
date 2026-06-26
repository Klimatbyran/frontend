import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PieChart, BarChart3 } from "lucide-react";
import { sectorColors, getCompanyColors } from "@/lib/constants/companyColors";
import { RankedCompany } from "@/types/company";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChartData } from "@/hooks/companies/useChartData";
import SectorPieChart, {
  PieChartItem,
} from "@/components/charts/sectorChart/SectorPieChart";
import SectorPieLegend from "@/components/charts/sectorChart/SectorPieLegend";
import { DetailPieSectorGrid } from "@/components/detail/DetailGrid";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import ChartHeader from "./ChartHeader";
import {
  SectorEmissionsBarChart,
  SectorBarChartItem,
} from "./SectorEmissionsBarChart";

interface EmissionsChartProps {
  companies: RankedCompany[];
  selectedSectors: string[];
  selectedYear: string;
  onYearChange: (year: string) => void;
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

type ChartViewMode = "pie" | "bar";

const SectorEmissionsChart: React.FC<EmissionsChartProps> = ({
  companies,
  selectedSectors,
  selectedYear,
  onYearChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [chartView, setChartView] = useState<ChartViewMode>("pie");
  const screenSize = useScreenSize();

  const { pieChartData, totalEmissions, years } = useChartData(
    companies,
    selectedSectors,
    selectedSector,
    selectedYear,
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

  const barChartData: SectorBarChartItem[] = pieChartDataWithColor.map(
    (entry) => ({
      name: entry.name,
      value: entry.value,
      color: entry.color,
      sectorCode: entry.sectorCode as string | undefined,
      wikidataId: entry.wikidataId as string | undefined,
      total: entry.total as number | undefined,
    }),
  );

  const actionTooltipKey = selectedSector
    ? "pieLegendCompany"
    : "pieLegendSector";

  const viewModeIcons = {
    pie: <PieChart className="w-4 h-4" />,
    bar: <BarChart3 className="w-4 h-4" />,
  };

  const viewModeTitles = {
    pie: t("companyDetailPage.sectorGraphs.pie"),
    bar: t("sectorsOverviewPage.chartViews.bar"),
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <ChartHeader
          selectedSector={selectedSector}
          totalEmissions={totalEmissions}
          selectedYear={selectedYear}
          years={years}
          onSectorClear={() => setSelectedSector(null)}
          onYearChange={onYearChange}
          selectedSectors={selectedSectors}
        />
        <ViewModeToggle
          viewMode={chartView}
          modes={["pie", "bar"] as const}
          onChange={setChartView}
          icons={viewModeIcons}
          titles={viewModeTitles}
          showTitles={!screenSize.isMobile}
        />
      </div>

      <div>
        {totalEmissions > 0 ? (
          chartView === "pie" ? (
            <DetailPieSectorGrid>
              <SectorPieChart
                data={pieChartDataWithColor}
                onItemClick={handlePieClick}
                customActionLabel={t(
                  `companyDetailPage.sectorGraphs.${actionTooltipKey}`,
                )}
                desktopScale={!screenSize.isMobile}
              />
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
            </DetailPieSectorGrid>
          ) : (
            <SectorEmissionsBarChart
              data={barChartData}
              onItemClick={(item) => {
                if (item.wikidataId) {
                  navigate(`/companies/${item.wikidataId}`);
                } else if (item.sectorCode) {
                  handlePieClick({ sectorCode: item.sectorCode });
                }
              }}
            />
          )
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

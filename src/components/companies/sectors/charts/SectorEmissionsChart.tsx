import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sectorColors, getCompanyColors } from "@/lib/constants/companyColors";
import { RankedCompany } from "@/types/company";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChartData } from "@/hooks/companies/useChartData";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import PieChartView from "../../CompanyPieChartView";
import SectorPieLegend from "./SectorPieLegend";
import ChartHeader from "./ChartHeader";

interface EmissionsChartProps {
  companies: RankedCompany[];
  selectedSectors: string[];
}

type ChartType = "pie";

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

  const [chartType, setChartType] = useState<ChartType>("pie");
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const screenSize = useScreenSize();
  const { size } = useResponsiveChartSize();

  const { pieChartData, totalEmissions, years } = useChartData(
    companies,
    selectedSectors,
    selectedSector,
    selectedYear,
  );

  const handleChartTypeChange = (type: "pie" | "stacked-total") => {
    if (type === "pie") {
      setChartType(type);
    }
  };

  const handlePieClick = (data: PieChartClickData) => {
    if (!selectedSector && data?.sectorCode) {
      setSelectedSector(data.sectorCode);
    } else if (selectedSector && data?.wikidataId) {
      navigate(`/companies/${data.wikidataId}`);
    }
  };

  const pieChartDataWithColor = pieChartData.map((entry, index) => ({
    ...entry,
    color: selectedSector
      ? getCompanyColors(index).base
      : "sectorCode" in entry
        ? sectorColors[entry.sectorCode as keyof typeof sectorColors]?.base ||
          "var(--grey)"
        : "var(--grey)",
  }));

  return (
    <div className="w-full space-y-6">
      <ChartHeader
        selectedSector={selectedSector}
        chartType={chartType}
        totalEmissions={totalEmissions}
        selectedYear={selectedYear}
        years={years}
        onSectorClear={() => setSelectedSector(null)}
        onChartTypeChange={handleChartTypeChange}
        onYearChange={setSelectedYear}
        selectedSectors={selectedSectors}
      />

      <div>
        {totalEmissions > 0 ? (
          <div className="flex flex-col gap-4 mt-8 lg:flex-row lg:gap-8">
            <div className="w-full lg:w-1/2 lg:h-full">
              <PieChartView
                pieChartData={pieChartDataWithColor}
                size={size}
                customActionLabel={t(
                  `companyDetailPage.sectorGraphs.${selectedSector ? "pieLegendCompany" : "pieLegendSector"}`,
                )}
                handlePieClick={handlePieClick}
                layout={screenSize.isMobile ? "mobile" : "desktop"}
              />
            </div>
            <div className={"w-full h-full flex lg:w-1/2 lg:items-center"}>
              <SectorPieLegend
                payload={pieChartDataWithColor}
                selectedLabel={selectedSector}
                handlePieClick={handlePieClick}
              />
            </div>
          </div>
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

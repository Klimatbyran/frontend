import React from "react";
import { PieChart, BarChart3, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import EmissionsTotalDisplay from "./EmissionsTotalDisplay";

interface ChartHeaderProps {
  selectedSector: string | null;
  chartType: "stacked-total" | "pie";
  totalEmissions: number;
  selectedYear: string;
  years: string[];
  onSectorClear: () => void;
  onChartTypeChange: (type: "stacked-total" | "pie") => void;
  onYearChange: (year: string) => void;
  selectedSectors: string[];
}

const ChartHeader: React.FC<ChartHeaderProps> = ({
  selectedSector,
  chartType,
  totalEmissions,
  selectedYear,
  years,
  onSectorClear,
  onChartTypeChange,
  onYearChange,
}) => {
  const { isMobile, isTablet } = useScreenSize();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex ${
          isMobile || isTablet
            ? "flex-col gap-4"
            : "justify-between items-center"
        }`}
      >
        <div
          className={`flex ${
            isMobile || isTablet ? "flex-wrap" : ""
          } items-center gap-2`}
        >
          {selectedSector && (
            <button
              onClick={onSectorClear}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-grey hover:text-white focus:outline-none transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t("companiesPage.sectorGraphs.back")}
              </span>
            </button>
          )}
          <div
            className={`flex ${
              isMobile || isTablet ? "flex-wrap" : ""
            } items-center gap-2`}
          >
            <button
              onClick={() => onChartTypeChange("pie")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg focus:outline-none transition-colors ${
                chartType === "pie"
                  ? "bg-black-1 text-white"
                  : "text-grey hover:text-white"
              }`}
            >
              <PieChart className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t("companiesPage.sectorGraphs.pie")}
              </span>
            </button>
            <button
              onClick={() => onChartTypeChange("stacked-total")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg focus:outline-none transition-colors ${
                chartType === "stacked-total"
                  ? "bg-black-1 text-white"
                  : "text-grey hover:text-white"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t("companiesPage.sectorGraphs.stackedTotal")}
              </span>
            </button>
          </div>
        </div>

        {chartType === "pie" && (
          <EmissionsTotalDisplay
            totalEmissions={totalEmissions}
            selectedYear={selectedYear}
            years={years}
            onYearChange={onYearChange}
            isSectorView={!!selectedSector}
          />
        )}
      </div>
    </div>
  );
};

export default ChartHeader;

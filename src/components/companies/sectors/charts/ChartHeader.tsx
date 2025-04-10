import React from "react";
import { PieChart, BarChart3, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { formatEmissionsAbsolute } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { currentLanguage } = useLanguage();

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
          <div
            className={`${
              isMobile
                ? "flex flex-col gap-3 w-full"
                : isTablet
                  ? "flex items-center justify-between w-full"
                  : "flex items-center gap-4 ml-auto"
            }`}
          >
            <div
              className={
                isMobile
                  ? "w-full"
                  : isTablet
                    ? "text-left"
                    : "flex items-center gap-4"
              }
            >
              <div className="text-sm text-grey">
                {selectedSector
                  ? t("companiesPage.sectorGraphs.sectorTotal")
                  : t("companiesPage.sectorGraphs.total")}
                <span className="ml-2 text-xl font-light text-white">
                  {formatEmissionsAbsolute(
                    Math.round(totalEmissions),
                    currentLanguage,
                  )}{" "}
                  {t("emissionsUnit")}
                </span>
              </div>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className={`bg-black-2 border border-black-1 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-3 transition-shadow ${
                isMobile ? "w-full" : ""
              }`}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartHeader;

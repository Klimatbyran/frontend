import React from "react";
import { PieChart, BarChart3, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import EmissionsTotalDisplay from "./EmissionsTotalDisplay";

interface ChartHeaderProps {
  selectedSector: string | null;
  totalEmissions: number;
  selectedYear: string;
  years: string[];
  onSectorClear: () => void;
  onYearChange: (year: string) => void;
  selectedSectors: string[];
}

const ChartHeader: React.FC<ChartHeaderProps> = ({
  selectedSector,
  totalEmissions,
  selectedYear,
  years,
  onSectorClear,
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
                {t("companyDetailPage.sectorGraphs.back")}
              </span>
            </button>
          )}
          <div
            className={`flex ${
              isMobile || isTablet ? "flex-wrap" : ""
            } items-center gap-2`}
          >
          </div>
        </div>

          <EmissionsTotalDisplay
            totalEmissions={totalEmissions}
            selectedYear={selectedYear}
            years={years}
            onYearChange={onYearChange}
            isSectorView={!!selectedSector}
        />
      </div>
    </div>
  );
};

export default ChartHeader;

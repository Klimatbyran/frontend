import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import EmissionsTotalDisplay from "./EmissionsTotalDisplay";

interface ChartHeaderProps {
  selectedSector: string | null;
  totalEmissions: number;
  onSectorClear: () => void;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({
  selectedSector,
  totalEmissions,
  onSectorClear,
}) => {
  const { isMobile, isTablet } = useScreenSize();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div
        className={`flex ${
          isMobile || isTablet
            ? "flex-col gap-4"
            : "justify-between items-center"
        }`}
      >
        {selectedSector && (
          <button
            onClick={onSectorClear}
            className="flex items-center gap-2 rounded-lg text-grey hover:text-white focus:outline-none transition-colors self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t("companyDetailPage.sectorGraphs.back")}
            </span>
          </button>
        )}

        <EmissionsTotalDisplay
          totalEmissions={totalEmissions}
          isSectorView={!!selectedSector}
        />
      </div>
    </div>
  );
};

export default ChartHeader;

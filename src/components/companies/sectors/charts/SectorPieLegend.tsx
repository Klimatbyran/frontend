import React from "react";
import { useTranslation } from "react-i18next";
import {
  sectorColors,
  getCompanyColors,
} from "@/hooks/companies/useCompanyFilters";
import { useScreenSize } from "@/hooks/useScreenSize";
import { formatEmissionsAbsolute, formatPercent } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PieLegendProps {
  payload: any[];
  selectedLabel: string | null;
  handlePieClick: (data: any) => void;
}

const SectorPieLegend: React.FC<PieLegendProps> = ({
  payload,
  selectedLabel,
  handlePieClick,
}) => {
  const screenSize = useScreenSize();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const navigateToCompany = (wikidataId: string) => {
    window.location.href = `/companies/${wikidataId}`;
  };

  if (!payload) {
    return null;
  }

  const handleItemClick = (entry: any) => {
    const isCompanyView =
      payload?.[0]?.wikidataId || payload?.[0]?.payload?.wikidataId;

    if (isCompanyView) {
      // If we're viewing companies within a sector, navigate to company detail page
      const wikidataId = entry.wikidataId || entry.payload?.wikidataId;
      if (wikidataId) {
        navigateToCompany(wikidataId);
      }
    } else {
      // If we're viewing sectors, handle the sector selection
      const sectorCode = entry.sectorCode || entry.payload?.sectorCode;
      if (sectorCode) {
        handlePieClick({ sectorCode });
      }
    }
  };

  return (
    <TooltipProvider>
      <div
        className={`grid ${
          screenSize.isMobile
            ? "grid-cols-1"
            : screenSize.isTablet
              ? "grid-cols-1"
              : "grid-cols-2"
        } gap-2 max-h-[${screenSize.isMobile ? "300" : "500"}px] overflow-y-auto w-full pr-2 ${
          screenSize.isMobile ? "mt-2" : "mt-4"
        }`}
      >
        {payload.map((entry, index) => {
          const value = entry.payload?.value || entry.value;
          const total = entry.payload?.total || entry.total;
          const percentage =
            value / total < 0.001
              ? "<0.1%"
              : formatPercent(value / total, currentLanguage);

          let color;
          if (selectedLabel) {
            color = getCompanyColors(index).base;
          } else if (entry.payload?.sectorCode || entry.sectorCode) {
            const sectorCode = entry.payload?.sectorCode || entry.sectorCode;
            color = sectorColors[sectorCode as keyof typeof sectorColors]?.base;
          } else {
            color = "var(--grey)";
          }

          return (
            <Tooltip key={`legend-${index}`}>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center gap-2 p-2 rounded bg-black-2 hover:bg-black-1 transition-colors cursor-pointer ${
                    selectedLabel ? "hover:ring-1 hover:ring-black-1" : ""
                  }`}
                  onClick={() => handleItemClick(entry)}
                >
                  <div
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white truncate">
                      {entry.name || entry.value}
                    </div>
                    <div className="text-xs text-grey flex justify-between">
                      <span>
                        {formatEmissionsAbsolute(
                          Math.round(value),
                          currentLanguage,
                        )}{" "}
                        {t("emissionsUnit")}
                      </span>
                      <span>{percentage}</span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black-1 text-white">
                {selectedLabel
                  ? t("companiesPage.sectorGraphs.pieLegendCompany")
                  : t("companiesPage.sectorGraphs.pieLegendSector")}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default SectorPieLegend;

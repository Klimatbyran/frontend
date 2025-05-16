import React from "react";
import { useTranslation } from "react-i18next";
import {
  sectorColors,
  getCompanyColors,
} from "@/hooks/companies/useCompanyFilters";
import { formatEmissionsAbsolute, formatPercent } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PieLegendEntry {
  name: string;
  value: number;
  total: number;
  sectorCode?: string;
  wikidataId?: string;
}

interface PieLegendProps {
  payload: PieLegendEntry[];
  selectedLabel: string | null;
  handlePieClick: (data: { sectorCode: string }) => void;
}

const SectorPieLegend: React.FC<PieLegendProps> = ({
  payload,
  selectedLabel,
  handlePieClick,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const navigateToCompany = (wikidataId: string) => {
    window.location.href = `/companies/${wikidataId}`;
  };

  if (!payload) {
    return null;
  }

  const handleItemClick = (entry: PieLegendEntry) => {
    if (entry.wikidataId) {
      navigateToCompany(entry.wikidataId);
    } else if (entry.sectorCode) {
      handlePieClick({ sectorCode: entry.sectorCode });
    }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-[300px] lg:max-h-[600px] overflow-y-auto w-full ">
        {payload.map((entry, index) => {
          const { sectorCode, value, total } = entry;
          const percentage =
            value / total < 0.001
              ? "<0.1%"
              : formatPercent(value / total, currentLanguage);

          let color;
          if (selectedLabel) {
            color = getCompanyColors(index).base;
          } else if (sectorCode) {
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
                    className="w-3 h-3 rounded-md flex-shrink-0"
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

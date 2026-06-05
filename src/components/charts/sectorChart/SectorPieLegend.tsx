import React from "react";
import { useTranslation } from "react-i18next";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SectorInfo } from "@/types/charts";
import type { PieChartItem } from "./SectorPieChart";

interface LegendProps {
  data: PieChartItem[];
  total: number;
  getSectorInfo?: (name: string) => SectorInfo;
  filteredSectors?: Set<string>;
  onFilteredSectorsChange?: (sectors: Set<string>) => void;
  onItemClick?: (item: PieChartItem) => void;
  getActionTooltip?: (item: PieChartItem) => string;
  gridColumns?: 1 | 2;
}

const SectorPieLegend: React.FC<LegendProps> = ({
  data,
  total,
  getSectorInfo,
  filteredSectors = new Set(),
  onFilteredSectorsChange,
  onItemClick,
  getActionTooltip,
  gridColumns = 1,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const handleLegendItemClick = (entry: PieChartItem) => {
    if (onItemClick) {
      onItemClick(entry);
      return;
    }

    if (onFilteredSectorsChange) {
      const newFiltered = new Set(filteredSectors);
      if (newFiltered.has(entry.name)) {
        newFiltered.delete(entry.name);
      } else {
        newFiltered.add(entry.name);
      }
      onFilteredSectorsChange(newFiltered);
    }
  };

  const sortedData = [...data]
    .filter((item) => item.value > 0)
    .map((item) => {
      if (getSectorInfo) {
        const { color, translatedName } = getSectorInfo(item.name);
        return { ...item, color, translatedName };
      }
      return item;
    })
    .sort((a, b) => b.value - a.value);

  const gridClass =
    gridColumns === 2
      ? "grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-[300px] lg:max-h-[600px] overflow-y-auto w-full"
      : "grid grid-cols-1 gap-2 w-full pr-2 mt-2 md:mt-4";

  return (
    <TooltipProvider>
      <div className={gridClass}>
        {sortedData.map((entry, index) => {
          const percentage =
            entry.value / total < 0.001
              ? "<0.1%"
              : formatPercent(entry.value / total, currentLanguage);
          const isFiltered = filteredSectors.has(entry.name);
          const displayName =
            (entry.translatedName as string | undefined) ?? entry.name;

          return (
            <Tooltip key={`legend-${index}`}>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-black-1 transition-colors cursor-pointer ${
                    isFiltered ? "opacity-50" : ""
                  }`}
                  onClick={() => handleLegendItemClick(entry)}
                >
                  <div
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white break-words">
                      {displayName}
                    </div>
                    <div className="text-xs text-grey flex justify-between">
                      <span>
                        {formatEmissionsAbsolute(
                          Math.round(entry.value),
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
                {getActionTooltip
                  ? getActionTooltip(entry)
                  : t(
                      `detailPage.sectorChart.${
                        isFiltered ? "clickToShow" : "clickToFilter"
                      }`,
                    )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default SectorPieLegend;

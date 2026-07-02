import React from "react";
import { motion } from "framer-motion";
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
import { useChartMotion } from "@/hooks/useChartMotion";
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
  emissionsUnit?: string;
  emissionsUnitClassName?: string;
  animationKey?: string;
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
  emissionsUnit,
  emissionsUnitClassName,
  animationKey = "default",
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();

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

  const unitLabel = emissionsUnit ?? t("emissionsUnit");

  const gridClass =
    gridColumns === 2
      ? "grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-[300px] lg:max-h-[600px] overflow-y-auto scrollbar-legend w-full pr-1"
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
            <Tooltip key={`${animationKey}-legend-${index}`}>
              <TooltipTrigger asChild>
                <motion.div
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-black-1 transition-colors cursor-pointer"
                  onClick={() => handleLegendItemClick(entry)}
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: isFiltered ? 0.5 : 1, x: 0 }}
                  transition={{
                    duration: fadeDuration,
                    delay: stagger(index, 0.04),
                    ease,
                  }}
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
                        <span className={emissionsUnitClassName}>
                          {unitLabel}
                        </span>
                      </span>
                      <span>{percentage}</span>
                    </div>
                  </div>
                </motion.div>
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

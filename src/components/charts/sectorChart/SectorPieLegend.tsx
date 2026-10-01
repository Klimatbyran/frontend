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
  compact?: boolean;
  emissionsUnit?: string;
  emissionsUnitClassName?: string;
  animationKey?: string;
  /** Stretch the legend to the full height of its grid cell (scroll when needed). */
  fillHeight?: boolean;
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
  compact = false,
  emissionsUnit,
  emissionsUnitClassName,
  animationKey = "default",
  fillHeight = false,
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
      if (newFiltered.has(entry.key)) {
        newFiltered.delete(entry.key);
      } else {
        newFiltered.add(entry.key);
      }
      onFilteredSectorsChange(newFiltered);
    }
  };

  const sortedData = [...data]
    .filter((item) => item.value > 0)
    .map((item) => {
      if (getSectorInfo) {
        const { color, translatedName } = getSectorInfo(item.key);
        return { ...item, color, name: translatedName };
      }
      return item;
    })
    .sort((a, b) => b.value - a.value);

  const unitLabel = emissionsUnit ?? t("emissionsUnit");
  const isInteractive = Boolean(onItemClick || onFilteredSectorsChange);

  const gridGap = compact ? "gap-1" : "gap-2";
  const heightClass = fillHeight
    ? "h-full min-h-0 place-content-start content-start overflow-y-auto scrollbar-legend"
    : compact
      ? "max-h-[320px] overflow-y-auto scrollbar-legend"
      : "";
  const gridClass =
    gridColumns === 2
      ? `grid grid-cols-1 lg:grid-cols-2 ${gridGap} max-h-[300px] lg:max-h-[600px] overflow-y-auto scrollbar-legend w-full pr-1`
      : `grid grid-cols-1 ${gridGap} w-full ${compact ? "pr-0" : "pr-2 mt-2 md:mt-4"} ${heightClass}`;

  return (
    <TooltipProvider>
      <div className={gridClass}>
        {sortedData.map((entry, index) => {
          const percentage =
            entry.value / total < 0.001
              ? "<0.1%"
              : formatPercent(entry.value / total, currentLanguage);
          const isFiltered = filteredSectors.has(entry.key);
          const displayName = (entry.name as string | undefined) ?? entry.key;

          const row = (
            <motion.div
              className={`flex items-center rounded-md transition-colors ${
                isInteractive
                  ? "hover:bg-black-1 cursor-pointer"
                  : "cursor-default"
              } ${compact ? "gap-1.5 p-1.5" : "gap-2 p-2"}`}
              onClick={
                isInteractive
                  ? () => handleLegendItemClick(entry)
                  : undefined
              }
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
                <div
                  className={`text-white break-words ${compact ? "text-xs leading-snug" : "text-sm"}`}
                >
                  {displayName}
                </div>
                <div
                  className={`text-grey flex justify-between ${compact ? "text-[11px]" : "text-xs"}`}
                >
                  <span>
                    {formatEmissionsAbsolute(
                      Math.round(entry.value),
                      currentLanguage,
                    )}{" "}
                    <span className={emissionsUnitClassName}>{unitLabel}</span>
                  </span>
                  <span>{percentage}</span>
                </div>
              </div>
            </motion.div>
          );

          if (!isInteractive) {
            return (
              <div key={`${animationKey}-legend-${index}`}>{row}</div>
            );
          }

          return (
            <Tooltip key={`${animationKey}-legend-${index}`}>
              <TooltipTrigger asChild>{row}</TooltipTrigger>
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

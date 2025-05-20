import React from "react";
import { useTranslation } from "react-i18next";
import { formatEmissionsAbsolute, formatPercent } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMunicipalitySectors } from "@/hooks/useMunicipalitySectors";

interface LegendProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  total: number;
  filteredSectors?: Set<string>;
  onFilteredSectorsChange?: (sectors: Set<string>) => void;
}

const MunicipalitySectorLegend: React.FC<LegendProps> = ({
  data,
  total,
  filteredSectors = new Set(),
  onFilteredSectorsChange,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { getSectorInfo } = useMunicipalitySectors();

  const handleLegendItemClick = (name: string) => {
    if (onFilteredSectorsChange) {
      const newFiltered = new Set(filteredSectors);
      if (newFiltered.has(name)) {
        newFiltered.delete(name);
      } else {
        newFiltered.add(name);
      }
      onFilteredSectorsChange(newFiltered);
    }
  };

  // Filter out zero values and sort the data by value in descending order
  const sortedData = [...data]
    .filter((item) => item.value > 0)
    .map((item) => {
      const { color, translatedName } = getSectorInfo(item.name);
      return {
        ...item,
        color,
        translatedName,
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-2 w-full pr-2 mt-2 md:mt-4">
        {sortedData.map((entry, index) => {
          const percentage = formatPercent(
            entry.value / total,
            currentLanguage,
          );
          const isFiltered = filteredSectors.has(entry.name);

          return (
            <Tooltip key={`legend-${index}`}>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-black-1 transition-colors cursor-pointer ${
                    isFiltered ? "opacity-50" : ""
                  }`}
                  onClick={() => handleLegendItemClick(entry.name)}
                >
                  <div
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white break-words">
                      {entry.translatedName}
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
                {t(
                  `municipalityDetailPage.sectorChart.${
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

export default MunicipalitySectorLegend;

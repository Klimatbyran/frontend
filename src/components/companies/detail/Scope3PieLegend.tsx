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
import { AiIcon } from "@/components/ui/ai-icon";

interface PieLegendEntry {
  name: string;
  value: number;
  total: number;
  color: string;
  category: number;
  isAIGenerated: boolean;
}

interface PieLegendProps {
  payload: PieLegendEntry[];
  filteredCategories?: Set<string>;
  onFilteredCategoriesChange?: (categories: Set<string>) => void;
}

const Scope3PieLegend: React.FC<PieLegendProps> = ({
  payload,
  filteredCategories = new Set(),
  onFilteredCategoriesChange,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!payload) {
    return null;
  }

  const handleLegendItemClick = (name: string) => {
    if (onFilteredCategoriesChange) {
      const newFiltered = new Set(filteredCategories);
      if (newFiltered.has(name)) {
        newFiltered.delete(name);
      } else {
        newFiltered.add(name);
      }
      onFilteredCategoriesChange(newFiltered);
    }
  };

  const sortedPayload = [...payload]
    .filter((entry) => entry.value != null)
    .sort((a, b) => {
      const aValue = a.value ?? 0;
      const bValue = b.value ?? 0;
      return bValue - aValue;
    });

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-300px md:max-h-500px overflow-y-auto w-full pr-2 mt-2 md:mt-4">
        {sortedPayload.map((entry, index) => {
          const { value, total } = entry;
          const percentage =
            value / total < 0.001
              ? "<0.1%"
              : formatPercent(value / total, currentLanguage);

          const color = entry.color || "var(--grey)";
          const isFiltered = filteredCategories.has(entry.name);

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
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white">
                      {entry.name || entry.value}
                    </div>
                    <div className="text-xs text-grey flex justify-between">
                      <span>
                        {formatEmissionsAbsolute(
                          Math.round(value),
                          currentLanguage,
                        )}{" "}
                        {t("emissionsUnit")}
                        {entry.isAIGenerated && (
                          <span className="ml-2">
                            <AiIcon size="sm" />
                          </span>
                        )}
                      </span>
                      <span>{percentage}</span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>

              <TooltipContent className="bg-black-1 text-white">
                {t(
                  `companies.scope3Chart.${isFiltered ? "clickToShow" : "clickToFilter"}`,
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default Scope3PieLegend;

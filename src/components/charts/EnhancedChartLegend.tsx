import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface LegendItem {
  name: string;
  color: string;
  isHidden?: boolean;
  isClickable?: boolean;
  isDashed?: boolean;
  metadata?: {
    value?: number;
    percentage?: number;
    unit?: string;
    isAIGenerated?: boolean;
  };
}

interface EnhancedChartLegendProps {
  items: LegendItem[];
  onItemToggle?: (itemName: string) => void;
  className?: string;
  showMetadata?: boolean;
  allowClickToHide?: boolean;
  // New props for expandable legend
  expandable?: boolean;
  maxHeight?: string;
  mobileMaxHeight?: string;
}

export const EnhancedChartLegend: React.FC<EnhancedChartLegendProps> = ({
  items,
  onItemToggle,
  className = "",
  showMetadata = false,
  allowClickToHide = true,
  expandable = false,
  maxHeight = "200px",
  mobileMaxHeight = "100px",
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // State for legend expansion
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  const handleLegendItemClick = (itemName: string) => {
    if (
      allowClickToHide &&
      onItemToggle &&
      items.find((item) => item.name === itemName)?.isClickable
    ) {
      onItemToggle(itemName);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    // Sort by hidden state first, then alphabetically
    if (a.isHidden !== b.isHidden) {
      return a.isHidden ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  // If not expandable, render the simple grid layout
  if (!expandable) {
    return (
      <TooltipProvider>
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-2 w-full pr-2 ${className}`}
        >
          {sortedItems.map((item, index) => {
            const {
              name,
              color,
              isHidden = false,
              isClickable = false,
              metadata,
            } = item;
            const colorValue = color || "var(--grey)";

            return (
              <Tooltip key={`legend-${index}`}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center gap-1 md:gap-2 p-1 md:p-2 rounded-md transition-colors ${
                      allowClickToHide && isClickable
                        ? "hover:bg-black-1 cursor-pointer"
                        : "cursor-default"
                    } ${isHidden ? "opacity-50" : ""}`}
                    onClick={() => handleLegendItemClick(name)}
                  >
                    <div
                      className={`w-3 h-3 rounded flex-shrink-0 ${
                        item.isDashed ? "border-2 border-dashed" : ""
                      }`}
                      style={{
                        backgroundColor: item.isDashed
                          ? "transparent"
                          : colorValue,
                        borderColor: item.isDashed ? colorValue : "transparent",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs md:text-sm text-white">
                        {name}
                      </div>
                      {showMetadata && metadata && (
                        <div className="text-xs text-grey flex justify-between">
                          {metadata.value !== undefined && (
                            <span>
                              {metadata.value.toLocaleString()}
                              {metadata.unit && ` ${metadata.unit}`}
                            </span>
                          )}
                          {metadata.percentage !== undefined && (
                            <span>{metadata.percentage.toFixed(1)}%</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>

                <TooltipContent className="bg-black-1 text-white">
                  {allowClickToHide && isClickable
                    ? isHidden
                      ? t("charts.legend.clickToShow", "Click to show")
                      : t("charts.legend.clickToHide", "Click to hide")
                    : t("charts.legend.informational", "Informational")}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  // Expandable legend with fade effect and controls
  return (
    <div className="relative">
      <div
        className={`overflow-y-auto transition-all duration-300 ${
          isExpanded
            ? "max-h-none"
            : `max-h-[${mobileMaxHeight}] md:max-h-[${maxHeight}]`
        }`}
      >
        <TooltipProvider>
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-2 w-full pr-2 ${className}`}
          >
            {sortedItems.map((item, index) => {
              const {
                name,
                color,
                isHidden = false,
                isClickable = false,
                metadata,
              } = item;
              const colorValue = color || "var(--grey)";

              return (
                <Tooltip key={`legend-${index}`}>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex items-center gap-1 md:gap-2 p-1 md:p-2 rounded-md transition-colors ${
                        allowClickToHide && isClickable
                          ? "hover:bg-black-1 cursor-pointer"
                          : "cursor-default"
                      } ${isHidden ? "opacity-50" : ""}`}
                      onClick={() => handleLegendItemClick(name)}
                    >
                      <div
                        className={`w-3 h-3 rounded flex-shrink-0 ${
                          item.isDashed ? "border-2 border-dashed" : ""
                        }`}
                        style={{
                          backgroundColor: item.isDashed
                            ? "transparent"
                            : colorValue,
                          borderColor: item.isDashed
                            ? colorValue
                            : "transparent",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs md:text-sm text-white">
                          {name}
                        </div>
                        {showMetadata && metadata && (
                          <div className="text-xs text-grey flex justify-between">
                            {metadata.value !== undefined && (
                              <span>
                                {metadata.value.toLocaleString()}
                                {metadata.unit && ` ${metadata.unit}`}
                              </span>
                            )}
                            {metadata.percentage !== undefined && (
                              <span>{metadata.percentage.toFixed(1)}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>

                  <TooltipContent className="bg-black-1 text-white">
                    {allowClickToHide && isClickable
                      ? isHidden
                        ? t("charts.legend.clickToShow", "Click to show")
                        : t("charts.legend.clickToHide", "Click to hide")
                      : t("charts.legend.informational", "Informational")}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      {/* Fade effect and expand button - only show when not expanded */}
      {!isExpanded && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black-2 to-transparent pointer-events-none" />
          <button
            onClick={() => setIsExpanded(true)}
            className="absolute bottom-1 right-1 p-1 rounded bg-black-1 hover:bg-black-3 transition-colors pointer-events-auto"
            title="Expand legend"
          >
            <svg
              className="w-4 h-4 text-grey"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Collapse button when expanded */}
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="mt-2 p-2 rounded bg-black-1 hover:bg-black-3 transition-colors text-center w-full text-sm text-grey"
          title="Collapse legend"
        >
          Show less
        </button>
      )}
    </div>
  );
};

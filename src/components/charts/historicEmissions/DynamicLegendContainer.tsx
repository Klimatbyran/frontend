import React, { useRef } from "react";
import { LegendItem } from "../ChartTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

interface DynamicLegendContainerProps {
  items: LegendItem[];
  onItemToggle?: (itemName: string) => void;
  showMetadata?: boolean;
  allowClickToHide?: boolean;
  maxHeight?: string;
  mobileMaxHeight?: string;
  className?: string;
  forceExpandable?: boolean; // New prop to force expandable behavior
}

export const DynamicLegendContainer: React.FC<DynamicLegendContainerProps> = ({
  items,
  onItemToggle,
  showMetadata = false,
  allowClickToHide = true,
  className = "",
  forceExpandable = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Determine if we should show expandable behavior
  const shouldShowExpandable = forceExpandable || items.length > 6; // Show if forced or more than 6 items

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={`transition-all duration-300 ${
          shouldShowExpandable ? "h-[100px] md:h-[200px]" : "h-auto"
        } ${className}`}
      >
        <div
          data-legend-content
          className={`relative transition-all duration-300 ${
            shouldShowExpandable
              ? "max-h-[100px] md:max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-grey/30 hover:scrollbar-thumb-grey/50 border border-grey/10 rounded-md"
              : "max-h-none"
          }`}
        >
          <div className="flex flex-wrap gap-2 p-2">
            {items.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center gap-2 p-2 rounded bg-black-2 hover:bg-black-1 transition-colors ${
                      item.isClickable && allowClickToHide
                        ? "cursor-pointer"
                        : "cursor-default"
                    } ${item.isHidden ? "opacity-50" : ""}`}
                    onClick={() => {
                      if (
                        item.isClickable &&
                        allowClickToHide &&
                        onItemToggle
                      ) {
                        onItemToggle(item.name);
                      }
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded flex-shrink-0"
                      style={{
                        backgroundColor: item.isDashed
                          ? "transparent"
                          : item.color,
                        border: item.isDashed
                          ? `2px solid ${item.color}`
                          : "none",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-white">{item.name}</span>
                      {showMetadata && item.metadata && (
                        <div className="text-xs text-gray-400">
                          {item.metadata.value && (
                            <span>{item.metadata.value.toLocaleString()}</span>
                          )}
                          {item.metadata.percentage && (
                            <span>
                              {" "}
                              ({item.metadata.percentage.toFixed(1)}%)
                            </span>
                          )}
                          {item.metadata.unit && (
                            <span> {item.metadata.unit}</span>
                          )}
                          {item.metadata.isAIGenerated && (
                            <span className="ml-1">🤖</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                {item.isClickable && allowClickToHide && (
                  <TooltipContent>
                    <p>{t("chartLegend.clickToFilterOut")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>

          {/* Scroll Indicator */}
          {shouldShowExpandable && (
            <div className="relative">
              {/* More prominent scroll indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black-2 via-black-2/90 to-transparent pointer-events-none" />
              {/* Scroll hint */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-grey/80 pointer-events-none flex items-center gap-1">
                <ChevronDown className="w-3 h-3" />
                {t("chartLegend.scrollToSeeMore")}
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

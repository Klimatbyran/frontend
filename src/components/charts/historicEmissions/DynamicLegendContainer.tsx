import React, { useState, useRef, useEffect } from "react";
import { LegendItem } from "../ChartTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

interface DynamicLegendContainerProps {
  items: LegendItem[];
  onItemToggle?: (itemName: string) => void;
  showMetadata?: boolean;
  allowClickToHide?: boolean;
  maxHeight?: string;
  mobileMaxHeight?: string;
  className?: string;
}

export const DynamicLegendContainer: React.FC<DynamicLegendContainerProps> = ({
  items,
  onItemToggle,
  showMetadata = false,
  allowClickToHide = true,
  maxHeight = "200px",
  mobileMaxHeight = "100px",
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Check if content needs scrolling
  useEffect(() => {
    if (containerRef.current && !isExpanded) {
      const container = containerRef.current;
      const content = container.querySelector(
        "[data-legend-content]",
      ) as HTMLElement;

      if (content) {
        const isScrollable = content.scrollHeight > content.clientHeight;
        setNeedsScroll(isScrollable);
      }
    }
  }, [items, isExpanded]);

  // Reset state when items change
  useEffect(() => {
    setIsExpanded(false);
    setNeedsScroll(false);
  }, [items]);

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={`transition-all duration-300 ${
          isExpanded
            ? "h-auto"
            : needsScroll
              ? `h-[${mobileMaxHeight}] md:h-[${maxHeight}]`
              : "h-auto"
        } ${className}`}
      >
        <div
          data-legend-content
          className={`transition-all duration-300 ${
            isExpanded
              ? "max-h-none"
              : needsScroll
                ? `max-h-[${mobileMaxHeight}] md:max-h-[${maxHeight}] overflow-y-auto`
                : "max-h-none"
          }`}
        >
          <div className="flex flex-wrap gap-2">
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
        </div>
      </div>
    </TooltipProvider>
  );
};

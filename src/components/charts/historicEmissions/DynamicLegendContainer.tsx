import React, { useRef } from "react";
import { LegendItem } from "../../../types/charts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";

interface DynamicLegendContainerProps {
  items: LegendItem[];
  onItemToggle?: (itemName: string) => void;
  showMetadata?: boolean;
  allowClickToHide?: boolean;
  maxHeight?: string;
  mobileMaxHeight?: string;
  className?: string;
  forceExpandable?: boolean;
  containerHeight?: string;
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
  const { isMobile } = useScreenSize();

  // Determine if we should show expandable behavior
  const shouldShowExpandable = forceExpandable || items.length > 6;

  return (
    <TooltipProvider>
      <div ref={containerRef} className={`${className} -ml-2 md:ml-0`}>
        {shouldShowExpandable && isMobile ? (
          // Mobile: Use scrolling container
          <div
            data-legend-content
            className="flex flex-wrap gap-0.5 max-h-[130px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-grey/30 hover:scrollbar-thumb-grey/50 border rounded-md px-3 py-2"
          >
            {items.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center gap-1 px-3 py-2 rounded bg-black-2 hover:bg-black-1 transition-colors ${
                      allowClickToHide ? "cursor-pointer" : "cursor-default"
                    } ${item.isHidden ? "opacity-50" : "opacity-100"}`}
                    onClick={() => {
                      if (allowClickToHide && onItemToggle) {
                        onItemToggle(item.name);
                      }
                    }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded flex-shrink-0"
                      style={{
                        backgroundColor: item.color,
                        borderColor: item.color,
                      }}
                    />
                    <span className="text-xs text-white">{item.name}</span>
                    {showMetadata && item.metadata && (
                      <span className="text-xs text-grey/70">
                        {item.metadata.value
                          ? `${item.metadata.value}${item.metadata.unit || ""}`
                          : ""}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                {allowClickToHide && (
                  <TooltipContent
                    className="z-[70]"
                    side="top"
                    avoidCollisions={true}
                    collisionPadding={8}
                  >
                    <p>{t("chartLegend.clickToFilterOut")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        ) : (
          // Desktop: Use normal flex layout without overflow clipping
          <div
            data-legend-content
            className={`flex flex-wrap gap-2 ${
              shouldShowExpandable && !isMobile
                ? "max-h-[150px] border rounded-md px-3 py-2"
                : ""
            }`}
            style={
              shouldShowExpandable && !isMobile ? { overflow: "visible" } : {}
            }
          >
            {items.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center gap-1 md:gap-2 px-3 py-2 md:p-2 rounded bg-black-2 hover:bg-black-1 transition-colors ${
                      allowClickToHide ? "cursor-pointer" : "cursor-default"
                    } ${item.isHidden ? "opacity-50" : "opacity-100"}`}
                    onClick={() => {
                      if (allowClickToHide && onItemToggle) {
                        onItemToggle(item.name);
                      }
                    }}
                  >
                    <div
                      className="w-2.5 h-2.5 md:w-3 md:h-3 rounded flex-shrink-0"
                      style={{
                        backgroundColor: item.color,
                        borderColor: item.color,
                      }}
                    />
                    <span className="text-xs md:text-sm text-white">
                      {item.name}
                    </span>
                    {showMetadata && item.metadata && (
                      <span className="text-xs text-grey/70">
                        {item.metadata.value
                          ? `${item.metadata.value}${item.metadata.unit || ""}`
                          : ""}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                {allowClickToHide && (
                  <TooltipContent
                    className="z-[70]"
                    side="top"
                    avoidCollisions={true}
                    collisionPadding={8}
                  >
                    <p>{t("chartLegend.clickToFilterOut")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        )}

        {/* Simple scroll hint - only show on mobile */}
        {shouldShowExpandable && isMobile && (
          <div className="text-center mt-2">
            <div className="text-xs text-grey/70 flex items-center justify-center gap-1">
              {t("chartLegend.scrollToSeeMore")}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

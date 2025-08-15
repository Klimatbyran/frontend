import React, { useState, useRef, useEffect } from "react";
import { EnhancedChartLegend, LegendItem } from "./EnhancedChartLegend";

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

  const handleHeightChange = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
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
        <EnhancedChartLegend
          items={items}
          onItemToggle={onItemToggle}
          showMetadata={showMetadata}
          allowClickToHide={allowClickToHide}
          expandable={needsScroll}
          maxHeight={maxHeight}
          mobileMaxHeight={mobileMaxHeight}
        />
      </div>
    </div>
  );
};

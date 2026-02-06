import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ColorFunction } from "@/types/visualizations";
import { useScreenSize } from "@/hooks/useScreenSize";
import { BeeswarmTooltip } from "./BeeswarmTooltip";
import { BeeswarmLegend } from "./BeeswarmLegend";

interface BeeswarmChartProps<T> {
  data: T[];
  getValue: (item: T) => number;
  getCompanyName: (item: T) => string;
  getCompanyId: (item: T) => string;
  colorForValue: ColorFunction;
  min: number;
  max: number;
  unit: string;
  onCompanyClick?: (item: T) => void;
  maxDisplayCount?: number;
  formatTooltipValue?: (value: number, unit: string) => string; // Custom formatter for tooltip value
  xReferenceLines?: Array<{ value: number; label?: string; color?: string }>; // Vertical reference lines
  capThreshold?: number; // Optional cap threshold - values above this will be capped
  getRawValue?: (item: T) => number; // Optional function to get raw (uncapped) value for tooltip
  showLegend?: boolean;
  legendMin?: number;
  legendMax?: number;
  // Tooltip customization
  getMeetsParis?: (item: T) => boolean | null;
  getBudgetValue?: (item: T) => number;
  getRank?: (item: T) => number | null;
  totalCount?: number;
}

export function BeeswarmChart<T>({
  data,
  getValue,
  getCompanyName,
  getCompanyId,
  colorForValue,
  min,
  max,
  unit,
  onCompanyClick,
  maxDisplayCount = 600,
  formatTooltipValue,
  xReferenceLines,
  capThreshold,
  getRawValue,
  showLegend = true,
  legendMin,
  legendMax,
  getMeetsParis,
  getBudgetValue,
  getRank,
  totalCount,
}: BeeswarmChartProps<T>) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const displayData = data.slice(0, maxDisplayCount);
  const [hoveredItem, setHoveredItem] = useState<{
    item: T;
    position: { x: number; y: number };
  } | null>(null);
  const [displayMobileTooltip, setDisplayMobileTooltip] = useState(false);

  const handleMouseEnter = useCallback((e: React.MouseEvent, item: T) => {
    setHoveredItem({
      item,
      position: { x: e.clientX, y: e.clientY },
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (hoveredItem) {
        setHoveredItem({
          ...hoveredItem,
          position: { x: e.clientX, y: e.clientY },
        });
      }
    },
    [hoveredItem],
  );

  const handleMouseLeave = useCallback(() => {
    // Don't clear on mobile if tooltip is open
    if (isMobile && displayMobileTooltip) {
      return;
    }
    setHoveredItem(null);
  }, [isMobile, displayMobileTooltip]);

  const handleDotClick = (item: T, e: React.MouseEvent) => {
    if (isMobile) {
      setDisplayMobileTooltip(true);
      setHoveredItem({
        item,
        position: { x: e.clientX, y: e.clientY },
      });
      return;
    }
    onCompanyClick?.(item);
  };

  // Close tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      setHoveredItem(null);
      setDisplayMobileTooltip(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const legendGradient = useMemo(() => {
    if (!showLegend) return undefined;
    const start = legendMin ?? min;
    const end = legendMax ?? max;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start === end) {
      return undefined;
    }

    const steps = 5;
    const stops = Array.from({ length: steps }, (_, idx) => {
      const percent = (idx / (steps - 1)) * 100;
      const value = start + ((end - start) * idx) / (steps - 1);
      return `${colorForValue(value)} ${percent}%`;
    });

    return `linear-gradient(to right, ${stops.join(", ")})`;
  }, [showLegend, legendMin, legendMax, min, max, colorForValue]);

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col">
      {/* X-axis labels */}
      <div
        className="relative mb-2 text-xs text-grey px-1"
        style={{ height: "16px" }}
      >
        <span className="absolute left-0">
          {min.toFixed(1)}
          {unit}
        </span>
        <span className="absolute right-0">
          {max.toFixed(1)}
          {unit}
          {capThreshold !== undefined && max >= capThreshold && (
            <span className="text-[10px] ml-1 opacity-70">
              {t("companiesTopListsPage.visualizations.beeswarm.capped")}
            </span>
          )}
        </span>
      </div>

      {/* Main visualization area */}
      <div
        className="relative flex-1 border-t border-b border-black-4"
        onClick={() => {
          if (isMobile && displayMobileTooltip) {
            setDisplayMobileTooltip(false);
            setHoveredItem(null);
          }
        }}
      >
        {/* Zero line (vertical) - only show if 0 is within data range */}
        {min <= 0 && max >= 0 && (
          <div
            className="absolute top-0 bottom-0 w-px bg-black-4 z-0"
            style={{
              left: max === min ? "50%" : `${((0 - min) / (max - min)) * 100}%`,
            }}
          />
        )}

        {/* Reference lines (vertical) */}
        {xReferenceLines?.map((line, idx) => {
          if (line.value < min || line.value > max) return null;
          const xPercent =
            max === min ? 50 : ((line.value - min) / (max - min)) * 100;
          return (
            <div
              key={idx}
              className="absolute top-0 bottom-0 w-px z-0"
              style={{
                left: `${xPercent}%`,
                backgroundColor: line.color || "var(--grey)",
                borderLeft: line.color
                  ? `1px solid ${line.color}`
                  : "1px dashed var(--grey)",
              }}
            >
              {line.label && (
                <div
                  className="absolute bottom-0 left-0 translate-y-full text-xs text-grey whitespace-nowrap text-left"
                  style={{ marginTop: "4px" }}
                >
                  {line.label}
                </div>
              )}
            </div>
          );
        })}

        {/* Dots */}
        <div className="relative w-full h-full">
          {displayData.map((item, i) => {
            const v = getValue(item);
            const rawValue = getRawValue ? getRawValue(item) : v;
            const isCapped =
              capThreshold !== undefined && rawValue > capThreshold;

            const displayValue = isCapped ? capThreshold : v;
            const xPercent =
              max === min ? 50 : ((displayValue - min) / (max - min)) * 100;

            const hash = (i * 137.5) % 360;
            const yJitter = Math.sin((hash * Math.PI) / 180) * 180; // -180 to +180px from center
            const spread = Math.min(Math.abs(yJitter) / 6, 80);
            const yOffset = yJitter > 0 ? spread : -spread;

            return (
              <div
                key={getCompanyId(item)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDotClick(item, e);
                }}
                onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`absolute cursor-pointer transition-transform z-10 ${
                  hoveredItem?.item === item
                    ? "scale-150"
                    : !isMobile
                      ? "hover:scale-150"
                      : ""
                }`}
                style={{
                  left: `calc(${xPercent}% - 8px)`,
                  top: `calc(50% + ${yOffset}px)`,
                }}
              >
                {/* Main dot */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: "16px",
                    height: "16px",
                    background: colorForValue(rawValue),
                    border: "2px solid var(--black-4)",
                    boxShadow: "0 2px 4px var(--black-4)",
                  }}
                />
                {/* Capped indicator - triangle arrow on the right */}
                {isCapped && (
                  <div
                    className="absolute"
                    style={{
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "6px solid var(--grey)",
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend and company count */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 text-xs text-grey">
        {showLegend ? (
          <>
            <div className="flex items-center justify-center md:justify-end order-2 md:order-1">
              <BeeswarmLegend
                min={legendMin ?? min}
                max={legendMax ?? max}
                unit={unit}
                gradientBackground={legendGradient}
              />
            </div>
            <div className="text-center md:text-left order-1 md:order-2">
              {t("companiesTopListsPage.visualizations.beeswarm.companiesShown", {
                count: data.length,
              })}
              {data.length >= maxDisplayCount &&
                ` ${t(
                  "companiesTopListsPage.visualizations.beeswarm.showingFirst",
                  {
                    count: maxDisplayCount,
                  },
                )}`}
            </div>
          </>
        ) : (
          <div className="text-center w-full">
            {t("companiesTopListsPage.visualizations.beeswarm.companiesShown", {
              count: data.length,
            })}
            {data.length >= maxDisplayCount &&
              ` ${t(
                "companiesTopListsPage.visualizations.beeswarm.showingFirst",
                {
                  count: maxDisplayCount,
                },
              )}`}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredItem && (!isMobile || displayMobileTooltip) && (
        <BeeswarmTooltip
          companyName={getCompanyName(hoveredItem.item)}
          value={getValue(hoveredItem.item)}
          unit={unit}
          position={hoveredItem.position}
          formatValue={formatTooltipValue}
          rawValue={getRawValue ? getRawValue(hoveredItem.item) : undefined}
          isCapped={
            capThreshold !== undefined &&
            (getRawValue
              ? getRawValue(hoveredItem.item)
              : getValue(hoveredItem.item)) > capThreshold
          }
          capThreshold={capThreshold}
          meetsParis={
            getMeetsParis ? getMeetsParis(hoveredItem.item) : undefined
          }
          budgetValue={
            getBudgetValue ? getBudgetValue(hoveredItem.item) : undefined
          }
          rank={getRank ? getRank(hoveredItem.item) : undefined}
          total={totalCount}
          isMobile={isMobile}
          wikidataId={getCompanyId(hoveredItem.item)}
        />
      )}
    </div>
  );
}

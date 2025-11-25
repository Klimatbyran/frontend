import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ColorFunction } from "@/types/visualizations";
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
  leftLabel?: string;
  rightLabel?: string;
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
  leftLabel,
  rightLabel,
}: BeeswarmChartProps<T>) {
  const { t } = useTranslation();
  const displayData = data.slice(0, maxDisplayCount);
  const [hoveredItem, setHoveredItem] = useState<{
    item: T;
    position: { x: number; y: number };
  } | null>(null);

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
    setHoveredItem(null);
  }, []);

  return (
    <div className="relative w-full h-[500px] flex flex-col">
      {/* X-axis labels */}
      <div
        className="relative mb-2 text-xs text-grey px-1"
        style={{ height: "16px" }}
      >
        <span className="absolute left-0">
          {min.toFixed(1)}
          {unit}
        </span>
        {min <= 0 && max >= 0 && (
          <span
            className="absolute font-medium"
            style={{
              left: max === min ? "50%" : `${((0 - min) / (max - min)) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            0{unit}
          </span>
        )}
        <span className="absolute right-0">
          {max.toFixed(1)}
          {unit}
          {capThreshold !== undefined && max >= capThreshold && (
            <span className="text-[10px] ml-1 opacity-70">
              {t("companiesRankedPage.visualizations.beeswarm.capped")}
            </span>
          )}
        </span>
      </div>

      {/* Main visualization area */}
      <div className="relative flex-1 border-t border-b border-black-4">
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
                backgroundColor: line.color || "rgba(255, 255, 255, 0.3)",
                borderLeft: line.color
                  ? `1px solid ${line.color}`
                  : "1px dashed rgba(255, 255, 255, 0.3)",
              }}
            >
              {line.label && (
                <div
                  className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-full text-xs text-grey whitespace-nowrap"
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
                onClick={() => onCompanyClick?.(item)}
                onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="absolute cursor-pointer hover:scale-150 transition-transform z-10"
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
                    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
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
                      borderLeft: "6px solid rgba(255, 255, 255, 0.7)",
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
      <div className="mt-8 flex items-center justify-between text-xs text-grey">
        <div className={showLegend ? "" : "text-center w-full"}>
          {t("companiesRankedPage.visualizations.beeswarm.companiesShown", {
            count: data.length,
          })}
          {data.length >= maxDisplayCount &&
            ` ${t("companiesRankedPage.visualizations.beeswarm.showingFirst", {
              count: maxDisplayCount,
            })}`}
        </div>
        {showLegend && (
          <div className="flex items-center">
            <BeeswarmLegend
              min={legendMin ?? min}
              max={legendMax ?? max}
              unit={unit}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
            />
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredItem && (
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
        />
      )}
    </div>
  );
}

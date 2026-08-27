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
  formatTooltipValue?: (value: number, unit: string) => string;
  xReferenceLines?: Array<{ value: number; label?: string; color?: string }>;
  capThreshold?: number;
  getRawValue?: (item: T) => number;
  showLegend?: boolean;
  legendMin?: number;
  legendMax?: number;
  getRank?: (item: T) => number | null;
  totalCount?: number;
}

function computeDotPosition(
  displayValue: number,
  min: number,
  max: number,
  index: number,
): { xPercent: number; yOffset: number } {
  const xPercent =
    max === min ? 50 : ((displayValue - min) / (max - min)) * 100;
  const hash = (index * 137.5) % 360;
  const yJitter = Math.sin((hash * Math.PI) / 180) * 180;
  const spread = Math.min(Math.abs(yJitter) / 6, 80);
  const yOffset = yJitter > 0 ? spread : -spread;
  return { xPercent, yOffset };
}

function ZeroLine({ min, max }: { min: number; max: number }) {
  if (min > 0 || max < 0) return null;
  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-black-4 z-0"
      style={{
        left: max === min ? "50%" : `${((0 - min) / (max - min)) * 100}%`,
      }}
    />
  );
}

function ReferenceLines({
  lines,
  min,
  max,
}: {
  lines: Array<{ value: number; label?: string; color?: string }>;
  min: number;
  max: number;
}) {
  return (
    <>
      {lines.map((line, idx) => {
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
    </>
  );
}

function BeeswarmDot<T>({
  item,
  index,
  min,
  max,
  capThreshold,
  getValue,
  getRawValue,
  getCompanyId,
  colorForValue,
  isHovered,
  isMobile,
  onDotClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}: {
  item: T;
  index: number;
  min: number;
  max: number;
  capThreshold?: number;
  getValue: (item: T) => number;
  getRawValue?: (item: T) => number;
  getCompanyId: (item: T) => string;
  colorForValue: ColorFunction;
  isHovered: boolean;
  isMobile: boolean;
  onDotClick: (item: T, e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent, item: T) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}) {
  const v = getValue(item);
  const rawValue = getRawValue ? getRawValue(item) : v;
  const isCapped = capThreshold !== undefined && rawValue > capThreshold;
  const displayValue = isCapped ? capThreshold! : v;
  const { xPercent, yOffset } = computeDotPosition(
    displayValue,
    min,
    max,
    index,
  );

  return (
    <div
      key={getCompanyId(item)}
      onClick={(e) => {
        e.stopPropagation();
        onDotClick(item, e);
      }}
      onMouseEnter={(e) => onMouseEnter(e, item)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`absolute cursor-pointer transition-transform z-10 ${
        isHovered ? "scale-150" : !isMobile ? "hover:scale-150" : ""
      }`}
      style={{
        left: `calc(${xPercent}% - 8px)`,
        top: `calc(50% + ${yOffset}px)`,
      }}
    >
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
}

function useBeeswarmTooltip<T>(isMobile: boolean) {
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
    if (isMobile && displayMobileTooltip) return;
    setHoveredItem(null);
  }, [isMobile, displayMobileTooltip]);

  useEffect(() => {
    const handleScroll = () => {
      setHoveredItem(null);
      setDisplayMobileTooltip(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    hoveredItem,
    displayMobileTooltip,
    setHoveredItem,
    setDisplayMobileTooltip,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
  };
}

function BeeswarmAxisLabels({
  min,
  max,
  unit,
  capThreshold,
  cappedLabel,
}: {
  min: number;
  max: number;
  unit: string;
  capThreshold?: number;
  cappedLabel?: string;
}) {
  const showCapped =
    capThreshold !== undefined && max >= capThreshold && cappedLabel;
  return (
    <div
      className="relative mt-2 text-xs text-grey px-1"
      style={{ height: "16px" }}
    >
      <span className="absolute left-0">
        {min.toFixed(1)}
        {unit}
      </span>
      <span className="absolute right-0">
        {max.toFixed(1)}
        {unit}
        {showCapped && (
          <span className="text-[10px] ml-1 opacity-70">{cappedLabel}</span>
        )}
      </span>
    </div>
  );
}

function BeeswarmLegendSection({
  showLegend,
  legendMin,
  legendMax,
  min,
  max,
  unit,
  gradientBackground,
}: {
  showLegend: boolean;
  legendMin?: number;
  legendMax?: number;
  min: number;
  max: number;
  unit: string;
  gradientBackground?: string;
}) {
  if (!showLegend) return <div />;
  return (
    <div className="flex items-center justify-center md:justify-end order-2 md:order-1">
      <BeeswarmLegend
        min={legendMin ?? min}
        max={legendMax ?? max}
        unit={unit}
        gradientBackground={gradientBackground}
      />
    </div>
  );
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
  getRank,
  totalCount,
}: BeeswarmChartProps<T>) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const displayData = data.slice(0, maxDisplayCount);

  const {
    hoveredItem,
    displayMobileTooltip,
    setHoveredItem,
    setDisplayMobileTooltip,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
  } = useBeeswarmTooltip<T>(isMobile);

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

  const showTooltip = hoveredItem && (!isMobile || displayMobileTooltip);
  const hoveredRawValue = hoveredItem
    ? getRawValue
      ? getRawValue(hoveredItem.item)
      : getValue(hoveredItem.item)
    : undefined;
  const isHoveredCapped =
    capThreshold !== undefined && (hoveredRawValue ?? 0) > capThreshold;

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col">
      <div
        className="relative flex-1 border-t border-b border-black-4"
        onClick={() => {
          if (isMobile && displayMobileTooltip) {
            setDisplayMobileTooltip(false);
            setHoveredItem(null);
          }
        }}
      >
        <ZeroLine min={min} max={max} />
        {xReferenceLines && (
          <ReferenceLines lines={xReferenceLines} min={min} max={max} />
        )}

        <div className="relative w-full h-full">
          {displayData.map((item, i) => (
            <BeeswarmDot
              key={getCompanyId(item)}
              item={item}
              index={i}
              min={min}
              max={max}
              capThreshold={capThreshold}
              getValue={getValue}
              getRawValue={getRawValue}
              getCompanyId={getCompanyId}
              colorForValue={colorForValue}
              isHovered={hoveredItem?.item === item}
              isMobile={isMobile}
              onDotClick={handleDotClick}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>
      </div>

      <BeeswarmAxisLabels
        min={min}
        max={max}
        unit={unit}
        capThreshold={capThreshold}
        cappedLabel={t("companiesOverviewPage.visualizations.beeswarm.capped")}
      />

      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 text-xs text-grey">
        <BeeswarmLegendSection
          showLegend={showLegend}
          legendMin={legendMin}
          legendMax={legendMax}
          min={min}
          max={max}
          unit={unit}
          gradientBackground={legendGradient}
        />
      </div>

      {showTooltip && hoveredItem && (
        <BeeswarmTooltip
          companyName={getCompanyName(hoveredItem.item)}
          value={getValue(hoveredItem.item)}
          unit={unit}
          position={hoveredItem.position}
          formatValue={formatTooltipValue}
          rawValue={hoveredRawValue}
          isCapped={isHoveredCapped}
          capThreshold={capThreshold}
          rank={getRank?.(hoveredItem.item)}
          total={totalCount}
          isMobile={isMobile}
          wikidataId={getCompanyId(hoveredItem.item)}
        />
      )}
    </div>
  );
}

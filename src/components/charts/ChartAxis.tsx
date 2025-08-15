import React from "react";
import { XAxis, YAxis } from "recharts";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";

interface ChartAxisProps {
  // X-Axis props
  xAxisDataKey?: string;
  xAxisDomain?: [number, number];
  xAxisTicks?: number[];
  xAxisPadding?: { left: number; right: number };
  xAxisTickFormatter?: (value: any) => string;

  // Y-Axis props
  yAxisTickFormatter?: (value: any) => string;
  yAxisWidth?: number;
  yAxisDomain?: [number, number];
  yAxisPadding?: { top: number; bottom: number };

  // Common props
  showGrid?: boolean;
  className?: string;
}

/**
 * Enhanced chart axis component that provides consistent axis styling.
 * Supports both emissions formatting and custom formatting.
 */
export const ChartAxis: React.FC<ChartAxisProps> = ({
  // X-Axis
  xAxisDataKey = "year",
  xAxisDomain = [1990, 2050],
  xAxisTicks,
  xAxisPadding = { left: 0, right: 0 },
  xAxisTickFormatter,

  // Y-Axis
  yAxisTickFormatter,
  yAxisWidth = 80,
  yAxisDomain = [0, "auto"],
  yAxisPadding = { top: 0, bottom: 0 },

  // Common
  showGrid = false,
  className = "",
}) => {
  const { currentLanguage } = useLanguage();

  // Default X-axis ticks if not provided
  const defaultXTicks = xAxisTicks ?? [
    1990,
    2015,
    2020,
    new Date().getFullYear(),
    2030,
    2040,
    2050,
  ];

  // Default Y-axis formatter for emissions if not provided
  const defaultYFormatter =
    yAxisTickFormatter ??
    ((value: number) => formatEmissionsAbsoluteCompact(value, currentLanguage));

  return (
    <>
      <XAxis
        dataKey={xAxisDataKey}
        stroke="var(--grey)"
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: 12 }}
        padding={xAxisPadding}
        domain={xAxisDomain}
        allowDuplicatedCategory={true}
        ticks={defaultXTicks}
        tickFormatter={
          xAxisTickFormatter ?? ((year: number) => year.toString())
        }
      />

      <YAxis
        stroke="var(--grey)"
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: 12 }}
        tickFormatter={defaultYFormatter}
        width={yAxisWidth}
        domain={yAxisDomain}
        padding={yAxisPadding}
      />
    </>
  );
};

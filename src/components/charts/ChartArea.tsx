import React from "react";
import { Area } from "recharts";

interface ChartAreaProps {
  dataKey: string;
  color: string;
  name?: string;
  isHidden?: boolean;
  hide?: boolean; // Alternative prop name used in company charts
  isDashed?: boolean;
  strokeWidth?: number;
  fillOpacity?: number;
  stackId?: string;
  connectNulls?: boolean;
  onToggle?: () => void;
  className?: string;
  data?: any[]; // For areas that need separate data
  type?:
    | "monotone"
    | "linear"
    | "step"
    | "stepBefore"
    | "stepAfter"
    | "basis"
    | "basisOpen"
    | "basisClosed"
    | "natural"
    | "monotoneX"
    | "monotoneY";
  fill?: string; // Allow custom fill color
  stroke?: string; // Allow custom stroke color
}

/**
 * Shared chart area component that provides consistent area styling.
 * Based on patterns from company and municipality chart components.
 * Supports both municipality (isHidden) and company (hide) patterns.
 */
export const ChartArea: React.FC<ChartAreaProps> = ({
  dataKey,
  color,
  name,
  isHidden = false,
  hide = false,
  isDashed = false,
  strokeWidth = 1,
  fillOpacity = 0,
  stackId,
  connectNulls = true,
  onToggle,
  className = "",
  data,
  type = "monotone",
  fill,
  stroke,
}) => {
  // Support both isHidden and hide props
  const shouldHide = isHidden || hide;

  if (shouldHide) {
    return null;
  }

  return (
    <Area
      type={type}
      dataKey={dataKey}
      data={data}
      stroke={stroke || color}
      fill={fill || color}
      fillOpacity={fillOpacity}
      strokeWidth={strokeWidth}
      strokeDasharray={isDashed ? "4 4" : undefined}
      stackId={stackId}
      name={name}
      connectNulls={connectNulls}
      style={{
        cursor: onToggle ? "pointer" : "default",
        opacity: shouldHide ? 0.4 : 1,
      }}
      onClick={onToggle}
      className={className}
    />
  );
};

// Predefined area configurations for common use cases
export const CommonAreaStyles = {
  // Stacked area for sectors
  sector: (dataKey: string, color: string, name?: string) => ({
    dataKey,
    color,
    name: name || dataKey,
    isDashed: false,
    strokeWidth: 1,
    fillOpacity: 0,
    stackId: "1",
    connectNulls: true,
    type: "monotone" as const,
  }),

  // Filled area for emphasis
  filled: (dataKey: string, color: string, name?: string) => ({
    dataKey,
    color,
    name: name || dataKey,
    isDashed: false,
    strokeWidth: 1,
    fillOpacity: 0.2,
    connectNulls: true,
    type: "monotone" as const,
  }),

  // Dashed area for projections
  projected: (dataKey: string, color: string, name?: string) => ({
    dataKey,
    color,
    name: name || dataKey,
    isDashed: true,
    strokeWidth: 1,
    fillOpacity: 0,
    connectNulls: true,
    type: "monotone" as const,
  }),

  // Transparent stroke for outlines
  outline: (dataKey: string, color: string, name?: string) => ({
    dataKey,
    color,
    name: name || dataKey,
    isDashed: false,
    strokeWidth: 1,
    fillOpacity: 0,
    connectNulls: true,
    type: "monotone" as const,
  }),

  // Shaded area for trend analysis
  trendShading: (dataKey: string, color: string, name?: string) => ({
    dataKey,
    color,
    name: name || dataKey,
    isDashed: false,
    strokeWidth: 1,
    fillOpacity: 0.1,
    connectNulls: true,
    type: "monotone" as const,
  }),
};


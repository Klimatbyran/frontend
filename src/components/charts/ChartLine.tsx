import React from "react";
import { Line } from "recharts";
import { isMobile } from "react-device-detect";

interface ChartLineProps {
  dataKey: string;
  color: string;
  name?: string;
  isHidden?: boolean;
  hide?: boolean; // Alternative prop name used in company charts
  isDashed?: boolean;
  strokeWidth?: number;
  connectNulls?: boolean;
  showDots?: boolean;
  onToggle?: () => void;
  className?: string;
  data?: any[]; // For lines that need separate data
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
  dot?: any; // Allow custom dot configuration
  activeDot?: any; // Allow custom active dot configuration
}

/**
 * Shared chart line component that provides consistent line styling.
 * Based on patterns from company and municipality chart components.
 * Supports both municipality (isHidden) and company (hide) patterns.
 */
export const ChartLine: React.FC<ChartLineProps> = ({
  dataKey,
  color,
  name,
  isHidden = false,
  hide = false,
  isDashed = false,
  strokeWidth = 2,
  connectNulls = true,
  showDots = !isMobile, // Default to no dots on mobile
  onToggle,
  className = "",
  data,
  type = "monotone",
  dot,
  activeDot,
}) => {
  // Support both isHidden and hide props
  const shouldHide = isHidden || hide;

  if (shouldHide) {
    return null;
  }

  // Use custom dot/activeDot if provided, otherwise use defaults
  const finalDot =
    dot !== undefined
      ? dot
      : showDots
        ? {
            r: 4,
            fill: color,
            stroke: color,
            cursor: onToggle ? "pointer" : "default",
            onClick: onToggle,
          }
        : false;

  const finalActiveDot =
    activeDot !== undefined
      ? activeDot
      : showDots
        ? {
            r: 6,
            fill: color,
            stroke: color,
            cursor: onToggle ? "pointer" : "default",
          }
        : false;

  return (
    <Line
      type={type}
      dataKey={dataKey}
      data={data}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={isDashed ? "4 4" : undefined}
      dot={finalDot}
      activeDot={finalActiveDot}
      connectNulls={connectNulls}
      name={name}
      className={className}
    />
  );
};

// Predefined line configurations for common use cases
export const CommonLineStyles = {
  // Historical data line
  historical: (dataKey: string, name?: string) => ({
    dataKey,
    color: "white",
    name: name || "Historical",
    isDashed: false,
    strokeWidth: 2,
    connectNulls: true,
    type: "monotone" as const,
  }),

  // Estimated/projected data line
  estimated: (dataKey: string, name?: string) => ({
    dataKey,
    color: "white",
    name: name || "Estimated",
    isDashed: true,
    strokeWidth: 2,
    connectNulls: true,
    type: "monotone" as const,
  }),

  // Trend line
  trend: (dataKey: string, name?: string) => ({
    dataKey,
    color: "var(--pink-3)",
    name: name || "Trend",
    isDashed: true,
    strokeWidth: 2,
    connectNulls: true,
    type: "monotone" as const,
  }),

  // Paris Agreement line
  parisAgreement: (dataKey: string, name?: string) => ({
    dataKey,
    color: "var(--green-3)",
    name: name || "Paris Agreement",
    isDashed: true,
    strokeWidth: 2,
    connectNulls: true,
    type: "monotone" as const,
  }),

  // Carbon Law line
  carbonLaw: (dataKey: string, name?: string) => ({
    dataKey,
    color: "var(--green-3)",
    name: name || "Carbon Law",
    isDashed: true,
    strokeWidth: 1,
    connectNulls: true,
    type: "monotone" as const,
  }),

  // Approximated data line
  approximated: (dataKey: string, name?: string) => ({
    dataKey,
    color: "var(--grey)",
    name: name || "Approximated",
    isDashed: true,
    strokeWidth: 1,
    connectNulls: true,
    type: "linear" as const,
  }),

  // Scope lines
  scope1: (dataKey: string, name?: string) => ({
    dataKey,
    color: "var(--pink-3)",
    name: name || "Scope 1",
    isDashed: false,
    strokeWidth: 2,
    connectNulls: true,
    type: "monotone" as const,
  }),

  scope2: (dataKey: string, name?: string) => ({
    dataKey,
    color: "var(--green-2)",
    name: name || "Scope 2",
    isDashed: false,
    strokeWidth: 2,
    connectNulls: true,
    type: "monotone" as const,
  }),

  scope3: (dataKey: string, name?: string) => ({
    dataKey,
    color: "var(--blue-2)",
    name: name || "Scope 3",
    isDashed: false,
    strokeWidth: 2,
    connectNulls: true,
    type: "monotone" as const,
  }),
};


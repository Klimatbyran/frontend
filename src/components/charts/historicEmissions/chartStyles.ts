/**
 * Chart styling constants and utilities
 */

import React from "react";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";

export const LINE_STYLES = {
  // Main data lines
  primary: {
    strokeWidth: 2,
    dot: false,
    activeDot: { r: 6, cursor: "pointer" },
  },
  // Secondary/estimated lines
  secondary: {
    strokeWidth: 2,
    strokeDasharray: "4 4",
    dot: false,
    activeDot: { r: 6, cursor: "pointer" },
  },
  // Trend lines
  trend: {
    strokeWidth: 2,
    strokeDasharray: "4 4",
    dot: false,
    activeDot: { r: 6, cursor: "pointer" },
  },
} as const;

// Chart colors
export const CHART_COLORS = {
  primary: "white", // Historical/solid white
  secondary: "var(--grey)", // Estimated/dashed grey
  trend: "var(--pink-3)", // Trend/dashed pink
  paris: "var(--green-2)", // Paris/dashed green
} as const;

// Chart dimensions
export const CHART_DIMENSIONS = {
  height: {
    mobile: "300px",
    desktop: "400px",
  },
  margin: {
    top: 20,
    right: 0,
    left: -10, // Increased for tilted Y-axis labels
    bottom: 0,
  },
  padding: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
} as const;

// Line configuration for different types
export const LINE_CONFIGS = {
  historical: {
    type: "primary" as const,
    color: CHART_COLORS.primary,
    style: LINE_STYLES.primary,
  },
  estimated: {
    type: "secondary" as const,
    color: CHART_COLORS.secondary,
    style: LINE_STYLES.secondary,
  },
  trend: {
    type: "trend" as const,
    color: CHART_COLORS.trend,
    style: LINE_STYLES.trend,
  },
  paris: {
    type: "trend" as const,
    color: CHART_COLORS.paris,
    style: LINE_STYLES.trend,
  },
  scope: {
    type: "primary" as const,
    color: "var(--pink-3)", // Will be overridden by stroke prop
    style: LINE_STYLES.primary,
  },
  category: {
    type: "primary" as const,
    color: "var(--pink-3)", // Will be overridden by stroke prop
    style: LINE_STYLES.primary,
  },
} as const;

// Utility function to get consistent line props for specific line types
export const getConsistentLineProps = (
  lineType: keyof typeof LINE_CONFIGS,
  isMobile: boolean = false,
  name?: string,
  customColor?: string,
) => {
  const config = LINE_CONFIGS[lineType];
  const color = customColor || config.color;
  return {
    ...config.style,
    stroke: color,
    name,
    dot: false,
    activeDot: isMobile ? false : { r: 6, fill: color, cursor: "pointer" },
  };
};

// Utility function to get line props with hover behavior (no dots except on hover)
export const getLinePropsWithHover = (
  type: keyof typeof LINE_STYLES,
  color: string,
  isMobile: boolean = false,
  name?: string,
) => {
  const style = LINE_STYLES[type];
  return {
    ...style,
    stroke: color,
    name,
    dot: false,
    activeDot: isMobile ? false : { r: 6, fill: color, cursor: "pointer" },
  };
};

// X-axis styling utilities
export const getXAxisProps = (
  dataKey: string,
  domain?: [number, number],
  ticks?: number[],
  customTick?: (props: any) => React.ReactElement,
) => {
  const baseProps: any = {
    dataKey,
    stroke: "var(--grey)",
    tickLine: false,
    axisLine: false,
    padding: { left: 0, right: 0 },
    tick:
      customTick ||
      (({ x, y, payload }: any): React.ReactElement => {
        return React.createElement(
          "text",
          {
            x: x - 15,
            y: y + 10,
            fontSize: 12,
            fill: "var(--grey)",
            fontWeight: "normal",
          },
          payload.value,
        );
      }),
  };

  if (domain) {
    baseProps.domain = domain;
  }
  if (ticks) {
    baseProps.ticks = ticks;
  }

  return baseProps;
};

// Y-axis styling utilities
export const getYAxisProps = (
  currentLanguage: "sv" | "en",
  domain: [number, "auto"] = [0, "auto"],
) => ({
  stroke: "var(--grey)",
  tickLine: false,
  axisLine: false,
  tick: ({ x, y, payload }: any): React.ReactElement => {
    return React.createElement(
      "text",
      {
        x: x - 10,
        y: y + 5,
        fontSize: 12,
        fill: "var(--grey)",
        textAnchor: "end",
        transform: `rotate(-30, ${x - 10}, ${y + 5})`,
      },
      formatEmissionsAbsoluteCompact(payload.value, currentLanguage),
    );
  },
  domain,
  padding: { top: 0, bottom: 0 },
});

// Custom tick renderer factory
export const createCustomTickRenderer =
  (baseYear?: number, isBaseYearBold: boolean = true) =>
  ({ x, y, payload }: any) => {
    const isBaseYear = payload.value === baseYear;
    return React.createElement(
      "text",
      {
        x: x - 15,
        y: y + 10,
        fontSize: 12,
        fill: `${isBaseYear ? "white" : "var(--grey)"}`,
        fontWeight: `${isBaseYear && isBaseYearBold ? "bold" : "normal"}`,
      },
      payload.value,
    );
  };

// Base year reference line styling
export const getBaseYearReferenceLineProps = (
  baseYear: number,
  isFirstYear: boolean,
  t: (key: string) => string,
) => ({
  x: baseYear,
  stroke: "var(--grey)",
  strokeDasharray: "4 4",
  label: {
    value: t("companies.emissionsHistory.baseYear"),
    position: "top" as const,
    dx: isFirstYear ? 15 : 0,
    fill: "white",
    fontSize: 12,
    fontWeight: "normal" as const,
    textAnchor: "end" as const,
  },
  ifOverflow: "extendDomain" as const,
});

// Current year reference line styling
export const getCurrentYearReferenceLineProps = (
  currentYear: number,
  t: (key: string) => string,
) => ({
  x: currentYear,
  stroke: "var(--orange-3)",
  strokeWidth: 1,
  label: {
    value: currentYear,
    position: "top" as const,
    fill: "var(--orange-3)",
    fontSize: 12,
    fontWeight: "normal" as const,
    textAnchor: "end" as const,
  },
});

// Reference line configuration types
export interface ReferenceLineConfig {
  type: "baseYear" | "currentYear";
  baseYear?: number;
  currentYear?: number;
  isFirstYear?: boolean;
}

// Unified reference line component factory
export const createReferenceLine = (
  type: "baseYear" | "currentYear",
  props: {
    baseYear?: number;
    currentYear?: number;
    isFirstYear?: boolean;
    t: (key: string) => string;
  },
) => {
  if (type === "baseYear" && props.baseYear) {
    return getBaseYearReferenceLineProps(
      props.baseYear,
      props.isFirstYear || false,
      props.t,
    );
  }

  if (type === "currentYear" && props.currentYear) {
    return getCurrentYearReferenceLineProps(props.currentYear, props.t);
  }

  return null;
};

// Utility to get all reference lines for a chart type
export const getReferenceLinesForChart = (
  chartType: "company" | "municipality",
  config: {
    baseYear?: number;
    currentYear?: number;
    isFirstYear?: boolean;
    t: (key: string) => string;
  },
) => {
  const lines: ReferenceLineConfig[] = [];

  if (chartType === "company" && config.baseYear) {
    lines.push({
      type: "baseYear",
      baseYear: config.baseYear,
      isFirstYear: config.isFirstYear,
    });
  }

  if (chartType === "municipality" && config.currentYear) {
    lines.push({
      type: "currentYear",
      currentYear: config.currentYear,
    });
  }

  return lines.map((line) => createReferenceLine(line.type, config));
};

// Utility function to get responsive height
export const getResponsiveHeight = (isMobile: boolean): string => {
  return isMobile
    ? CHART_DIMENSIONS.height.mobile
    : CHART_DIMENSIONS.height.desktop;
};

// Utility function to get dynamic height based on data view and mobile state
export const getDynamicChartHeight = (
  _dataView: string,
  isMobile: boolean,
): string => {
  // All charts use the same height - legend space is handled separately
  return isMobile ? "500px" : "500px";
};

// Utility function to get legend container height based on data view
export const getLegendContainerHeight = (
  dataView: string,
  isMobile: boolean,
): string => {
  // Categories view needs more height due to many legend items
  if (dataView === "categories") {
    return isMobile ? "180px" : "150px";
  }

  // Sectors view needs slightly more height than overview/scopes
  if (dataView === "sectors") {
    return isMobile ? "140px" : "120px";
  }

  // Default heights for overview and scopes
  return isMobile ? "120px" : "100px";
};

// Utility function to get chart margin
export const getChartMargin = () => CHART_DIMENSIONS.margin;

// Utility function to get responsive chart margin (better mobile space usage)
export const getResponsiveChartMargin = (isMobile: boolean = false) => ({
  top: 20,
  right: 0,
  left: isMobile ? -15 : -10, // Increased left margin for tilted Y-axis labels
  bottom: 0,
});

// Utility function to get line style based on type
export const getLineStyle = (type: keyof typeof LINE_STYLES) =>
  LINE_STYLES[type];

// Utility function to get color
export const getChartColor = (color: keyof typeof CHART_COLORS) =>
  CHART_COLORS[color];

// Shared chart container styling utilities
export const getChartContainerProps = (
  height: string = "100%",
  width: string = "100%",
) => ({
  height,
  width,
  className: "w-full",
});

// Line chart props
export const getLineChartProps = (
  data: any[],
  onClick?: (data: any) => void,
  margin: { top: number; right: number; left: number; bottom: number } = {
    top: 20,
    right: 0,
    left: -10,
    bottom: 0,
  },
) => ({
  data,
  margin,
  ...(onClick && { onClick }),
});

// Composed chart props
export const getComposedChartProps = (
  data: any[],
  onClick?: (data: any) => void,
  margin: { top: number; right: number; left: number; bottom: number } = {
    top: 20,
    right: 0,
    left: -10,
    bottom: 0,
  },
) => ({
  data,
  margin,
  ...(onClick && { onClick }),
});

// Unified chart props factory
export const getChartProps = (
  chartType: "line" | "composed",
  data: any[],
  onClick?: (data: any) => void,
  margin?: { top: number; right: number; left: number; bottom: number },
) => {
  if (chartType === "composed") {
    return getComposedChartProps(data, onClick, margin);
  }
  return getLineChartProps(data, onClick, margin);
};

// Re-export from utils modules
export * from "./utils/chartData";
export * from "./utils/chartTicks";
export * from "./utils/chartProps";
export * from "./utils/chartInteractions";

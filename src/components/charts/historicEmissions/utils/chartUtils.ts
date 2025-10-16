/**
 * Chart utility functions
 */

import React from "react";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";

// Type for recharts tick function - compatible with recharts 3.x
type TickProps = {
  x: number;
  y: number;
  payload: { value: number };
  index?: number;
  visibleTicksCount?: number;
};
import {
  LINE_CONFIGS,
  LINE_STYLES,
  CHART_COLORS,
  CHART_DIMENSIONS,
} from "../styles/chartStyles";

// Utility function to get consistent line props for specific line types
export const getConsistentLineProps = (
  lineType: keyof typeof LINE_CONFIGS,
  isMobile: boolean = false,
  name?: string,
  customColor?: string,
  showDots: boolean = false,
) => {
  const config = LINE_CONFIGS[lineType];
  const color = customColor || config.color;
  return {
    ...config.style,
    stroke: color,
    name,
    dot: showDots
      ? { fill: color, r: 4, strokeWidth: 0, fillOpacity: 0 }
      : false,
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
      (({ x, y, payload }: TickProps) => {
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
        ) as unknown as React.ReactElement<SVGElement>;
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
  tick: ({ x, y, payload }: TickProps) => {
    return React.createElement(
      "text",
      {
        x: x - 5, // Moved further left
        y: y + 5,
        fontSize: 12,
        fill: "var(--grey)",
        textAnchor: "end",
        transform: `rotate(-30, ${x - 5}, ${y + 5})`, // Updated transform origin
      },
      formatEmissionsAbsoluteCompact(payload.value, currentLanguage),
    ) as unknown as React.ReactElement<SVGElement>;
  },
  domain,
  padding: { top: 0, bottom: 0 },
});

// Custom tick renderer factory
export const createCustomTickRenderer =
  (baseYear?: number, isBaseYearBold: boolean = true) =>
  ({ x, y, payload, index, visibleTicksCount }: TickProps) => {
    const isBaseYear = payload.value === baseYear;
    const isLastTick =
      index !== undefined &&
      visibleTicksCount !== undefined &&
      index === visibleTicksCount - 1;

    return React.createElement(
      "text",
      {
        x: isLastTick ? x - 10 : x - 5, // More space for last tick
        y: y + 10,
        fontSize: 12,
        fill: isBaseYear ? "white" : "var(--grey)",
        fontWeight: isBaseYear && isBaseYearBold ? "bold" : "normal",
        textAnchor: isLastTick ? "end" : "start", // Right-align last tick
      },
      payload.value,
    ) as unknown as React.ReactElement<SVGElement>;
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
export const getCurrentYearReferenceLineProps = (currentYear: number) => ({
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
    return getCurrentYearReferenceLineProps(props.currentYear);
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
  left: isMobile ? -10 : -5, // Increased left margin for tilted Y-axis labels
  bottom: 0,
});

// Utility function to get line style based on type
export const getLineStyle = (type: keyof typeof LINE_STYLES) =>
  LINE_STYLES[type];

// Utility function to get color
export const getChartColor = (color: keyof typeof CHART_COLORS) =>
  CHART_COLORS[color];

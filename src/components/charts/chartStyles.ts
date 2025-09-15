/**
 * Shared chart styling constants and utilities
 */

import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";

// Common line styles
export const LINE_STYLES = {
  // Main data lines
  primary: {
    strokeWidth: 2,
    dot: false,
    connectNulls: true,
  },

  // Secondary/estimated lines
  secondary: {
    strokeWidth: 2,
    strokeDasharray: "4 4",
    dot: false,
    connectNulls: true,
  },

  // Trend lines
  trend: {
    strokeWidth: 2,
    strokeDasharray: "4 4",
    dot: false,
  },

  // Reference lines
  reference: {
    strokeWidth: 1,
    strokeDasharray: "4 4",
    dot: false,
  },
} as const;

// Common colors
export const CHART_COLORS = {
  // Main data lines
  primary: "white", // Historical/solid white
  secondary: "white", // Estimated/dashed white

  // Trend and reference lines
  trend: "var(--pink-3)", // Trend/dashed pink
  paris: "var(--green-3)", // Paris/dashed green

  // Company scope colors
  scope1: "var(--pink-3)",
  scope2: "var(--green-2)",
  scope3: "var(--blue-2)",

  // Utility colors
  grey: "var(--grey)",
} as const;

// Common chart dimensions
export const CHART_DIMENSIONS = {
  height: {
    mobile: "450px",
    desktop: "300px",
    desktopLarge: "400px",
  },
  width: "100%",
  margin: {
    left: 60,
    right: 20,
    top: 20,
    bottom: 40,
  },
} as const;

// Common axis styles
export const AXIS_STYLES = {
  stroke: "var(--grey)",
  tickLine: false,
  axisLine: false,
  fontSize: 12,
  padding: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
} as const;

// Utility function to get responsive height
export const getResponsiveHeight = (isMobile: boolean): string => {
  return isMobile
    ? CHART_DIMENSIONS.height.mobile
    : CHART_DIMENSIONS.height.desktop;
};

// Utility function to get chart margin
export const getChartMargin = () => CHART_DIMENSIONS.margin;

// Utility function to get line style based on type
export const getLineStyle = (type: keyof typeof LINE_STYLES) =>
  LINE_STYLES[type];

// Utility function to get color
export const getChartColor = (color: keyof typeof CHART_COLORS) =>
  CHART_COLORS[color];

// Utility function to get line props with hover behavior (no dots except on hover)
export const getLinePropsWithHover = (
  type: keyof typeof LINE_STYLES,
  color: string,
  isMobile: boolean = false,
  name?: string,
) => {
  const baseStyle = LINE_STYLES[type];
  return {
    ...baseStyle,
    stroke: color,
    name,
    dot: false, // No dots by default
    activeDot: isMobile ? false : { r: 6, fill: color, cursor: "pointer" }, // Show dot on hover
  };
};

// Specific line type configurations for consistent styling
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

// Shared axis styling utilities
export const getXAxisProps = (
  dataKey: string,
  domain?: [number, number],
  ticks?: number[],
  customTick?: (props: any) => React.ReactElement,
) => ({
  dataKey,
  stroke: "var(--grey)",
  tickLine: false,
  axisLine: false,
  padding: { left: 0, right: 0 },
  ...(domain && { domain }),
  ...(ticks && { ticks }),
  ...(customTick ? { tick: customTick } : { tick: { fontSize: 12 } }),
});

export const getYAxisProps = (currentLanguage: "sv" | "en") => ({
  stroke: "var(--grey)",
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12 },
  tickFormatter: (value: number) =>
    formatEmissionsAbsoluteCompact(value, currentLanguage),
  width: 40,
  domain: [0, "auto"] as [number, "auto"],
  padding: { top: 0, bottom: 0 },
});

// Shared reference line styling utilities
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
  },
  ifOverflow: "extendDomain" as const,
});

export const getCurrentYearReferenceLineProps = (
  currentYear: number,
  t: (key: string) => string,
) => ({
  x: currentYear,
  stroke: "var(--orange-3)",
  strokeWidth: 1,
  label: {
    value: t("municipalities.graph.currentYear"),
    position: "top" as const,
    fill: "white",
    fontSize: 12,
    fontWeight: "normal" as const,
  },
});

// Shared chart container styling utilities
export const getChartContainerProps = (
  height: string = "100%",
  width: string = "100%",
) => ({
  height,
  width,
  className: "w-full",
});

export const getLineChartProps = (
  data: any[],
  onClick?: (data: any) => void,
  margin: { top: number; right: number; left: number; bottom: number } = {
    top: 20,
    right: 0,
    left: 0,
    bottom: 0,
  },
) => ({
  data,
  margin,
  ...(onClick && { onClick }),
});

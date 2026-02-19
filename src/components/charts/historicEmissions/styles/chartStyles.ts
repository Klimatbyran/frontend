/**
 * Chart styling constants
 */

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
    left: -5, // Increased for tilted Y-axis labels
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
  turnover: {
    type: "primary" as const,
    color: "var(--blue-2)",
    style: LINE_STYLES.primary,
  },
  intensity: {
    type: "primary" as const,
    color: "var(--orange-2)",
    style: LINE_STYLES.primary,
  },
} as const;

// Re-export from utils modules
export * from "../utils/chartData";
export * from "../utils/chartTicks";
export * from "../utils/chartProps";
export * from "../utils/chartInteractions";
export * from "../utils/chartUtils";

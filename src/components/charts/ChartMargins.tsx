import React from "react";

/**
 * Common chart margin configurations for consistent spacing.
 * These can be used directly in chart components or as reference.
 */
export const ChartMargins = {
  // Standard margins with no extra spacing
  standard: { left: 0, right: 0, top: 0, bottom: 0 },

  // Margins with space for Y-axis labels
  withYAxis: { left: 60, right: 0, top: 0, bottom: 0 },

  // Margins with space for both axes
  withAxes: { left: 60, right: 20, top: 20, bottom: 40 },

  // Compact margins for small charts
  compact: { left: 40, right: 10, top: 10, bottom: 20 },

  // Generous margins for large charts
  generous: { left: 80, right: 40, top: 40, bottom: 60 },

  // Mobile-optimized margins
  mobile: { left: 50, right: 10, top: 10, bottom: 30 },

  // Desktop-optimized margins
  desktop: { left: 70, right: 30, top: 30, bottom: 50 },
} as const;

/**
 * Responsive margin configuration that adapts to screen size.
 * @param isMobile - Whether the current device is mobile
 * @returns Appropriate margin configuration
 */
export const getResponsiveMargins = (isMobile: boolean) => {
  return isMobile ? ChartMargins.mobile : ChartMargins.desktop;
};

/**
 * Custom margin configuration with validation.
 * @param margins - Custom margin object
 * @returns Validated margin configuration
 */
export const createCustomMargins = (margins: {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}) => {
  return {
    left: margins.left ?? 0,
    right: margins.right ?? 0,
    top: margins.top ?? 0,
    bottom: margins.bottom ?? 0,
  };
};


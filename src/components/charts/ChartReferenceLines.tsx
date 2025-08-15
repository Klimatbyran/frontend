import React from "react";
import { ReferenceLine } from "recharts";

interface ReferenceLineConfig {
  x?: number;
  y?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  label?: {
    value: string | number;
    position?: "top" | "bottom" | "left" | "right";
    fill?: string;
    fontSize?: number;
    fontWeight?: "normal" | "bold";
  };
}

interface ChartReferenceLinesProps {
  lines: ReferenceLineConfig[];
  className?: string;
}

/**
 * Shared reference lines component that provides consistent styling.
 * Supports both X and Y axis reference lines with customizable labels.
 */
export const ChartReferenceLines: React.FC<ChartReferenceLinesProps> = ({
  lines,
  className = "",
}) => {
  if (!lines || lines.length === 0) {
    return null;
  }

  return (
    <>
      {lines.map((line, index) => (
        <ReferenceLine
          key={`ref-line-${index}`}
          x={line.x}
          y={line.y}
          stroke={line.stroke || "var(--grey)"}
          strokeWidth={line.strokeWidth || 1}
          strokeDasharray={line.strokeDasharray}
          label={
            line.label
              ? {
                  value: line.label.value,
                  position: line.label.position || "top",
                  fill: line.label.fill || "var(--grey)",
                  fontSize: line.label.fontSize || 12,
                  fontWeight: line.label.fontWeight || "normal",
                }
              : undefined
          }
        />
      ))}
    </>
  );
};

// Predefined reference line configurations for common use cases
export const CommonReferenceLines = {
  // Current year reference line
  currentYear: (year: number): ReferenceLineConfig => ({
    x: year,
    stroke: "var(--orange-2)",
    strokeWidth: 1,
    label: {
      value: year,
      position: "top",
      fill: "var(--orange-2)",
      fontSize: 12,
      fontWeight: "normal",
    },
  }),

  // Base year reference line
  baseYear: (year: number): ReferenceLineConfig => ({
    x: year,
    stroke: "var(--white)",
    strokeWidth: 1,
    label: {
      value: year,
      position: "top",
      fill: "var(--white)",
      fontSize: 12,
      fontWeight: "bold",
    },
  }),

  // Zero emissions reference line
  zeroEmissions: (): ReferenceLineConfig => ({
    y: 0,
    stroke: "var(--grey)",
    strokeWidth: 1,
    strokeDasharray: "2 2",
  }),
};

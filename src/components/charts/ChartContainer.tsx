import React, { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

interface ChartContainerProps {
  children: ReactNode;
  height?: string | number;
  width?: string | number;
  className?: string;
  aspect?: number;
  minHeight?: string | number;
  maxHeight?: string | number;
}

/**
 * Enhanced chart container component that provides consistent ResponsiveContainer wrapper.
 * Offers more configuration options than the basic BaseChartContainer.
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  height = "100%",
  width = "100%",
  className = "",
  aspect,
  minHeight,
  maxHeight,
}) => {
  const containerStyle: React.CSSProperties = {
    width,
    height,
    ...(minHeight && { minHeight }),
    ...(maxHeight && { maxHeight }),
  };

  return (
    <div className={className} style={containerStyle}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

import { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

interface BaseChartContainerProps {
  children: ReactNode;
  height?: "100%" | "90%";
  className?: string;
  margin?: { top: number; right: number; left: number; bottom: number };
}

/**
 * Shared chart container component that provides consistent ResponsiveContainer wrapper.
 * Preserves exact styling and behavior from both companies and municipalities systems.
 */
export function BaseChartContainer({
  children,
  height = "100%",
  className = "w-full",
  margin,
}: BaseChartContainerProps) {
  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      {children}
    </ResponsiveContainer>
  );
}

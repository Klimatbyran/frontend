import { Legend } from "recharts";

interface ChartLegendProps {
  verticalAlign?: "top" | "bottom";
  align?: "left" | "right" | "center";
  height?: number;
  iconType?: "line" | "rect" | "circle";
  wrapperStyle?: React.CSSProperties;
  formatter?: (value: string, entry: any, index: number) => React.ReactNode;
  onClick?: (data: any) => void;
}

/**
 * Shared legend component that provides consistent legend styling and behavior.
 * Preserves exact styling and behavior from both companies and municipalities systems.
 */
export function ChartLegend({
  verticalAlign = "bottom",
  align = "right",
  height = 36,
  iconType = "line",
  wrapperStyle = { fontSize: "12px", color: "var(--grey)" },
  formatter,
  onClick,
}: ChartLegendProps) {
  return (
    <Legend
      verticalAlign={verticalAlign}
      align={align}
      height={height}
      iconType={iconType}
      wrapperStyle={wrapperStyle}
      formatter={formatter}
      onClick={onClick}
    />
  );
}

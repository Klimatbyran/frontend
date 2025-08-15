import { XAxis, YAxis } from "recharts";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";

interface BaseAxisProps {
  stroke?: string;
  tickLine?: boolean | { stroke: string };
  axisLine?: boolean | { stroke: string };
  tick?: any;
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
}

interface XAxisProps extends BaseAxisProps {
  dataKey: string;
  type?: "number" | "category";
  domain?: [number, number] | [string, string];
  ticks?: number[] | string[];
  allowDuplicatedCategory?: boolean;
  tickFormatter?: (value: any) => string;
  customTickRenderer?: (props: {
    x: number;
    y: number;
    payload: any;
  }) => React.ReactNode;
}

interface YAxisProps extends BaseAxisProps {
  width?: number;
  domain?: [number, number] | [string, string];
  tickFormatter?: (value: number) => string;
  currentLanguage?: "sv" | "en";
}

/**
 * Shared XAxis component that provides consistent X-axis styling and behavior.
 * Supports custom tick rendering for special cases like base year highlighting.
 */
export function ChartXAxis({
  dataKey,
  type = "number",
  domain,
  ticks,
  allowDuplicatedCategory,
  tickFormatter,
  customTickRenderer,
  stroke = "var(--grey)",
  tickLine = false,
  axisLine = false,
  tick = { fontSize: 12 },
  padding = { left: 0, right: 0 },
}: XAxisProps) {
  return (
    <XAxis
      dataKey={dataKey}
      type={type}
      domain={domain}
      ticks={ticks}
      allowDuplicatedCategory={allowDuplicatedCategory}
      tickFormatter={tickFormatter}
      stroke={stroke}
      tickLine={tickLine}
      axisLine={axisLine}
      tick={customTickRenderer || tick}
      padding={padding}
    />
  );
}

/**
 * Shared YAxis component that provides consistent Y-axis styling and behavior.
 * Automatically handles emissions formatting when currentLanguage is provided.
 */
export function ChartYAxis({
  width = 60,
  domain = [0, "auto"],
  tickFormatter,
  currentLanguage,
  stroke = "var(--grey)",
  tickLine = false,
  axisLine = false,
  tick = { fontSize: 12 },
  padding = { top: 0, bottom: 0 },
}: YAxisProps) {
  // Use provided tickFormatter or default to emissions formatting
  const finalTickFormatter =
    tickFormatter ||
    (currentLanguage
      ? (value: number) =>
          formatEmissionsAbsoluteCompact(value, currentLanguage)
      : undefined);

  return (
    <YAxis
      width={width}
      domain={domain}
      tickFormatter={finalTickFormatter}
      stroke={stroke}
      tickLine={tickLine}
      axisLine={axisLine}
      tick={tick}
      padding={padding}
    />
  );
}

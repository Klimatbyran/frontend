import React from "react";
import {
  InsightBar,
  InsightSegment,
} from "@/hooks/companies/useSectorChartInsights";

interface InsightBarChartProps {
  bars: InsightBar[];
  showValues?: boolean;
}

export const InsightBarChart: React.FC<InsightBarChartProps> = ({
  bars,
  showValues = true,
}) => {
  if (bars.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      {bars.map((bar) => (
        <div key={bar.label} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-white truncate">{bar.label}</span>
            {showValues && (
              <span className="text-grey shrink-0">{bar.valueLabel}</span>
            )}
          </div>
          <div className="h-2 rounded-full bg-black-1 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(bar.share * 100, 2)}%`,
                backgroundColor: bar.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

interface InsightStackedBarProps {
  segments: InsightSegment[];
}

export const InsightStackedBar: React.FC<InsightStackedBarProps> = ({
  segments,
}) => {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);

  if (total === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex h-2.5 rounded-full overflow-hidden bg-black-1">
        {segments.map((segment) => {
          if (segment.count === 0) {
            return null;
          }

          return (
            <div
              key={segment.label}
              className="h-full"
              style={{
                width: `${(segment.count / total) * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center gap-1.5 text-xs text-grey"
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span>
              {segment.label}{" "}
              <span className="text-white">
                {segment.displayValue ?? segment.count}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

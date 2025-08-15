import React from "react";
import { TooltipProps } from "recharts";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";

interface ChartTooltipProps extends TooltipProps<any, any> {
  dataView?: "overview" | "sectors" | "scopes" | "categories";
  showEmissionsUnit?: boolean;
  customFormatter?: (value: any, name: string) => string;
  className?: string;
}

/**
 * Shared chart tooltip component that provides consistent styling.
 * Supports both emissions formatting and custom formatting.
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  dataView = "overview",
  showEmissionsUnit = true,
  customFormatter,
  className = "",
}) => {
  const { currentLanguage } = useLanguage();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formatValue = (value: any, name: string) => {
    if (customFormatter) {
      return customFormatter(value, name);
    }

    if (typeof value === "number") {
      const formatted = formatEmissionsAbsoluteCompact(value, currentLanguage);
      return showEmissionsUnit ? formatted : value.toLocaleString();
    }

    return value;
  };

  return (
    <div
      className={`bg-black-2 border border-black-1 rounded-lg p-3 shadow-lg ${className}`}
    >
      <div className="text-sm font-medium text-white mb-2">{label}</div>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => {
          if (!entry.value && entry.value !== 0) return null;

          return (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: entry.color || "var(--grey)" }}
                />
                <span className="text-grey">{entry.name || entry.dataKey}</span>
              </div>
              <span className="text-white font-medium">
                {formatValue(entry.value, entry.name || entry.dataKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

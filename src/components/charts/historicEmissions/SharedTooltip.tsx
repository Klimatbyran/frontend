import React from "react";
import { TooltipProps } from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { AiIcon } from "@/components/ui/ai-icon";

interface SharedTooltipProps extends TooltipProps<number, string> {
  // Common props
  unit?: string;
  showUnit?: boolean;

  // Company-specific props
  companyBaseYear?: number;
  filterDuplicateValues?: boolean;
  trendData?: {
    slope: number;
    baseYear: number;
    lastReportedYear: number;
  };

  // Municipality-specific props
  dataView?: "overview" | "sectors";
  hiddenSectors?: Set<string>;

  // Custom formatting
  customFormatter?: (value: number, name: string, entry: any) => string;
  customNameFormatter?: (name: string, entry: any) => string;

  // AI data indicators
  showAIIndicators?: boolean;
}

export const SharedTooltip: React.FC<SharedTooltipProps> = ({
  active,
  payload,
  label,
  unit,
  showUnit = true,
  companyBaseYear,
  filterDuplicateValues = false,
  trendData,
  dataView,
  hiddenSectors = new Set(),
  customFormatter,
  customNameFormatter,
  showAIIndicators = true,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Determine if this is base year
  const isBaseYear = companyBaseYear === payload[0]?.payload?.year;

  // Filter payload based on context
  let filteredPayload = payload;

  if (filterDuplicateValues) {
    const seenValues = new Set();
    filteredPayload = payload.filter((entry) => {
      const valueKey = `${entry.value}_${entry.payload.year}`;
      if (seenValues.has(valueKey)) {
        return false;
      }
      seenValues.add(valueKey);
      return true;
    });
  }

  // For municipality sectors view, filter hidden sectors
  if (dataView === "sectors" && hiddenSectors.size > 0) {
    filteredPayload = payload.filter(
      (entry) => !hiddenSectors.has(entry.dataKey as string),
    );
  }

  // For municipality overview, handle approximated data logic
  if (dataView === "overview") {
    const hasActual = payload.some(
      (entry) => entry.dataKey === "total" && entry.value != null,
    );

    if (hasActual) {
      filteredPayload = payload.filter(
        (entry) => entry.dataKey !== "approximated",
      );
    }

    const isApproximated = filteredPayload.some(
      (entry) => entry.dataKey === "approximated" && entry.value != null,
    );

    if (isApproximated) {
      filteredPayload = filteredPayload.filter(
        (entry) => entry.dataKey === "approximated",
      );
    }
  }

  // Default formatters
  const defaultFormatter = (value: number) =>
    formatEmissionsAbsolute(Math.round(value ?? 0), currentLanguage);

  const defaultNameFormatter = (name: string, entry: any) => {
    // Handle company category names
    if (entry.dataKey?.startsWith("cat")) {
      const categoryId = parseInt(entry.dataKey.replace("cat", ""));
      return `${categoryId.toLocaleString()}. ${name}`;
    }
    return name;
  };

  const formatValue = customFormatter || defaultFormatter;
  const formatName = customNameFormatter || defaultNameFormatter;

  return (
    <div
      className={cn(
        isMobile ? "max-w-[280px]" : "max-w-[400px]",
        "bg-black-1 px-4 py-3 rounded-level-2",
        "grid grid-cols-[1fr_auto] text-xs",
      )}
    >
      {/* Header */}
      <div className="text-sm font-medium mb-2 grid grid-cols-subgrid col-span-2">
        <span>
          {label}
          {isBaseYear ? "*" : ""}
        </span>
        {showUnit && (
          <span className="flex justify-end mr-1">
            {unit || t("emissionsUnit")}
          </span>
        )}
      </div>

      {/* Data rows */}
      {filteredPayload.map((entry) => {
        if (entry.dataKey === "gap") {
          return null;
        }

        const name = formatName(
          String(entry.name || entry.dataKey || ""),
          entry,
        );
        const value = formatValue(
          entry.value as number,
          String(entry.name || entry.dataKey || ""),
          entry,
        );
        // Check if this data point is AI-generated
        const isDataAI =
          showAIIndicators &&
          (entry.payload?.isAIGenerated ||
            entry.payload?.scope1?.isAIGenerated ||
            entry.payload?.scope2?.isAIGenerated ||
            entry.payload?.scope3?.isAIGenerated ||
            entry.payload?.scope3Categories?.some(
              (cat: any) => cat.isAIGenerated,
            ) ||
            false);

        return (
          <div
            key={entry.dataKey}
            className={cn(
              `${entry.dataKey === "total" ? "my-2 font-medium" : "my-0"}`,
              "grid grid-cols-subgrid col-span-2 w-full",
              "even:bg-black-1 odd:bg-black-2/20 px-1 py-0.5",
            )}
          >
            <div className="text-grey mr-2">{name}</div>
            <div
              className="flex pl-2 gap-1 justify-end"
              style={{ color: entry.color }}
            >
              {value}
              {isDataAI && (
                <span className="ml-2">
                  <AiIcon size="sm" />
                </span>
              )}
            </div>
          </div>
        );
      })}

      {isBaseYear && (
        <span className="text-grey mr-2 text-xs col-span-2">
          <br />* {t("companies.emissionsHistory.baseYearInfo")}
        </span>
      )}

      {trendData &&
        payload?.some(
          (entry) => entry.dataKey === "approximated" && entry.value != null,
        ) && (
          <span className="text-grey mr-2 text-xs col-span-2 mt-2">
            <br />
            {t("companies.emissionsHistory.trendInfo", {
              percentage: Math.abs(trendData.slope).toFixed(1),
              baseYear: trendData.baseYear,
              lastYear: trendData.lastReportedYear,
            })}
            <br />
            <span
              className={cn(
                trendData.slope >= 0 ? "text-pink-3" : "text-green-3",
              )}
            >
              Trend: {trendData.slope >= 0 ? "↗ Increasing" : "↘ Decreasing"}
            </span>
          </span>
        )}

      {/* Municipality approximated value info */}
      {dataView === "overview" &&
        filteredPayload.some(
          (entry) => entry.dataKey === "approximated" && entry.value != null,
        ) && (
          <div className="text-xs text-blue-2 mt-2">
            {t("municipalities.graph.estimatedValue")}
          </div>
        )}
    </div>
  );
};

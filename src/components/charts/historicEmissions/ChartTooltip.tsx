import React from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { AiIcon } from "@/components/ui/ai-icon";
import type { Scope3Category } from "@/types/company";

interface PayloadEntry {
  dataKey?: string;
  value?: number | null;
  name?: string;
  color?: string;
  payload?: {
    year?: number;
    isAIGenerated?: boolean;
    scope1?: { isAIGenerated?: boolean };
    scope2?: { isAIGenerated?: boolean };
    scope3?: { isAIGenerated?: boolean };
    scope3Categories?: Array<Scope3Category & { isAIGenerated?: boolean }>;
  };
}
interface ChartTooltipProps {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
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
  customFormatter?: (
    value: number,
    name: string,
    entry: PayloadEntry,
  ) => string;
  customNameFormatter?: (name: string, entry: PayloadEntry) => string;

  // AI data indicators
  showAIIndicators?: boolean;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
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

  // First, filter out zero, undefined, or null values, but keep trend and Paris data
  filteredPayload = payload.filter((entry) => {
    // Keep trend and Paris data even if zero
    if (entry.dataKey === "approximated" || entry.dataKey === "carbonLaw") {
      return entry.value != null;
    }

    showUnit = false;
    // For other data, only show if not null and > 0
    return entry.value != null && entry.value > 0;
  });

  if (filterDuplicateValues) {
    const seenValues = new Set<string>();
    filteredPayload = filteredPayload.filter((entry) => {
      const valueKey = `${entry.value}_${entry.payload?.year ?? ""}`;
      if (seenValues.has(valueKey)) {
        return false;
      }
      seenValues.add(valueKey);
      return true;
    });
  }

  // For municipality sectors view, filter hidden sectors
  if (dataView === "sectors" && hiddenSectors.size > 0) {
    filteredPayload = filteredPayload.filter(
      (entry) => !hiddenSectors.has(entry.dataKey as string),
    );
  }

  // For municipality overview, handle approximated data logic
  if (dataView === "overview") {
    const hasActual = filteredPayload.some(
      (entry) => entry.dataKey === "total" && entry.value != null,
    );

    if (hasActual) {
      filteredPayload = filteredPayload.filter(
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

  const defaultNameFormatter = (name: string, entry: PayloadEntry) => {
    const dataKey = typeof entry.dataKey === "string" ? entry.dataKey : null;

    // Handle company category names
    if (dataKey?.startsWith("cat")) {
      const categoryId = parseInt(dataKey.replace("cat", ""));
      return `${categoryId.toLocaleString()}. ${name}`;
    }
    if (dataKey === "turnover") {
      return t("companies.overview.turnover");
    }
    return name;
  };

  const formatValue = customFormatter || defaultFormatter;
  const formatName = customNameFormatter || defaultNameFormatter;

  const dataRows = filteredPayload.map((entry) => {
    if (entry.dataKey === "gap") {
      return null;
    }

    const name = formatName(String(entry.name || entry.dataKey || ""), entry);
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
          (cat: Scope3Category & { isAIGenerated?: boolean }) =>
            cat.isAIGenerated,
        ) ||
        false);

    return (
      <div
        key={entry.dataKey}
        className={cn(
          `${entry.dataKey === "total" ? "my-2 font-medium" : "my-0"}`,
          "grid grid-cols-subgrid col-span-2 w-full",
          "even:bg-black-1 odd:bg-black-2/20 py-0.5",
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
  });

  return (
    <div
      className={cn(
        isMobile ? "max-w-[280px]" : "max-w-[400px]",
        "bg-black-1 px-4 py-3 rounded-level-2",
        "grid grid-cols-[1fr_auto] text-xs",
        "z-[60] relative",
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
      {dataRows.length === 0 && (
        <div className="text-grey mr-2 text-xs col-span-2">
          {t("charts.tooltip.noData")}
        </div>
      )}
      {dataRows}

      {isBaseYear && (
        <span className="text-grey mr-2 text-xs col-span-2">
          <br />* {t("companies.emissionsHistory.baseYearInfo")}
        </span>
      )}

      {trendData &&
        payload?.some(
          (entry) =>
            entry.dataKey === "approximated" &&
            entry.value != null &&
            entry.value > 0,
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
          (entry) =>
            entry.dataKey === "approximated" &&
            entry.value != null &&
            entry.value > 0,
        ) && (
          <div className="text-xs text-blue-2 mt-2">
            {t("municipalities.graph.estimatedValue")}
          </div>
        )}
    </div>
  );
};

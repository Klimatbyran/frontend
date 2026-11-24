import React from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { ChartTooltipContainer } from "@/components/charts/ChartTooltipContainer";
import { ChartTooltipList } from "@/components/charts/ChartTooltipList";
import { cn } from "@/lib/utils";
import type { Scope3Category } from "@/types/company";

export interface ChartTooltipEntry {
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
    turnover?: number;
    turnoverCurrency?: string;
    turnoverIsAIGenerated?: boolean;
  };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
  unit?: string;
  showUnit?: boolean;
  companyBaseYear?: number;
  filterDuplicateValues?: boolean;
  trendData?: {
    slope: number;
    baseYear: number;
    lastReportedYear: number;
  };
  dataView?: "overview" | "sectors";
  hiddenSectors?: Set<string>;
  customValueFormatter?: (entry: ChartTooltipEntry) => string;
  customNameFormatter?: (entry: ChartTooltipEntry) => string;
  showAIIndicators?: boolean;
}

function hasAIGeneratedScope3(
  categories?: Array<Scope3Category & { isAIGenerated?: boolean }>,
): boolean {
  return categories?.some((cat) => cat.isAIGenerated) ?? false;
}

function isAIGeneratedEntry(
  entry: ChartTooltipEntry,
  showAIIndicators: boolean,
): boolean {
  if (!showAIIndicators) return false;
  if (entry.dataKey === "turnover") {
    return entry.payload?.turnoverIsAIGenerated ?? false;
  }
  const payload = entry.payload;
  if (!payload) return false;
  if (payload.isAIGenerated) return true;
  if (payload.scope1?.isAIGenerated) return true;
  if (payload.scope2?.isAIGenerated) return true;
  if (payload.scope3?.isAIGenerated) return true;
  return hasAIGeneratedScope3(payload.scope3Categories);
}

function filterOverviewPayload(
  payload: ChartTooltipEntry[],
): ChartTooltipEntry[] {
  const hasActual = payload.some(
    (entry) => entry.dataKey === "total" && entry.value != null,
  );
  let filtered = payload;
  if (hasActual) {
    filtered = filtered.filter((entry) => entry.dataKey !== "approximated");
  }
  const isApproximated = filtered.some(
    (entry) => entry.dataKey === "approximated" && entry.value != null,
  );
  if (isApproximated) {
    filtered = filtered.filter((entry) => entry.dataKey === "approximated");
  }
  return filtered;
}

function filterTooltipPayload(
  payload: ChartTooltipEntry[],
  options: {
    filterDuplicateValues: boolean;
    dataView?: "overview" | "sectors";
    hiddenSectors: Set<string>;
  },
): { filteredPayload: ChartTooltipEntry[]; showUnit: boolean } {
  let showUnit = true;
  let filteredPayload = payload.filter((entry) => {
    if (entry.dataKey === "approximated" || entry.dataKey === "carbonLaw") {
      return entry.value != null;
    }
    showUnit = false;
    return entry.value != null && entry.value > 0;
  });

  if (options.filterDuplicateValues) {
    const seenValues = new Set<string>();
    filteredPayload = filteredPayload.filter((entry) => {
      const valueKey = `${entry.value}_${entry.payload?.year ?? ""}`;
      if (seenValues.has(valueKey)) return false;
      seenValues.add(valueKey);
      return true;
    });
  }

  if (options.dataView === "sectors" && options.hiddenSectors.size > 0) {
    filteredPayload = filteredPayload.filter(
      (entry) => !options.hiddenSectors.has(entry.dataKey as string),
    );
  }

  if (options.dataView === "overview") {
    filteredPayload = filterOverviewPayload(filteredPayload);
  }

  return { filteredPayload, showUnit };
}

function TrendInfo({
  trendData,
  payload,
  t,
}: {
  trendData: NonNullable<ChartTooltipProps["trendData"]>;
  payload: ChartTooltipEntry[];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const hasApproximated = payload.some(
    (entry) =>
      entry.dataKey === "approximated" &&
      entry.value != null &&
      entry.value > 0,
  );
  if (!hasApproximated) return null;

  return (
    <span className="text-grey mr-2 text-xs col-span-2 mt-2">
      <br />
      {t("companies.emissionsHistory.trendInfo", {
        percentage: Math.abs(trendData.slope).toFixed(1),
        baseYear: trendData.baseYear,
        lastYear: trendData.lastReportedYear,
      })}
      <br />
      <span
        className={cn(trendData.slope >= 0 ? "text-pink-3" : "text-blue-3")}
      >
        Trend: {trendData.slope >= 0 ? "↗ Increasing" : "↘ Decreasing"}
      </span>
    </span>
  );
}

function ApproximatedValueInfo({
  dataView,
  filteredPayload,
  t,
}: {
  dataView?: "overview" | "sectors";
  filteredPayload: ChartTooltipEntry[];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const hasApproximated = filteredPayload.some(
    (entry) =>
      entry.dataKey === "approximated" &&
      entry.value != null &&
      entry.value > 0,
  );
  if (dataView !== "overview" || !hasApproximated) return null;

  return (
    <div className="text-xs text-blue-2 mt-2">
      {t("municipalities.graph.estimatedValue")}
    </div>
  );
}

function BaseYearFootnote({
  isBaseYear,
  t,
}: {
  isBaseYear: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (!isBaseYear) return null;
  return (
    <span className="text-grey mr-2 text-xs col-span-2">
      <br />* {t("companies.emissionsHistory.baseYearInfo")}
    </span>
  );
}

export const ChartTooltip: React.FC<ChartTooltipProps> = (props) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!props.active || !props.payload || props.payload.length === 0) {
    return null;
  }

  const isBaseYear = props.companyBaseYear === props.payload[0]?.payload?.year;
  const { filteredPayload, showUnit: filteredShowUnit } = filterTooltipPayload(
    props.payload,
    {
      filterDuplicateValues: props.filterDuplicateValues ?? false,
      dataView: props.dataView,
      hiddenSectors: props.hiddenSectors ?? new Set(),
    },
  );

  const defaultValueFormatter = (entry: ChartTooltipEntry) =>
    formatEmissionsAbsolute(Math.round(entry.value ?? 0), currentLanguage);

  const entries = filteredPayload
    .filter((entry) => entry.dataKey !== "gap" && entry.dataKey !== "parisBase")
    .map((entry) => ({
      ...entry,
      isAIGenerated: isAIGeneratedEntry(entry, true),
    }));

  return (
    <ChartTooltipContainer>
      <ChartTooltipList
        entries={entries}
        formatName={props.customNameFormatter}
        formatValue={props.customValueFormatter ?? defaultValueFormatter}
        showAIIndicators={props.showAIIndicators ?? true}
        label={`${props.label} ${isBaseYear ? "*" : ""}`}
        unit={props.unit}
        showUnit={(props.showUnit ?? true) && filteredShowUnit}
      />
      <BaseYearFootnote isBaseYear={isBaseYear} t={t} />
      {props.trendData && (
        <TrendInfo trendData={props.trendData} payload={props.payload} t={t} />
      )}
      <ApproximatedValueInfo
        dataView={props.dataView}
        filteredPayload={filteredPayload}
        t={t}
      />
    </ChartTooltipContainer>
  );
};

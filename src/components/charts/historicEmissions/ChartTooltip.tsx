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
  customFormatter?: (
    value: number,
    name: string,
    entry: PayloadEntry,
  ) => string;
  customNameFormatter?: (name: string, entry: PayloadEntry) => string;
  showAIIndicators?: boolean;
}

function hasAIGeneratedScope3(
  categories?: Array<Scope3Category & { isAIGenerated?: boolean }>,
): boolean {
  return categories?.some((cat) => cat.isAIGenerated) ?? false;
}

function isAIGeneratedEntry(
  entry: PayloadEntry,
  showAIIndicators: boolean,
): boolean {
  if (!showAIIndicators) return false;
  const payload = entry.payload;
  if (!payload) return false;
  if (payload.isAIGenerated) return true;
  if (payload.scope1?.isAIGenerated) return true;
  if (payload.scope2?.isAIGenerated) return true;
  if (payload.scope3?.isAIGenerated) return true;
  return hasAIGeneratedScope3(payload.scope3Categories);
}

function filterOverviewPayload(payload: PayloadEntry[]): PayloadEntry[] {
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
  payload: PayloadEntry[],
  options: {
    filterDuplicateValues: boolean;
    dataView?: "overview" | "sectors";
    hiddenSectors: Set<string>;
  },
): { filteredPayload: PayloadEntry[]; showUnit: boolean } {
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

function TooltipDataRow({
  entry,
  formatName,
  formatValue,
  showAIIndicators,
}: {
  entry: PayloadEntry;
  formatName: (name: string, entry: PayloadEntry) => string;
  formatValue: (value: number, name: string, entry: PayloadEntry) => string;
  showAIIndicators: boolean;
}) {
  if (entry.dataKey === "gap") return null;

  const name = formatName(String(entry.name || entry.dataKey || ""), entry);
  const value = formatValue(
    entry.value as number,
    String(entry.name || entry.dataKey || ""),
    entry,
  );
  const isDataAI = isAIGeneratedEntry(entry, showAIIndicators);

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
}

function TrendInfo({
  trendData,
  payload,
  t,
}: {
  trendData: NonNullable<ChartTooltipProps["trendData"]>;
  payload: PayloadEntry[];
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
        className={cn(
          trendData.slope >= 0 ? "text-pink-3" : "text-green-3",
        )}
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
  filteredPayload: PayloadEntry[];
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

function TooltipHeader({
  label,
  isBaseYear,
  showUnit,
  unit,
  t,
}: {
  label?: string;
  isBaseYear: boolean;
  showUnit: boolean;
  unit?: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
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

function ChartTooltipBody({
  label,
  unit,
  showUnit,
  isBaseYear,
  filteredPayload,
  payload,
  trendData,
  dataView,
  formatName,
  formatValue,
  showAIIndicators,
  isMobile,
  t,
}: {
  label?: string;
  unit?: string;
  showUnit: boolean;
  isBaseYear: boolean;
  filteredPayload: PayloadEntry[];
  payload: PayloadEntry[];
  trendData?: ChartTooltipProps["trendData"];
  dataView?: "overview" | "sectors";
  formatName: (name: string, entry: PayloadEntry) => string;
  formatValue: (value: number, name: string, entry: PayloadEntry) => string;
  showAIIndicators: boolean;
  isMobile: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const dataRows = filteredPayload.map((entry) => (
    <TooltipDataRow
      key={entry.dataKey}
      entry={entry}
      formatName={formatName}
      formatValue={formatValue}
      showAIIndicators={showAIIndicators}
    />
  ));

  return (
    <div
      className={cn(
        isMobile ? "max-w-[280px]" : "max-w-[400px]",
        "bg-black-1 px-4 py-3 rounded-level-2",
        "grid grid-cols-[1fr_auto] text-xs",
        "z-[60] relative",
      )}
    >
      <TooltipHeader
        label={label}
        isBaseYear={isBaseYear}
        showUnit={showUnit}
        unit={unit}
        t={t}
      />
      {dataRows.length === 0 && (
        <div className="text-grey mr-2 text-xs col-span-2">
          {t("charts.tooltip.noData")}
        </div>
      )}
      {dataRows}
      <BaseYearFootnote isBaseYear={isBaseYear} t={t} />
      {trendData && (
        <TrendInfo trendData={trendData} payload={payload} t={t} />
      )}
      <ApproximatedValueInfo
        dataView={dataView}
        filteredPayload={filteredPayload}
        t={t}
      />
    </div>
  );
}

export const ChartTooltip: React.FC<ChartTooltipProps> = (props) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

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

  const defaultFormatter = (value: number) =>
    formatEmissionsAbsolute(Math.round(value ?? 0), currentLanguage);
  const defaultNameFormatter = (name: string, entry: PayloadEntry) => {
    if (entry.dataKey?.startsWith("cat")) {
      const categoryId = parseInt(entry.dataKey.replace("cat", ""));
      return `${categoryId.toLocaleString()}. ${name}`;
    }
    return name;
  };

  return (
    <ChartTooltipBody
      label={props.label}
      unit={props.unit}
      showUnit={(props.showUnit ?? true) && filteredShowUnit}
      isBaseYear={isBaseYear}
      filteredPayload={filteredPayload}
      payload={props.payload}
      trendData={props.trendData}
      dataView={props.dataView}
      formatName={props.customNameFormatter || defaultNameFormatter}
      formatValue={props.customFormatter || defaultFormatter}
      showAIIndicators={props.showAIIndicators ?? true}
      isMobile={isMobile}
      t={t}
    />
  );
};

import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";
import { ScopeData } from "@/hooks/companies/useScopeData";

interface ScopeBreakdownChartProps {
  scopeData: ScopeData;
  totalEmissions: number;
  onScopeSelect: (
    scope: "scope1" | "scope2" | "scope3_upstream" | "scope3_downstream",
  ) => void;
}

const SCOPE_SEGMENTS = [
  {
    key: "scope1" as const,
    dataKey: "scope1" as const,
    color: "var(--orange-3)",
    labelKey: "scope1",
  },
  {
    key: "scope2" as const,
    dataKey: "scope2" as const,
    color: "var(--pink-3)",
    labelKey: "scope2",
  },
  {
    key: "scope3_upstream" as const,
    dataKey: "scope3_upstream" as const,
    color: "var(--blue-3)",
    labelKey: "scope3Upstream",
  },
  {
    key: "scope3_downstream" as const,
    dataKey: "scope3_downstream" as const,
    color: "var(--green-3)",
    labelKey: "scope3Downstream",
  },
];

function getScopeValue(
  scopeData: ScopeData,
  dataKey: (typeof SCOPE_SEGMENTS)[number]["dataKey"],
): number {
  if (dataKey === "scope1") return scopeData.scope1.total;
  if (dataKey === "scope2") return scopeData.scope2.total;
  if (dataKey === "scope3_upstream") return scopeData.scope3.upstream.total;
  return scopeData.scope3.downstream.total;
}

export function ScopeBreakdownChart({
  scopeData,
  totalEmissions,
  onScopeSelect,
}: ScopeBreakdownChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (totalEmissions <= 0) {
    return (
      <div className="flex items-center justify-center h-24 text-grey text-sm">
        {t("companyDetailPage.sectorGraphs.noDataAvailablePieChart")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex h-10 rounded-lg overflow-hidden">
        {SCOPE_SEGMENTS.map((segment) => {
          const value = getScopeValue(scopeData, segment.dataKey);
          const percent = value / totalEmissions;
          if (percent <= 0) return null;

          return (
            <button
              key={segment.key}
              type="button"
              onClick={() => onScopeSelect(segment.key)}
              className="h-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              style={{
                width: `${percent * 100}%`,
                backgroundColor: segment.color,
                minWidth: percent > 0 ? "2rem" : 0,
              }}
              title={t(`companyDetailPage.sectorGraphs.${segment.labelKey}`)}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SCOPE_SEGMENTS.map((segment) => {
          const value = getScopeValue(scopeData, segment.dataKey);
          const percent = totalEmissions > 0 ? value / totalEmissions : 0;

          return (
            <button
              key={segment.key}
              type="button"
              onClick={() => onScopeSelect(segment.key)}
              className="bg-black-1 rounded-lg p-3 text-left hover:bg-black-1/80 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-xs text-grey truncate">
                  {t(`companyDetailPage.sectorGraphs.${segment.labelKey}`)}
                </span>
              </div>
              <div className="text-lg font-light text-white">
                {formatPercent(percent, currentLanguage)}
              </div>
              <div className="text-xs text-grey mt-0.5">
                {formatEmissionsAbsolute(Math.round(value), currentLanguage)}{" "}
                {t("emissionsUnit")}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

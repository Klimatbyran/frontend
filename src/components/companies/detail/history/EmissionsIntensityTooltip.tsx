import React from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { AiIcon } from "@/components/ui/ai-icon";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";
import { formatTurnoverChartValue } from "@/utils/formatting/turnoverFormatting";
import type { EmissionsIntensityDataPoint } from "@/types/emissionsIntensity";

interface PayloadEntry {
  dataKey?: string;
  value?: number | null;
  name?: string;
  color?: string;
  payload?: EmissionsIntensityDataPoint;
}

interface EmissionsIntensityTooltipProps {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
  dataView: "intensity" | "growth";
}

export const EmissionsIntensityTooltip: React.FC<
  EmissionsIntensityTooltipProps
> = ({ active, payload, label, dataView }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) return null;

  const rows =
    dataView === "intensity"
      ? [
          {
            label: t("companies.emissionsIntensity.intensity"),
            value: point.intensity
              ? `${localizeUnit(point.intensity, currentLanguage)} ${t(
                  "companies.emissionsIntensity.unitShort",
                  { currency: point.turnoverCurrency ?? "" },
                )}`
              : t("companies.overview.notReported"),
            highlight: true,
          },
          {
            label: t("companies.emissionsHistory.totalEmissions"),
            value: point.total
              ? `${formatEmissionsAbsolute(point.total, currentLanguage)} ${t(
                  "companies.tooltip.tonsCO2e",
                )}`
              : t("companies.overview.notReported"),
            showAi: point.emissionsIsAIGenerated,
          },
          {
            label: t("companies.overview.turnover"),
            value: point.turnover
              ? formatTurnoverChartValue(
                  point.turnover,
                  point.turnoverCurrency,
                  currentLanguage,
                  t,
                )
              : t("companies.overview.notReported"),
            showAi: point.turnoverIsAIGenerated,
          },
          ...(point.intensityChangeFromPreviousYear != null
            ? [
                {
                  label: t(
                    "companies.emissionsIntensity.chartTooltip.changeFromPreviousYear",
                  ),
                  value: formatPercentChange(
                    point.intensityChangeFromPreviousYear,
                    currentLanguage,
                  ),
                  highlight:
                    point.intensityChangeFromPreviousYear < 0
                      ? "positive"
                      : point.intensityChangeFromPreviousYear > 0
                        ? "negative"
                        : undefined,
                },
              ]
            : []),
          ...(point.intensityChangeFromFirstYear != null
            ? [
                {
                  label: t(
                    "companies.emissionsIntensity.chartTooltip.changeFromFirstYear",
                  ),
                  value: formatPercentChange(
                    point.intensityChangeFromFirstYear,
                    currentLanguage,
                  ),
                  highlight:
                    point.intensityChangeFromFirstYear < 0
                      ? "positive"
                      : point.intensityChangeFromFirstYear > 0
                        ? "negative"
                        : undefined,
                },
              ]
            : []),
        ]
      : payload
          .filter((entry) => entry.value != null)
          .map((entry) => ({
            label: String(entry.name ?? entry.dataKey),
            value:
              entry.value != null
                ? localizeUnit(entry.value, currentLanguage)
                : t("companies.overview.notReported"),
            color: entry.color,
          }));

  return (
    <div
      className={cn(
        isMobile ? "max-w-[280px]" : "max-w-[360px]",
        "bg-black-1 px-4 py-3 rounded-level-2 text-xs z-[60] relative",
      )}
    >
      <div className="text-sm font-medium mb-3">{label}</div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn(
              "flex items-start justify-between gap-4",
              row.highlight === true && "font-medium",
            )}
          >
            <span className="text-grey">{row.label}</span>
            <span
              className={cn(
                "flex items-center gap-1 text-right",
                row.highlight === "positive" && "text-green-3",
                row.highlight === "negative" && "text-pink-3",
              )}
              style={row.color ? { color: row.color } : undefined}
            >
              {row.value}
              {"showAi" in row && row.showAi ? <AiIcon size="sm" /> : null}
            </span>
          </div>
        ))}
      </div>
      {dataView === "intensity" && (
        <p className="mt-3 text-xs text-blue-2">
          {t("companies.emissionsIntensity.chartTooltip.lowerIsBetter")}
        </p>
      )}
      {dataView === "growth" && (
        <p className="mt-3 text-xs text-blue-2">
          {t("companies.emissionsIntensity.chartTooltip.growthHint")}
        </p>
      )}
    </div>
  );
};

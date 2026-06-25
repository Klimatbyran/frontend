import { useMemo } from "react";
import { useTranslation, TFunction } from "react-i18next";
import type { Municipality } from "@/types/municipality";
import type { KPIValue } from "@/types/rankings";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | null;
}

function buildBooleanStats(
  municipalities: Municipality[],
  selectedKPI: KPIValue<Municipality>,
  t: TFunction,
): StatItem[] {
  const total = municipalities.length;
  const withData = municipalities.filter((m) => {
    const v = m[selectedKPI.key];
    return v !== null && v !== undefined;
  }).length;
  const missingData = total - withData;
  const trueCount = municipalities.filter(
    (m) => m[selectedKPI.key] === true,
  ).length;
  const pct = withData > 0 ? ((trueCount / withData) * 100).toFixed(0) : "0";
  const items: StatItem[] = [
    {
      label: t("municipalities.list.summary.total"),
      value: String(total),
      sub: t("municipalities.list.summary.municipalities"),
      trend: null,
    },
    {
      label: selectedKPI.booleanLabels?.true ?? t("yes"),
      value: String(trueCount),
      sub: `${pct}%`,
      trend: selectedKPI.higherIsBetter ? "up" : "down",
    },
    {
      label: selectedKPI.booleanLabels?.false ?? t("no"),
      value: String(withData - trueCount),
      sub: `${100 - Number(pct)}%`,
      trend: selectedKPI.higherIsBetter ? "down" : "up",
    },
  ];
  if (missingData > 0) {
    items.push({
      label: t("municipalities.list.summary.missingData"),
      value: String(missingData),
      sub: t("municipalities.list.summary.noReported"),
      trend: null,
    });
  }
  return items;
}

function buildNumericStats(
  municipalities: Municipality[],
  selectedKPI: KPIValue<Municipality>,
  t: TFunction,
): StatItem[] {
  const total = municipalities.length;
  const numericValues = municipalities
    .map((m) => m[selectedKPI.key])
    .filter((v): v is number => typeof v === "number" && !isNaN(v));

  if (!numericValues.length) return [];

  const average = numericValues.reduce((s, v) => s + v, 0) / numericValues.length;
  const aboveAvg = numericValues.filter((v) => v > average).length;
  const belowAvg = numericValues.filter((v) => v < average).length;
  const unit = selectedKPI.unit || "";
  const avgPositive = average > 0;

  return [
    {
      label: t("municipalities.list.summary.total"),
      value: String(total),
      sub: t("municipalities.list.summary.municipalities"),
      trend: null,
    },
    {
      label: t("municipalities.list.insights.keyStatistics.average"),
      value: `${average.toFixed(1)}${unit}`,
      sub: t("municipalities.list.summary.nationalAvg"),
      trend: selectedKPI.higherIsBetter
        ? avgPositive
          ? "up"
          : "down"
        : avgPositive
          ? "down"
          : "up",
    },
    {
      label: t("rankedInsights.aboveAverage", { entityPlural: "" }).trim(),
      value: String(aboveAvg),
      sub: `${((aboveAvg / numericValues.length) * 100).toFixed(0)}%`,
      trend: selectedKPI.higherIsBetter ? "up" : "down",
    },
    {
      label: t("rankedInsights.belowAverage", { entityPlural: "" }).trim(),
      value: String(belowAvg),
      sub: `${((belowAvg / numericValues.length) * 100).toFixed(0)}%`,
      trend: selectedKPI.higherIsBetter ? "down" : "up",
    },
  ];
}

function buildStats(
  municipalities: Municipality[],
  selectedKPI: KPIValue<Municipality>,
  t: TFunction,
): StatItem[] {
  if (selectedKPI.isBoolean) {
    return buildBooleanStats(municipalities, selectedKPI, t);
  }
  return buildNumericStats(municipalities, selectedKPI, t);
}

interface MunicipalitySummaryBarProps {
  municipalities: Municipality[];
  selectedKPI: KPIValue<Municipality>;
}

export function MunicipalitySummaryBar({
  municipalities,
  selectedKPI,
}: MunicipalitySummaryBarProps) {
  const { t } = useTranslation();

  const stats = useMemo(
    () => buildStats(municipalities, selectedKPI, t),
    [municipalities, selectedKPI, t],
  );

  if (!stats.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white/5 rounded-2xl p-4 flex flex-col gap-1 border border-white/5"
        >
          <p className="text-xs text-white/40 uppercase tracking-wider leading-tight">
            {stat.label}
          </p>
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            {stat.trend === "up" && (
              <TrendingUp className="w-4 h-4 text-blue-3 mb-1" />
            )}
            {stat.trend === "down" && (
              <TrendingDown className="w-4 h-4 text-pink-3 mb-1" />
            )}
            {stat.trend === null && (
              <Minus className="w-4 h-4 text-white/30 mb-1" />
            )}
          </div>
          <p className="text-xs text-white/50">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}

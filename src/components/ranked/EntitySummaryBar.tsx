import { useMemo } from "react";
import { TFunction, useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KPIValue } from "@/types/rankings";

interface StatItem {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | null;
}

function buildBooleanStats<T>(
  entities: T[],
  selectedKPI: KPIValue<T>,
  t: TFunction,
  entityNoun: string,
): StatItem[] {
  const total = entities.length;
  const withData = entities.filter((e) => {
    const v = e[selectedKPI.key];
    return v !== null && v !== undefined;
  }).length;
  const missingData = total - withData;
  const trueCount = entities.filter((e) => e[selectedKPI.key] === true).length;
  const pct = withData > 0 ? ((trueCount / withData) * 100).toFixed(0) : "0";
  const items: StatItem[] = [
    {
      label: t("municipalities.list.summary.total"),
      value: String(total),
      sub: entityNoun,
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

function buildNumericStats<T>(
  entities: T[],
  selectedKPI: KPIValue<T>,
  t: TFunction,
  entityNoun: string,
): StatItem[] {
  const total = entities.length;
  const numericValues = entities
    .map((e) => e[selectedKPI.key])
    .filter((v): v is number => typeof v === "number" && !isNaN(v));

  if (!numericValues.length) return [];

  const average =
    numericValues.reduce((s, v) => s + v, 0) / numericValues.length;
  const aboveAvg = numericValues.filter((v) => v > average).length;
  const belowAvg = numericValues.filter((v) => v < average).length;
  const unit = selectedKPI.unit || "";

  return [
    {
      label: t("municipalities.list.summary.total"),
      value: String(total),
      sub: entityNoun,
      trend: null,
    },
    {
      label: t("municipalities.list.insights.keyStatistics.average"),
      value: `${average.toFixed(1)}${unit}`,
      sub: t("municipalities.list.summary.nationalAvg"),
      trend: selectedKPI.higherIsBetter
        ? average > 0
          ? "up"
          : "down"
        : average < 0
          ? "up"
          : "down",
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

interface EntitySummaryBarProps<T> {
  entities: T[];
  selectedKPI: KPIValue<T>;
  /** Plural noun for the entity type, e.g. "kommuner" */
  entityNoun?: string;
}

export function EntitySummaryBar<T>({
  entities,
  selectedKPI,
  entityNoun,
}: EntitySummaryBarProps<T>) {
  const { t } = useTranslation();
  const noun = entityNoun ?? t("header.municipalities").toLowerCase();

  const stats = useMemo(
    () =>
      selectedKPI.isBoolean
        ? buildBooleanStats(entities, selectedKPI, t, noun)
        : buildNumericStats(entities, selectedKPI, t, noun),
    [entities, selectedKPI, t, noun],
  );

  if (!stats.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white/5 rounded-2xl p-4 flex flex-col gap-1"
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

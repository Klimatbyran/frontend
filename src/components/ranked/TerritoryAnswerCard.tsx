import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import { COLORS } from "@/lib/colors";
import type { KPIValue } from "@/types/rankings";
import {
  buildPerformerProps,
  calculateEntityStatistics,
  createSourceLinks,
} from "@/utils/insights/rankedListUtils";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  createStatisticalGradient,
  DEFAULT_STATISTICAL_GRADIENT_COLORS,
} from "@/utils/ui/colorGradients";
import {
  getPositiveIndicatorColor,
  isMeetsParisKpiKey,
} from "@/utils/ui/colors";
import { getEntityDetailPath } from "@/utils/routing";

const STAT_COLOR: Record<string, string> = {
  "text-blue-3": COLORS.blue3,
  "text-pink-3": COLORS.pink3,
  "text-green-3": COLORS.green3,
  "text-orange-2": COLORS.orange2,
  "text-grey": COLORS.grey,
};

const LEGEND_GRADIENT = `linear-gradient(to bottom,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientStart} 0%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidLow} 33%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidHigh} 66%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientEnd} 100%)`;

function lowercaseFirst(value: string): string {
  return value ? value.charAt(0).toLocaleLowerCase() + value.slice(1) : value;
}

function displayMinus(value: string): string {
  return value.replace("-", "−");
}

function formatScaleValue(value: number, unit: string): string {
  return `${value.toFixed(1).replace("-", "−")}${unit}`;
}

/** English verdicts start with "are" or "have". Singular needs "is" or "has". */
function singularVerdict(verdict: string): string {
  return verdict.replace(/^are\b/, "is").replace(/^have\b/, "has");
}

interface TerritoryAnswerCardProps<T extends { name: string }> {
  entities: T[];
  selectedKPI: KPIValue<T>;
  entityType: "municipalities" | "regions";
  /** i18n prefix, e.g. "municipalities.list" */
  translationPrefix: string;
}

export function TerritoryAnswerCard<T extends { name: string }>({
  entities,
  selectedKPI,
  entityType,
  translationPrefix,
}: TerritoryAnswerCardProps<T>) {
  const { t } = useTranslation();
  const kpiKey = String(selectedKPI.key);
  const statistics = calculateEntityStatistics(
    entities,
    selectedKPI,
    (entity) => entity[selectedKPI.key as keyof T],
    entityType,
  );

  if (!statistics.validData.length) {
    return (
      <section className="flex items-center rounded-level-2 bg-black-2 p-6">
        <p className="text-white/70">
          {t(`${translationPrefix}.insights.noData.metric`, {
            metric: t(`${translationPrefix}.kpis.${kpiKey}.label`),
            defaultValue: t("noData"),
          })}
        </p>
      </section>
    );
  }

  const numericValues: number[] = [];
  for (const entity of statistics.validData) {
    const value = entity[selectedKPI.key as keyof T];
    if (typeof value === "number") numericValues.push(value);
  }

  const averageColor = selectedKPI.isBoolean
    ? getPositiveIndicatorColor(isMeetsParisKpiKey(kpiKey))
    : createStatisticalGradient(
        numericValues,
        statistics.average,
        selectedKPI.higherIsBetter,
        DEFAULT_STATISTICAL_GRADIENT_COLORS,
      );

  const sorted = getSortedEntityKPIValues(statistics.validData, selectedKPI);
  const { topPerformer, bottomPerformer } = buildPerformerProps(
    sorted,
    {
      key: selectedKPI.key as keyof T,
      unit: selectedKPI.unit,
      isBoolean: selectedKPI.isBoolean,
    },
    (item) =>
      getEntityDetailPath(
        entityType === "regions" ? "region" : "municipality",
        item,
      ),
  );

  const metric = lowercaseFirst(
    selectedKPI.description || selectedKPI.label || "",
  );
  const entityPlural = t(`header.${entityType}`).toLowerCase();
  const trueCount = statistics.aboveAverageCount;
  const headline = selectedKPI.isBoolean
    ? String(trueCount)
    : displayMinus(statistics.formattedAverage ?? "");

  const verdict =
    selectedKPI.aboveString ?? selectedKPI.booleanLabels?.true ?? "";
  const lead = selectedKPI.isBoolean
    ? t("territoryOverview.booleanLead", {
        count: trueCount,
        total: statistics.validData.length,
        entities: entityPlural,
        verdict,
        verdictOne: singularVerdict(verdict),
      })
    : t("territoryOverview.averageLead", { metric });

  const stats =
    !selectedKPI.isBoolean && selectedKPI.higherIsBetter === false
      ? [
          statistics.distributionStats[1],
          statistics.distributionStats[0],
          ...statistics.distributionStats.slice(2),
        ].filter(Boolean)
      : statistics.distributionStats;
  const totalDistribution = stats.reduce((sum, stat) => sum + stat.count, 0);

  const sourceLinks = createSourceLinks(selectedKPI);
  const missingKey = `${translationPrefix}.kpis.${kpiKey}.missingCount`;
  const missingText =
    !selectedKPI.isBoolean && statistics.nullCount > 0
      ? t(missingKey, {
          count: statistics.nullCount,
          defaultValue: selectedKPI.nullValues
            ? `${statistics.nullCount} ${lowercaseFirst(selectedKPI.nullValues)}`
            : "",
        })
      : "";

  const minValue = numericValues.length
    ? Math.min(...numericValues)
    : statistics.average;
  const maxValue = numericValues.length
    ? Math.max(...numericValues)
    : statistics.average;
  const legendLeft = selectedKPI.higherIsBetter ? minValue : maxValue;
  const legendRight = selectedKPI.higherIsBetter ? maxValue : minValue;
  const unit = selectedKPI.unit ?? "";

  return (
    <section className="grid h-full min-h-0 grid-cols-1 rounded-level-2 bg-black-2 px-5 py-5 md:px-6 md:py-6 lg:grid-cols-[minmax(0,1fr)_5.75rem] lg:gap-8 lg:px-8 lg:py-8">
      <div className="flex min-h-0 flex-col justify-between gap-6 lg:gap-8">
        <div className="space-y-3 lg:space-y-4">
          <p className="text-[11px] uppercase tracking-[0.09em] text-white/45">
            {t("territoryOverview.kicker")}
          </p>
          <p className="text-[20px] font-light leading-snug tracking-tight lg:text-[22px]">
            <b
              className="mb-1.5 block text-[56px] font-medium leading-none tracking-tighter tabular-nums lg:text-[64px]"
              style={{ color: averageColor }}
            >
              {headline}
            </b>
            {lead}
          </p>
          {selectedKPI.detailedDescription && (
            <p className="text-sm leading-relaxed text-white/60 lg:text-[15px] lg:leading-relaxed">
              {selectedKPI.detailedDescription}
            </p>
          )}
          {!selectedKPI.isBoolean && (
            <span className="inline-flex w-max items-center gap-1.5 rounded-full bg-blue-3/15 px-2.5 py-0.5 text-[13px] font-medium text-blue-3">
              {selectedKPI.higherIsBetter ? "↑" : "↓"}{" "}
              {t(
                selectedKPI.higherIsBetter
                  ? "territoryOverview.higherIsBetter"
                  : "territoryOverview.lowerIsBetter",
              )}
            </span>
          )}
        </div>

        <div className="space-y-5 lg:space-y-6">
          {(topPerformer || bottomPerformer) && (
            <div className="grid grid-cols-1 gap-2 border-t border-white/10 pt-4 lg:grid-cols-2 lg:gap-3 lg:pt-5">
              {topPerformer && (
                <Performer
                  label={t(`${translationPrefix}.insights.keyStatistics.best`, {
                    defaultValue: t(
                      "municipalities.list.insights.keyStatistics.best",
                    ),
                  })}
                  name={topPerformer.name}
                  value={displayMinus(topPerformer.value)}
                  href={topPerformer.href}
                  nameClass="text-blue-3"
                />
              )}
              {bottomPerformer && (
                <Performer
                  label={t(
                    `${translationPrefix}.insights.keyStatistics.worst`,
                    {
                      defaultValue: t(
                        "municipalities.list.insights.keyStatistics.worst",
                      ),
                    },
                  )}
                  name={bottomPerformer.name}
                  value={displayMinus(bottomPerformer.value)}
                  href={bottomPerformer.href}
                  nameClass="text-pink-3"
                />
              )}
            </div>
          )}

          {totalDistribution > 0 && (
            <div
              className={
                topPerformer ? "" : "border-t border-white/10 pt-4 lg:pt-5"
              }
            >
              <div className="flex h-2.5 overflow-hidden rounded-full lg:h-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      width: `${(stat.count / totalDistribution) * 100}%`,
                      backgroundColor:
                        STAT_COLOR[stat.colorClass] ?? COLORS.grey,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2.5 space-y-2 lg:mt-3 lg:space-y-2.5">
                {stats.map((stat) => {
                  const percent =
                    totalDistribution > 0
                      ? Math.round((stat.count / totalDistribution) * 100)
                      : 0;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between gap-3 text-sm lg:text-[15px]"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-white/70">
                        <i
                          className="size-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              STAT_COLOR[stat.colorClass] ?? COLORS.grey,
                          }}
                        />
                        <span className="truncate">
                          {lowercaseFirst(stat.label)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 font-semibold tabular-nums ${stat.colorClass}`}
                      >
                        {stat.count}{" "}
                        <span className="font-normal text-white/40">
                          ({percent}%)
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1 border-t border-white/10 pt-4 lg:pt-5">
          {missingText && (
            <p className="truncate text-sm italic text-white/40">
              {missingText}
            </p>
          )}
          {sourceLinks.length > 0 && (
            <p className="text-sm italic text-white/40">
              {t("territoryOverview.source")}{" "}
              {sourceLinks.map((link, index) => (
                <Fragment key={link.url}>
                  {index > 0 && ", "}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white/60"
                  >
                    {t(link.label)}
                  </a>
                </Fragment>
              ))}
            </p>
          )}
        </div>
      </div>

      {!selectedKPI.isBoolean && numericValues.length > 0 && (
        <AverageScale
          leftValue={legendLeft}
          rightValue={legendRight}
          average={statistics.average}
          minValue={minValue}
          maxValue={maxValue}
          unit={unit}
          averageColor={averageColor}
          higherIsBetter={selectedKPI.higherIsBetter ?? true}
          label={t("territoryOverview.scaleAverage")}
        />
      )}
      {selectedKPI.isBoolean && totalDistribution > 0 && (
        <BooleanScale stats={stats} total={totalDistribution} />
      )}
    </section>
  );
}

function AverageScale({
  leftValue,
  rightValue,
  average,
  minValue,
  maxValue,
  unit,
  averageColor,
  higherIsBetter,
  label,
}: {
  leftValue: number;
  rightValue: number;
  average: number;
  minValue: number;
  maxValue: number;
  unit: string;
  averageColor: string;
  higherIsBetter: boolean;
  label: string;
}) {
  const span = maxValue - minValue || 1;
  const markerFromTop = higherIsBetter
    ? ((average - minValue) / span) * 100
    : ((maxValue - average) / span) * 100;
  const clampedTop = Math.min(96, Math.max(4, markerFromTop));

  return (
    <div className="hidden min-h-0 flex-col items-center lg:flex">
      <p className="mb-3 max-w-[5.75rem] text-center text-[10px] uppercase leading-snug tracking-[0.08em] text-white/40">
        {label}
      </p>
      <div className="relative flex min-h-[12rem] flex-1 flex-col items-center">
        <span className="mb-2 text-[11px] tabular-nums text-white/45">
          {formatScaleValue(leftValue, unit)}
        </span>
        <div className="relative w-3 flex-1 overflow-hidden rounded-full">
          <div
            className="absolute inset-0"
            style={{ background: LEGEND_GRADIENT }}
          />
          <div
            className="absolute left-1/2 z-10 size-3.5 -translate-x-1/2 rounded-full border-2 border-black-2 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]"
            style={{
              top: `${clampedTop}%`,
              marginTop: "-0.4375rem",
              backgroundColor: averageColor,
            }}
            title={formatScaleValue(average, unit)}
          />
        </div>
        <span className="mt-2 text-[11px] tabular-nums text-white/45">
          {formatScaleValue(rightValue, unit)}
        </span>
      </div>
    </div>
  );
}

function BooleanScale({
  stats,
  total,
}: {
  stats: Array<{ label: string; count: number; colorClass: string }>;
  total: number;
}) {
  return (
    <div className="hidden min-h-0 flex-col lg:flex">
      <div className="flex min-h-[12rem] flex-1 flex-col overflow-hidden rounded-2xl bg-white/5">
        {stats.map((stat) => {
          const percent =
            total > 0 ? Math.round((stat.count / total) * 100) : 0;
          return (
            <div
              key={stat.label}
              className="flex min-h-[2.5rem] flex-col justify-end px-2 py-2"
              style={{
                flexBasis: `${percent}%`,
                backgroundColor: STAT_COLOR[stat.colorClass] ?? COLORS.grey,
              }}
            >
              <span className="text-[11px] font-semibold tabular-nums text-white/90">
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Performer({
  label,
  name,
  value,
  href,
  nameClass,
}: {
  label: string;
  name: string;
  value: string;
  href?: string;
  nameClass: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 px-3.5 py-3 lg:px-4 lg:py-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">
        {label}
      </p>
      {href ? (
        <LocalizedLink
          to={href}
          className={`mt-0.5 block truncate font-semibold hover:underline lg:text-[17px] ${nameClass}`}
        >
          {name}
        </LocalizedLink>
      ) : (
        <p
          className={`mt-0.5 truncate font-semibold lg:text-[17px] ${nameClass}`}
        >
          {name}
        </p>
      )}
      <p className="text-[13px] text-white/55 lg:text-sm">{value}</p>
    </div>
  );
}

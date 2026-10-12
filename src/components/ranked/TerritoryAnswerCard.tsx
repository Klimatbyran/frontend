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
import { KPIDistributionChart } from "./KPIDistributionChart";

const STAT_COLOR: Record<string, string> = {
  "text-blue-3": COLORS.blue3,
  "text-pink-3": COLORS.pink3,
  "text-green-3": COLORS.green3,
  "text-orange-2": COLORS.orange2,
  "text-grey": COLORS.grey,
};

function lowercaseFirst(value: string): string {
  return value ? value.charAt(0).toLocaleLowerCase() + value.slice(1) : value;
}

function displayMinus(value: string): string {
  return value.replace("-", "−");
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
      <section className="flex items-center rounded-level-2 bg-black-2 px-6 py-8 md:px-10 md:py-9">
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

  const performers = (
    <div
      className={
        selectedKPI.isBoolean
          ? "grid grid-cols-1 gap-2.5"
          : "grid shrink-0 grid-cols-1 gap-2.5 md:grid-cols-2 lg:gap-3"
      }
    >
      {topPerformer && (
        <Performer
          label={t(`${translationPrefix}.insights.keyStatistics.best`, {
            defaultValue: t("municipalities.list.insights.keyStatistics.best"),
          })}
          name={topPerformer.name}
          value={displayMinus(topPerformer.value)}
          href={topPerformer.href}
          nameClass="text-blue-3"
          fill={!selectedKPI.isBoolean}
        />
      )}
      {bottomPerformer && (
        <Performer
          label={t(`${translationPrefix}.insights.keyStatistics.worst`, {
            defaultValue: t("municipalities.list.insights.keyStatistics.worst"),
          })}
          name={bottomPerformer.name}
          value={displayMinus(bottomPerformer.value)}
          href={bottomPerformer.href}
          nameClass="text-pink-3"
          fill={!selectedKPI.isBoolean}
        />
      )}
    </div>
  );

  return (
    <section className="flex h-full min-h-0 flex-col rounded-level-2 bg-black-2 px-6 py-8 md:px-10 md:py-9">
      <div className="space-y-3 md:space-y-3.5">
        <p className="text-xs uppercase tracking-[0.09em] text-white/45">
          {t("territoryOverview.kicker")}
        </p>
        <p className="text-[20px] font-light leading-snug tracking-tight md:text-[22px] lg:text-[24px] lg:leading-snug">
          <b
            className="mb-2 block text-[56px] font-medium leading-none tracking-tighter tabular-nums md:text-[64px] lg:text-[68px]"
            style={{ color: averageColor }}
          >
            {headline}
          </b>
          {lead}
        </p>
        {selectedKPI.detailedDescription && (
          <p className="text-sm leading-relaxed text-white/60 md:text-base md:leading-relaxed">
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

      {selectedKPI.isBoolean ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 py-4 lg:flex-row lg:items-stretch lg:gap-4 lg:py-3">
          <div className="flex min-h-[11rem] min-w-0 flex-1 items-center justify-center lg:min-h-[20rem]">
            <KPIDistributionChart
              data={entities}
              selectedKPI={selectedKPI}
              entityLabel={entityPlural}
              translationPrefix={translationPrefix}
              containerClassName="h-full min-h-0"
            />
          </div>
          <div className="flex w-full flex-col justify-center gap-3 lg:w-60 lg:shrink-0">
            {(topPerformer || bottomPerformer) && performers}
            {totalDistribution > 0 && (
              <DistributionRows
                stats={stats}
                total={totalDistribution}
                grow={false}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 py-4 lg:gap-5 lg:py-5">
          {(topPerformer || bottomPerformer) && performers}
          {totalDistribution > 0 && (
            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:gap-4">
              <div className="flex h-3 shrink-0 overflow-hidden rounded-full lg:h-4">
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
              <DistributionRows stats={stats} total={totalDistribution} grow />
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        {missingText && (
          <p className="truncate text-sm italic text-white/40">{missingText}</p>
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
    </section>
  );
}

function DistributionRows({
  stats,
  total,
  grow,
}: {
  stats: Array<{ label: string; count: number; colorClass: string }>;
  total: number;
  grow: boolean;
}) {
  return (
    <div
      className={
        grow
          ? "flex min-h-0 flex-1 flex-col justify-center gap-3 lg:gap-5"
          : "space-y-2"
      }
    >
      {stats.map((stat) => {
        const percent = total > 0 ? Math.round((stat.count / total) * 100) : 0;
        return (
          <div
            key={stat.label}
            className={
              grow
                ? "flex items-center justify-between gap-3 text-sm lg:text-lg"
                : "flex items-center justify-between gap-3 text-sm"
            }
          >
            <span className="flex min-w-0 items-center gap-2 text-white/70">
              <i
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: STAT_COLOR[stat.colorClass] ?? COLORS.grey,
                }}
              />
              <span className={grow ? "truncate" : "min-w-0"}>
                {lowercaseFirst(stat.label)}
              </span>
            </span>
            <span
              className={`shrink-0 font-semibold tabular-nums ${stat.colorClass}`}
            >
              {stat.count}{" "}
              <span className="font-normal text-white/40">({percent}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Performer({
  label,
  name,
  value,
  href,
  nameClass,
  fill = false,
}: {
  label: string;
  name: string;
  value: string;
  href?: string;
  nameClass: string;
  fill?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/10 px-3.5 py-3.5 md:px-4 md:py-4 lg:px-4 lg:py-2.5 ${
        fill ? "flex flex-col justify-center" : ""
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">
        {label}
      </p>
      {href ? (
        <LocalizedLink
          to={href}
          className={`mt-1 block truncate font-semibold hover:underline md:text-[17px] lg:text-lg ${nameClass}`}
        >
          {name}
        </LocalizedLink>
      ) : (
        <p
          className={`mt-1 truncate font-semibold md:text-[17px] lg:text-lg ${nameClass}`}
        >
          {name}
        </p>
      )}
      <p className="text-[13px] text-white/55 md:text-sm">{value}</p>
    </div>
  );
}

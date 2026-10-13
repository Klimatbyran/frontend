import { Fragment } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useEnteredView } from "@/hooks/useEnteredView";
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

type DistributionStat = {
  label: string;
  count: number;
  backgroundColor: string;
  textColor: string;
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
  const { reduceMotion, fadeDuration, barDuration, ease } = useChartMotion();
  const { ref, entered } = useEnteredView<HTMLElement>({
    enabled: !reduceMotion,
  });
  const show = reduceMotion || entered;
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
    <div className="grid shrink-0 grid-cols-1 gap-2.5 md:grid-cols-2 lg:gap-4">
      {topPerformer && (
        <Performer
          label={t(`${translationPrefix}.insights.keyStatistics.best`, {
            defaultValue: t("municipalities.list.insights.keyStatistics.best"),
          })}
          name={topPerformer.name}
          value={displayMinus(topPerformer.value)}
          href={topPerformer.href}
          nameClass="text-blue-3"
          index={0}
          revealed={show}
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
          index={1}
          revealed={show}
        />
      )}
    </div>
  );

  const headlineBlock = (
    <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
      <p className="text-xs uppercase tracking-[0.09em] text-white/45 lg:text-sm">
        {t("territoryOverview.kicker")}
      </p>
      <p className="text-[20px] font-light leading-snug tracking-tight md:text-[22px] lg:text-[26px] lg:leading-snug">
        <motion.b
          key={`headline-${kpiKey}-${headline}`}
          className="mb-2 block text-[56px] font-medium leading-none tracking-tighter tabular-nums md:text-[64px] lg:text-[68px]"
          style={{ color: averageColor }}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: fadeDuration, ease }}
        >
          {headline}
        </motion.b>
        <motion.span
          key={`lead-${kpiKey}`}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: fadeDuration,
            delay: reduceMotion ? 0 : 0.08,
            ease,
          }}
        >
          {lead}
        </motion.span>
      </p>
      {selectedKPI.detailedDescription && (
        <motion.p
          key={`detail-${kpiKey}`}
          className="text-sm leading-relaxed text-white/60 md:text-base lg:text-lg lg:leading-relaxed"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: fadeDuration,
            delay: reduceMotion ? 0 : 0.14,
            ease,
          }}
        >
          {selectedKPI.detailedDescription}
        </motion.p>
      )}
    </div>
  );

  const directionBadge = !selectedKPI.isBoolean && (
    <motion.span
      key={`direction-${kpiKey}`}
      className="inline-flex w-max items-center gap-1.5 rounded-full bg-blue-3/15 px-2.5 py-0.5 text-[13px] font-medium text-blue-3 lg:px-3 lg:py-1 lg:text-base"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: fadeDuration,
        delay: reduceMotion ? 0 : 0.14,
        ease,
      }}
    >
      {selectedKPI.higherIsBetter ? "↑" : "↓"}{" "}
      {t(
        selectedKPI.higherIsBetter
          ? "territoryOverview.higherIsBetter"
          : "territoryOverview.lowerIsBetter",
      )}
    </motion.span>
  );

  const sourceBlock = (
    <div className="space-y-1">
      {missingText && (
        <p className="truncate text-sm italic text-white/40 lg:text-base">
          {missingText}
        </p>
      )}
      {sourceLinks.length > 0 && (
        <p className="text-sm italic text-white/40 lg:text-base">
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
  );

  if (!selectedKPI.isBoolean) {
    return (
      <section
        ref={ref}
        className="flex h-full min-h-0 flex-col gap-4 rounded-level-2 bg-black-2 px-6 py-8 md:px-10 md:py-9 lg:justify-between lg:gap-0"
      >
        <div className="space-y-3 lg:space-y-5">
          {headlineBlock}
          {directionBadge}
        </div>
        {(topPerformer || bottomPerformer) && performers}
        {totalDistribution > 0 && (
          <div className="space-y-3 lg:space-y-5">
            <motion.div
              className="flex h-3 origin-left overflow-hidden rounded-full lg:h-4"
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: show ? 1 : 0 }}
              transition={{
                duration: reduceMotion ? 0 : barDuration,
                ease,
              }}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    width: `${(stat.count / totalDistribution) * 100}%`,
                    backgroundColor: stat.backgroundColor,
                  }}
                />
              ))}
            </motion.div>
            <DistributionRows
              stats={stats}
              total={totalDistribution}
              revealed={show}
            />
          </div>
        )}
        {sourceBlock}
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="flex h-full min-h-0 flex-col rounded-level-2 bg-black-2 px-6 py-8 md:px-10 md:py-9"
    >
      {headlineBlock}

      <div className="flex min-h-0 flex-1 flex-col gap-4 py-4 lg:flex-row lg:items-stretch lg:gap-4 lg:py-3">
        <div className="flex min-h-[11rem] min-w-0 flex-1 items-center justify-center lg:min-h-[20rem]">
          {show ? (
            <KPIDistributionChart
              data={entities}
              selectedKPI={selectedKPI}
              entityLabel={entityPlural}
              translationPrefix={translationPrefix}
              containerClassName="h-full min-h-0"
            />
          ) : (
            <div className="min-h-[11rem] w-full lg:min-h-[20rem]" />
          )}
        </div>
        <div className="flex w-full flex-col justify-center gap-3 lg:w-72 lg:shrink-0 lg:gap-5">
          {totalDistribution > 0 && (
            <DistributionRows
              stats={stats}
              total={totalDistribution}
              revealed={show}
            />
          )}
        </div>
      </div>

      {sourceBlock}
    </section>
  );
}

function DistributionRows({
  stats,
  total,
  revealed,
}: {
  stats: DistributionStat[];
  total: number;
  revealed: boolean;
}) {
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();
  const show = reduceMotion || revealed;

  return (
    <div className="space-y-2 lg:space-y-3.5">
      {stats.map((stat, index) => {
        const percent = total > 0 ? Math.round((stat.count / total) * 100) : 0;
        return (
          <motion.div
            key={stat.label}
            className="flex items-center justify-between gap-3 text-sm lg:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{
              duration: fadeDuration,
              delay: stagger(index, 0.06),
              ease,
            }}
          >
            <span className="flex min-w-0 items-center gap-2.5 text-white/70">
              <span
                className="inline-block size-2.5 shrink-0 rounded-full lg:size-3"
                style={{
                  backgroundColor: stat.backgroundColor,
                }}
              />
              <span className="min-w-0">{lowercaseFirst(stat.label)}</span>
            </span>
            <span
              className="shrink-0 font-semibold tabular-nums lg:text-xl lg:font-bold"
              style={{ color: stat.textColor }}
            >
              {stat.count}{" "}
              <span className="font-normal text-white/40 lg:text-base">
                ({percent}%)
              </span>
            </span>
          </motion.div>
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
  index,
  revealed,
}: {
  label: string;
  name: string;
  value: string;
  href?: string;
  nameClass: string;
  index: number;
  revealed: boolean;
}) {
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();
  const show = reduceMotion || revealed;

  return (
    <motion.div
      className="flex flex-col justify-center rounded-2xl bg-white/10 px-3.5 py-3.5 md:px-4 md:py-4 lg:space-y-2 lg:px-5 lg:py-5"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{
        duration: fadeDuration,
        delay: stagger(index, 0.06),
        ease,
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-white/45 lg:text-sm">
        {label}
      </p>
      {href ? (
        <LocalizedLink
          to={href}
          className={`mt-1 block truncate font-semibold hover:underline md:text-[17px] lg:mt-0 lg:text-xl ${nameClass}`}
        >
          {name}
        </LocalizedLink>
      ) : (
        <p
          className={`mt-1 truncate font-semibold md:text-[17px] lg:mt-0 lg:text-xl ${nameClass}`}
        >
          {name}
        </p>
      )}
      <p className="text-[13px] text-white/55 md:text-sm lg:text-base">
        {value}
      </p>
    </motion.div>
  );
}

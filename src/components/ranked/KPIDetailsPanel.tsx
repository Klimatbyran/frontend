import { Fragment } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/lib/colors";
import { LocalizedLink } from "@/components/LocalizedLink";

interface DistributionStat {
  count: number;
  colorClass: string;
  label: string;
}

interface SourceLink {
  url: string;
  label: string;
}

interface Performer {
  name: string;
  value: string;
  href?: string;
}

interface KPIDetailsPanelProps {
  title: string;
  description?: string;
  isBoolean?: boolean;
  higherIsBetter?: boolean;
  averageValue?: string | number;
  averageLabel?: string;
  topPerformer?: Performer;
  bottomPerformer?: Performer;
  distributionStats: DistributionStat[];
  missingDataCount?: number;
  missingDataLabel?: string;
  /** i18n key for missing-data count, receives {{count}} */
  missingDataCountKey?: string;
  sourceLinks?: SourceLink[];
  className?: string;
  chart?: React.ReactNode;
}

const STAT_COLOR_MAP: Record<string, string> = {
  "text-blue-3": COLORS.blue3,
  "text-pink-3": COLORS.pink3,
  "text-green-3": COLORS.green3,
  "text-orange-2": COLORS.orange2,
  "text-grey": COLORS.grey,
};

const lowercaseFirstLetter = (str: string): string =>
  str ? str.charAt(0).toLocaleLowerCase() + str.slice(1) : str;

function DirectionBadge({
  higherIsBetter,
  t,
}: {
  higherIsBetter: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full"
      style={{
        backgroundColor: `${COLORS.blue3}22`,
        color: COLORS.blue3,
      }}
    >
      <span>{higherIsBetter ? "↑" : "↓"}</span>
      <span>
        {higherIsBetter
          ? t("municipalities.list.insights.distribution.higherBetter")
          : t("municipalities.list.insights.distribution.lowerBetter")}
      </span>
    </span>
  );
}

function PerformerCard({
  performer,
  label,
  colorClass,
}: {
  performer: Performer;
  label: string;
  colorClass: string;
}) {
  return (
    <div className="p-5 md:p-4 bg-white/10 rounded-2xl space-y-1.5 shrink-0">
      <p className="text-xs text-white/50 uppercase tracking-wider">{label}</p>
      {performer.href ? (
        <LocalizedLink
          to={performer.href}
          className={`block font-semibold ${colorClass} hover:underline truncate`}
        >
          {performer.name}
        </LocalizedLink>
      ) : (
        <p className={`font-semibold ${colorClass} truncate`}>
          {performer.name}
        </p>
      )}
      <p className="text-sm text-white/60">{performer.value}</p>
    </div>
  );
}

function DistributionSection({
  distributionStats,
  totalDistribution,
}: {
  distributionStats: DistributionStat[];
  totalDistribution: number;
}) {
  return (
    <div className="space-y-4 md:space-y-3 shrink-0">
      <div className="flex rounded-full overflow-hidden h-3">
        {distributionStats.map((stat) => {
          const pct = (stat.count / totalDistribution) * 100;
          const bg = STAT_COLOR_MAP[stat.colorClass] ?? "#888";
          return (
            <div
              key={stat.label}
              style={{
                width: `${pct}%`,
                backgroundColor: bg,
                transition: "width 0.8s ease-out",
              }}
              title={`${stat.label}: ${stat.count}`}
            />
          );
        })}
      </div>
      <div className="space-y-3 md:space-y-2">
        {distributionStats.map((stat) => {
          const pct =
            totalDistribution > 0
              ? ((stat.count / totalDistribution) * 100).toFixed(0)
              : 0;
          return (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="inline-block w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: STAT_COLOR_MAP[stat.colorClass] ?? "#888",
                  }}
                />
                <span className="text-white/70 text-sm md:text-base truncate">
                  {lowercaseFirstLetter(stat.label)}
                </span>
              </div>
              <span
                className={`font-bold text-base md:text-xl shrink-0 ${stat.colorClass}`}
              >
                {stat.count}{" "}
                <span className="text-white/40 font-normal text-sm">
                  ({pct}%)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SourceSection({
  sourceLinks,
  t,
}: {
  sourceLinks: SourceLink[];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (sourceLinks.length === 0) return null;
  return (
    <p className="text-white/40 text-sm italic">
      {t("municipalities.list.source")}{" "}
      {sourceLinks.map((link, index) => {
        const label = t(link.label, { returnObjects: false });
        return (
          <Fragment key={link.url}>
            {index > 0 && ", "}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/60 transition-colors"
              title={label}
            >
              {label}
            </a>
          </Fragment>
        );
      })}
    </p>
  );
}

function MissingDataFooter({
  missingDataCount,
  missingDataLabel,
  missingDataCountKey,
  isBoolean,
  t,
}: {
  missingDataCount?: number;
  missingDataLabel?: string;
  missingDataCountKey?: string;
  isBoolean?: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (
    typeof missingDataCount !== "number" ||
    missingDataCount <= 0 ||
    isBoolean
  ) {
    return null;
  }

  if (missingDataCountKey) {
    return (
      <p className="text-white/40 text-sm italic truncate">
        {t(missingDataCountKey, { count: missingDataCount })}
      </p>
    );
  }

  if (!missingDataLabel) return null;

  return (
    <p className="text-white/40 text-sm italic truncate">
      {missingDataCount} {lowercaseFirstLetter(missingDataLabel)}
    </p>
  );
}

function PanelFooter({
  showFooter,
  isBoolean,
  sourceLinks,
  missingDataCount,
  missingDataLabel,
  missingDataCountKey,
  t,
}: {
  showFooter: boolean;
  isBoolean?: boolean;
  sourceLinks: SourceLink[];
  missingDataCount?: number;
  missingDataLabel?: string;
  missingDataCountKey?: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (!showFooter) return null;

  return (
    <div
      className={`space-y-2 shrink-0 ${
        isBoolean && sourceLinks.length > 0 ? "pt-4 md:pt-6" : ""
      }`}
    >
      <MissingDataFooter
        missingDataCount={missingDataCount}
        missingDataLabel={missingDataLabel}
        missingDataCountKey={missingDataCountKey}
        isBoolean={isBoolean}
        t={t}
      />
      <SourceSection sourceLinks={sourceLinks} t={t} />
    </div>
  );
}

function KPIDetailsPanelBody({
  title,
  description,
  isBoolean,
  higherIsBetter,
  averageValue,
  averageLabel,
  topPerformer,
  bottomPerformer,
  distributionStats,
  chart,
  compactBooleanLayout,
  totalDistribution,
  t,
}: {
  title: string;
  description?: string;
  isBoolean?: boolean;
  higherIsBetter?: boolean;
  averageValue?: string | number;
  averageLabel?: string;
  topPerformer?: Performer;
  bottomPerformer?: Performer;
  distributionStats: DistributionStat[];
  chart?: React.ReactNode;
  compactBooleanLayout: boolean;
  totalDistribution: number;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <>
      <div className="space-y-3 shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
          {title}
        </h2>
        {description && (
          <p
            className={`text-sm md:text-base text-white/60 leading-relaxed ${
              compactBooleanLayout ? "md:line-clamp-2" : ""
            }`}
          >
            {description}
          </p>
        )}
        {!isBoolean && higherIsBetter !== undefined && (
          <DirectionBadge higherIsBetter={higherIsBetter} t={t} />
        )}
      </div>

      {chart && (
        <div
          className={
            compactBooleanLayout
              ? "flex-1 min-h-[200px] w-full min-w-0 flex items-center justify-center overflow-visible"
              : "shrink-0 w-full min-w-0 flex justify-center overflow-visible py-1"
          }
        >
          {chart}
        </div>
      )}

      {topPerformer && !compactBooleanLayout && (
        <PerformerCard
          performer={topPerformer}
          label={t("municipalities.list.insights.keyStatistics.best")}
          colorClass="text-blue-3"
        />
      )}

      {bottomPerformer && !compactBooleanLayout && (
        <PerformerCard
          performer={bottomPerformer}
          label={t("municipalities.list.insights.keyStatistics.worst")}
          colorClass="text-pink-3"
        />
      )}

      {averageValue !== undefined && (
        <div className="p-4 bg-white/10 rounded-2xl shrink-0">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
            {averageLabel}
          </p>
          <p className="text-3xl font-bold text-orange-2">{averageValue}</p>
        </div>
      )}

      {distributionStats.length > 0 && totalDistribution > 0 && (
        <DistributionSection
          distributionStats={distributionStats}
          totalDistribution={totalDistribution}
        />
      )}
    </>
  );
}

export default function KPIDetailsPanel({
  title,
  description,
  isBoolean,
  higherIsBetter,
  averageValue,
  averageLabel,
  topPerformer,
  bottomPerformer,
  distributionStats,
  missingDataCount,
  missingDataLabel,
  missingDataCountKey,
  sourceLinks = [],
  className = "",
  chart,
}: KPIDetailsPanelProps) {
  const { t } = useTranslation();
  const totalDistribution = distributionStats.reduce(
    (sum, s) => sum + s.count,
    0,
  );
  const compactBooleanLayout = isBoolean && !!chart;
  const showFooter =
    (typeof missingDataCount === "number" &&
      missingDataCount > 0 &&
      !isBoolean) ||
    sourceLinks.length > 0;

  return (
    <div
      className={`p-6 md:p-8 flex flex-col gap-6 md:gap-0 md:justify-between h-auto md:h-full min-h-0 min-w-0 overflow-visible bg-white/5 rounded-level-2 shadow-lg ${className}`}
    >
      <KPIDetailsPanelBody
        title={title}
        description={description}
        isBoolean={isBoolean}
        higherIsBetter={higherIsBetter}
        averageValue={averageValue}
        averageLabel={averageLabel}
        topPerformer={topPerformer}
        bottomPerformer={bottomPerformer}
        distributionStats={distributionStats}
        chart={chart}
        compactBooleanLayout={compactBooleanLayout}
        totalDistribution={totalDistribution}
        t={t}
      />
      <PanelFooter
        showFooter={showFooter}
        isBoolean={isBoolean}
        sourceLinks={sourceLinks}
        missingDataCount={missingDataCount}
        missingDataLabel={missingDataLabel}
        missingDataCountKey={missingDataCountKey}
        t={t}
      />
    </div>
  );
}

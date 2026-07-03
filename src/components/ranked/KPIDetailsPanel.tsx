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
  sourceLinks?: SourceLink[];
  className?: string;
  chart?: React.ReactNode;
}

const STAT_COLOR_MAP: Record<string, string> = {
  "text-blue-3": COLORS.blue3,
  "text-pink-3": COLORS.pink3,
  "text-green-3": COLORS.green3,
  "text-orange-2": COLORS.orange2,
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
    <div className="p-4 bg-white/10 rounded-2xl space-y-1">
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
    <div className="space-y-4">
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
      <div className="space-y-2">
        {distributionStats.map((stat) => {
          const pct =
            totalDistribution > 0
              ? ((stat.count / totalDistribution) * 100).toFixed(0)
              : 0;
          return (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-block w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: STAT_COLOR_MAP[stat.colorClass] ?? "#888",
                  }}
                />
                <span className="text-white/70 text-sm md:text-base">
                  {lowercaseFirstLetter(stat.label)}
                </span>
              </div>
              <span
                className={`font-bold text-lg md:text-2xl ${stat.colorClass}`}
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

function PerformersSection({
  topPerformer,
  bottomPerformer,
  t,
}: {
  topPerformer?: Performer;
  bottomPerformer?: Performer;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (!topPerformer && !bottomPerformer) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {topPerformer && (
        <PerformerCard
          performer={topPerformer}
          label={t("municipalities.list.insights.keyStatistics.best")}
          colorClass="text-blue-3"
        />
      )}
      {bottomPerformer && (
        <PerformerCard
          performer={bottomPerformer}
          label={t("municipalities.list.insights.keyStatistics.worst")}
          colorClass="text-pink-3"
        />
      )}
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
  sourceLinks = [],
  className = "",
  chart,
}: KPIDetailsPanelProps) {
  const { t } = useTranslation();
  const totalDistribution = distributionStats.reduce(
    (sum, s) => sum + s.count,
    0,
  );

  return (
    <div
      className={`p-8 flex flex-col justify-between gap-6 bg-white/5 rounded-level-2 shadow-lg h-full overflow-hidden ${className}`}
    >
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-base text-white/60 leading-relaxed">
            {description}
          </p>
        )}
        {!isBoolean && higherIsBetter !== undefined && (
          <DirectionBadge higherIsBetter={higherIsBetter} t={t} />
        )}
      </div>

      {chart && <div>{chart}</div>}

      <PerformersSection
        topPerformer={topPerformer}
        bottomPerformer={bottomPerformer}
        t={t}
      />

      {averageValue !== undefined && (
        <div className="p-4 bg-white/10 rounded-2xl">
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

      <div className="space-y-1.5">
        {typeof missingDataCount === "number" &&
          missingDataCount > 0 &&
          missingDataLabel && (
            <p className="text-white/40 text-sm italic truncate">
              {missingDataCount} {lowercaseFirstLetter(missingDataLabel)}
            </p>
          )}
        <SourceSection sourceLinks={sourceLinks} t={t} />
      </div>
    </div>
  );
}

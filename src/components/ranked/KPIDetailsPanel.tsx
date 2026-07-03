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
  /** Optional chart rendered between the header and distribution bar */
  chart?: React.ReactNode;
}

const STAT_COLOR_MAP: Record<string, string> = {
  "text-blue-3": COLORS.blue3,
  "text-pink-3": COLORS.pink3,
  "text-green-3": COLORS.green3,
  "text-orange-2": COLORS.orange2,
  "text-grey": COLORS.grey,
};

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
  const sourceSection = sourceLinks.length > 0 && (
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

  const lowercaseFirstLetter = (str: string): string =>
    str ? str.charAt(0).toLocaleLowerCase() + str.slice(1) : str;

  const totalDistribution = distributionStats.reduce(
    (sum, s) => sum + s.count,
    0,
  );

  const compactBooleanLayout = isBoolean && !!chart;

  return (
    <div
      className={`p-6 md:p-8 flex flex-col gap-4 md:gap-5 bg-white/5 rounded-level-2 shadow-lg h-full min-h-0 overflow-hidden ${className}`}
    >
      {/* Title + description + direction badge */}
      <div className="space-y-2 shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
          {title}
        </h2>
        {description && (
          <p
            className={`text-sm md:text-base text-white/60 leading-relaxed ${
              compactBooleanLayout ? "line-clamp-2" : ""
            }`}
          >
            {description}
          </p>
        )}
        {!isBoolean && higherIsBetter !== undefined && (
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
        )}
      </div>

      {chart && (
        <div className="w-full flex-1 min-h-0 flex items-center justify-center">
          {chart}
        </div>
      )}

      {/* Top & bottom performers */}
      {!compactBooleanLayout && (topPerformer || bottomPerformer) && (
        <div className="grid grid-cols-2 gap-3">
          {topPerformer && (
            <div className="p-4 bg-white/10 rounded-2xl space-y-1">
              <p className="text-xs text-white/50 uppercase tracking-wider">
                {t("municipalities.list.insights.keyStatistics.best")}
              </p>
              {topPerformer.href ? (
                <LocalizedLink
                  to={topPerformer.href}
                  className="block font-semibold text-blue-3 hover:underline truncate"
                >
                  {topPerformer.name}
                </LocalizedLink>
              ) : (
                <p className="font-semibold text-blue-3 truncate">
                  {topPerformer.name}
                </p>
              )}
              <p className="text-sm text-white/60">{topPerformer.value}</p>
            </div>
          )}
          {bottomPerformer && (
            <div className="p-4 bg-white/10 rounded-2xl space-y-1">
              <p className="text-xs text-white/50 uppercase tracking-wider">
                {t("municipalities.list.insights.keyStatistics.worst")}
              </p>
              {bottomPerformer.href ? (
                <LocalizedLink
                  to={bottomPerformer.href}
                  className="block font-semibold text-pink-3 hover:underline truncate"
                >
                  {bottomPerformer.name}
                </LocalizedLink>
              ) : (
                <p className="font-semibold text-pink-3 truncate">
                  {bottomPerformer.name}
                </p>
              )}
              <p className="text-sm text-white/60">{bottomPerformer.value}</p>
            </div>
          )}
        </div>
      )}

      {/* Average */}
      {averageValue !== undefined && (
        <div className="p-4 bg-white/10 rounded-2xl">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
            {averageLabel}
          </p>
          <p className="text-3xl font-bold text-orange-2">{averageValue}</p>
        </div>
      )}

      {/* Distribution bar + legend */}
      {distributionStats.length > 0 && totalDistribution > 0 && (
        <div className="space-y-3 shrink-0">
          <div className="flex rounded-full overflow-hidden h-3">
            {distributionStats.map((stat, i) => {
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
            {distributionStats.map((stat, index) => {
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
                        backgroundColor:
                          STAT_COLOR_MAP[stat.colorClass] ?? "#888",
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
      )}

      {/* Footer: missing data + source */}
      <div className="space-y-1.5 shrink-0">
        {typeof missingDataCount === "number" &&
          missingDataCount > 0 &&
          !isBoolean &&
          (missingDataCountKey ? (
            <p className="text-white/40 text-sm italic truncate">
              {t(missingDataCountKey, { count: missingDataCount })}
            </p>
          ) : (
            missingDataLabel && (
              <p className="text-white/40 text-sm italic truncate">
                {missingDataCount} {lowercaseFirstLetter(missingDataLabel)}
              </p>
            )
          ))}
        {sourceSection}
      </div>
    </div>
  );
}

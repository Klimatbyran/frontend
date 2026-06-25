import { t } from "i18next";
import { Fragment } from "react/jsx-runtime";

interface DistributionStat {
  count: number;
  colorClass: string;
  label: string;
}

interface SourceLink {
  url: string;
  label: string;
}

interface KPIDetailsPanelProps {
  title: string;
  averageValue?: string | number;
  averageLabel?: string;
  distributionStats: DistributionStat[];
  missingDataCount?: number;
  missingDataLabel?: string;
  sourceLabel?: string;
  sourceLinks?: SourceLink[];
  className?: string;
  children?: React.ReactNode;
}

const STAT_COLOR_MAP: Record<string, string> = {
  "text-blue-3": "#4C9BE8",
  "text-pink-3": "#E8666A",
  "text-green-3": "#4CAF50",
  "text-orange-2": "#F5A623",
};

export default function KPIDetailsPanel({
  title,
  averageValue,
  averageLabel,
  distributionStats,
  missingDataCount,
  missingDataLabel,
  sourceLinks = [],
  className = "",
  children,
}: KPIDetailsPanelProps) {
  const sourceSection = sourceLinks.length > 0 && (
    <p className="text-gray-400 text-sm border-gray-700/50 italic">
      {t("municipalities.list.source")}{" "}
      {sourceLinks.map((link, index) => {
        const translationString = t(link.label, { returnObjects: false });

        const linkProps = {
          href: link.url,
          target: "_blank" as const,
          rel: "noopener noreferrer",
          className:
            "underline hover:text-gray-300 transition-colors duration-200",
          title: translationString,
        };

        return (
          <Fragment key={link.url}>
            {index > 0 && ", "}
            <a {...linkProps}>{translationString}</a>
          </Fragment>
        );
      })}
    </p>
  );

  const lowercaseFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  const totalDistribution = distributionStats.reduce(
    (sum, s) => sum + s.count,
    0,
  );

  return (
    <div
      className={`p-6 space-y-4 bg-white/5 rounded-level-2 shadow-lg ${className}`}
    >
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{title}</h2>

      {averageValue !== undefined && (
        <div className="p-4 bg-white/10 rounded-level-2">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
            {averageLabel}
          </p>
          <p className="text-3xl font-bold text-orange-2">{averageValue}</p>
        </div>
      )}

      {distributionStats.length > 0 && totalDistribution > 0 && (
        <div className="space-y-3">
          <div className="flex rounded-full overflow-hidden h-2.5">
            {distributionStats.map((stat, i) => {
              const pct = (stat.count / totalDistribution) * 100;
              const bg = STAT_COLOR_MAP[stat.colorClass] ?? "#888";
              return (
                <div
                  key={i}
                  style={{ width: `${pct}%`, backgroundColor: bg }}
                  title={`${stat.label}: ${stat.count}`}
                />
              );
            })}
          </div>
          <div className="space-y-1">
            {distributionStats.map((stat, index) => {
              const pct =
                totalDistribution > 0
                  ? ((stat.count / totalDistribution) * 100).toFixed(0)
                  : 0;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          STAT_COLOR_MAP[stat.colorClass] ?? "#888",
                      }}
                    />
                    <span className="text-white/70">
                      {lowercaseFirstLetter(stat.label)}
                    </span>
                  </div>
                  <span className={`font-semibold ${stat.colorClass}`}>
                    {stat.count}{" "}
                    <span className="text-white/40 font-normal">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {children}

      {typeof missingDataCount === "number" &&
        missingDataCount > 0 &&
        missingDataLabel && (
          <p className="text-gray-400 text-xs italic">
            {missingDataCount} {lowercaseFirstLetter(missingDataLabel)}
          </p>
        )}
      {sourceSection}
    </div>
  );
}

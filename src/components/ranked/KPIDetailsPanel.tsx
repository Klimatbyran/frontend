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
}

export default function KPIDetailsPanel({
  title,
  averageValue,
  averageLabel,
  distributionStats,
  missingDataCount,
  missingDataLabel,
  sourceLinks = [],
  className = "",
}: KPIDetailsPanelProps) {
  const sourceSection = sourceLinks.length > 0 && (
    <p className="text-gray-400 light:text-grey text-sm border-gray-700/50 light:border-grey/30 italic">
      {t("municipalities.list.source")}{" "}
      {sourceLinks.map((link, index) => (
        <Fragment key={link.url}>
          {index > 0 && ", "}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-300 light:hover:text-black-3 transition-colors duration-200"
            title={t(link.label)}
          >
            {t(link.label)}
          </a>
        </Fragment>
      ))}
    </p>
  );

  const lowercaseFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  return (
    <div
      className={`p-6 space-y-4 bg-white/5 light:bg-grey/20 rounded-level-2 shadow-lg ${className}`}
    >
      <h2 className="text-2xl font-semibold tracking-tight mb-4 text-white light:text-black-3">
        {title}
      </h2>
      <div className="mt-4 p-4 bg-white/10 light:bg-grey/30 rounded-level-2 space-y-2">
        {averageValue !== undefined && (
          <p className="flex items-center flex-wrap gap-2 text-lg text-white light:text-black-3">
            {averageLabel}{" "}
            <span className="text-orange-2 font-medium">{averageValue}</span>
          </p>
        )}

        {distributionStats.map((stat, index) => (
          <p key={index} className="text-white light:text-black-3">
            <span className={`font-medium ${stat.colorClass}`}>
              {stat.count}{" "}
            </span>
            {lowercaseFirstLetter(stat.label)}
          </p>
        ))}

        {typeof missingDataCount === "number" &&
          missingDataCount > 0 &&
          missingDataLabel && (
            <p className="text-gray-400 light:text-grey text-sm italic">
              {missingDataCount} {lowercaseFirstLetter(missingDataLabel)}
            </p>
          )}
      </div>
      {sourceSection}
    </div>
  );
}

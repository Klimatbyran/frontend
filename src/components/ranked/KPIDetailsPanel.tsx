import { t } from "i18next";
import { Trans } from "react-i18next";
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
    <p className="text-gray-400 text-sm border-gray-700/50 italic">
      {t("municipalities.list.source")}{" "}
      {sourceLinks.map((link, index) => {
        const translationKey = link.label;
        const translationString = t(translationKey, { returnObjects: false });
        const hasComponents = typeof translationString === "string" && translationString.includes("<0>");
        
        return (
          <Fragment key={link.url}>
            {index > 0 && ", "}
            {hasComponents ? (
              <Trans
                i18nKey={translationKey}
                components={[
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-300 transition-colors duration-200"
                    title={translationString.replace(/<[^>]*>/g, "")}
                  />,
                ]}
              />
            ) : (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-300 transition-colors duration-200"
                title={translationString}
              >
                {translationString}
              </a>
            )}
          </Fragment>
        );
      })}
    </p>
  );

  const lowercaseFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  return (
    <div
      className={`p-6 space-y-4 bg-white/5 rounded-level-2 shadow-lg ${className}`}
    >
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{title}</h2>
      <div className="mt-4 p-4 bg-white/10 rounded-level-2 space-y-2">
        {averageValue !== undefined && (
          <p className="flex items-center flex-wrap gap-2 text-lg">
            {averageLabel}{" "}
            <span className="text-orange-2 font-medium">{averageValue}</span>
          </p>
        )}

        {distributionStats.map((stat, index) => (
          <p key={index}>
            <span className={`font-medium ${stat.colorClass}`}>
              {stat.count}{" "}
            </span>
            {lowercaseFirstLetter(stat.label)}
          </p>
        ))}

        {typeof missingDataCount === "number" &&
          missingDataCount > 0 &&
          missingDataLabel && (
            <p className="text-gray-400 text-sm italic">
              {missingDataCount} {lowercaseFirstLetter(missingDataLabel)}
            </p>
          )}
      </div>
      {sourceSection}
    </div>
  );
}

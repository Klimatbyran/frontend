import { t } from "i18next";
import { Trans } from "react-i18next";
import { KPIValue } from "@/types/municipality";

interface KPIDetailsPanelProps {
  selectedKPI: KPIValue;
  average: number;
  aboveAverageCount: number;
  belowAverageCount: number;
  nullValues: number;
}

export default function KPIDetailsPanel({
  selectedKPI,
  average,
  aboveAverageCount,
  belowAverageCount,
  nullValues,
}: KPIDetailsPanelProps) {
  return (
    <div className="p-6 space-y-4 bg-white/5 rounded-level-2 shadow-lg">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        {t(`municipalities.list.kpis.${selectedKPI.key}.label`)}
      </h2>
      <div className="mt-4 p-4 bg-white/10 rounded-level-2 space-y-2">
        <p className="flex items-center gap-2 text-lg">
          {t("municipalities.list.insights.keyStatistics.average")}{" "}
          <span className="text-orange-2 font-medium">
            {average.toFixed(1) + selectedKPI.unit}
          </span>
        </p>
        {[
          {
            count: aboveAverageCount,
            colorClass: selectedKPI.higherIsBetter
              ? "text-blue-3"
              : "text-pink-3",
            translationKey:
              "municipalities.list.insights.keyStatistics.distributionAbove",
          },
          {
            count: belowAverageCount,
            colorClass: selectedKPI.higherIsBetter
              ? "text-pink-3"
              : "text-blue-3",
            translationKey:
              "municipalities.list.insights.keyStatistics.distributionBelow",
          },
        ].map(({ count, colorClass, translationKey }) => (
          <p key={translationKey} className="mt-2">
            <span className={`font-medium ${colorClass}`}>{count} </span>
            {t(translationKey)}
          </p>
        ))}
        {nullValues > 0 && (
          <p className="text-gray-400 text-sm italic">
            {nullValues}{" "}
            {t(`municipalities.list.kpis.${selectedKPI.key}.nullValues`).toLowerCase()}
          </p>
        )}
      </div>
      <p className="text-gray-400 text-sm border-gray-700/50 italic">
        {t("municipalities.list.source")}{" "}
        <Trans
          i18nKey={`municipalities.list.kpis.${selectedKPI.key}.source`}
          components={selectedKPI.sourceUrls.map((url, index) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300 transition-colors duration-200"
              title={t(`municipalities.list.kpis.${selectedKPI.key}.source`)
                .split(",")
                [index]?.trim()}
            />
          ))}
        />
      </p>
    </div>
  );
}

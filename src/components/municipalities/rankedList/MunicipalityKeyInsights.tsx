import { t } from "i18next";
import { DataPoint } from "./MunicipalityInsightsPanel";

interface InsightStatisticsProps {
  average: number;
  minValue: number;
  maxValue: number;
  aboveAverageCount: number;
  belowAverageCount: number;
  selectedDataPoint: DataPoint;
}

export default function InsightStatistics({
  average,
  minValue,
  maxValue,
  aboveAverageCount,
  belowAverageCount,
  selectedDataPoint,
}: InsightStatisticsProps) {
  return (
    <div className="bg-white/10 rounded-level-2 p-8">
      <h3 className="text-white text-lg font-semibold mb-4">
        {t("municipalities.list.insights.keyStatistics.title")}
      </h3>
      <div className="space-y-3">
        <p className="text-white/70 text-sm">
          {t("municipalities.list.insights.keyStatistics.average", {
            metric: selectedDataPoint.label,
          })}
        </p>
        <p className="text-white text-2xl font-bold">
          {!isNaN(average) ? average.toFixed(1) : "0"}
          {selectedDataPoint.unit}
        </p>
        <div>
          <p className="text-white/70 text-sm">
            {t("municipalities.list.insights.keyStatistics.range.label")}
          </p>
          <p className="text-white text-2xl font-bold">
            {t("municipalities.list.insights.keyStatistics.range.fromTo", {
              min: minValue.toFixed(1) + selectedDataPoint.unit,
              max: maxValue.toFixed(1) + selectedDataPoint.unit,
            })}
          </p>
          <p className="text-white/50 text-xs mt-1">
            {t("municipalities.list.insights.keyStatistics.range.description")}
          </p>
        </div>
        <div>
          <p className="text-white/70 text-sm">
            {t("municipalities.list.insights.keyStatistics.distribution.label")}
          </p>
          <div className="space-y-1">
            <p className="text-white text-sm">
              {t(
                "municipalities.list.insights.keyStatistics.distribution.aboveAverage",
                {
                  count: aboveAverageCount,
                },
              )}
            </p>
            <p className="text-white text-sm">
              {t(
                "municipalities.list.insights.keyStatistics.distribution.belowAverage",
                {
                  count: belowAverageCount,
                },
              )}
            </p>
          </div>
          <p className="text-white/50 text-xs mt-1">
            {t(
              "municipalities.list.insights.keyStatistics.distribution.description",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

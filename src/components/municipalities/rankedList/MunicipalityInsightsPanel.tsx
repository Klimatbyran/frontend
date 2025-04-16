import { t } from "i18next";
import { KPIValue, Municipality } from "@/types/municipality";
import InsightsList from "./MunicipalityInsightsList";

interface InsightsPanelProps {
  municipalityData: Municipality[];
  selectedDataPoint: KPIValue;
}

function InsightsPanel({
  municipalityData,
  selectedDataPoint,
}: InsightsPanelProps) {
  if (!municipalityData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("municipalities.list.insights.noData.municipality")}
        </p>
      </div>
    );
  }

  const validData = municipalityData.filter(
    (m) =>
      typeof m[selectedDataPoint.key] === "number" &&
      !isNaN(m[selectedDataPoint.key] as number),
  );

  if (!validData.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("municipalities.list.insights.noData.metric", {
            metric: selectedDataPoint.label,
          })}
        </p>
      </div>
    );
  }

  const sortedData = [...validData].sort((a, b) =>
    selectedDataPoint.higherIsBetter
      ? (b[selectedDataPoint.key] as number) -
        (a[selectedDataPoint.key] as number)
      : (a[selectedDataPoint.key] as number) -
        (b[selectedDataPoint.key] as number),
  );

  const topMunicipalities = sortedData.slice(0, 5);
  const bottomMunicipalities = sortedData.slice(-5).reverse();

  const values = validData.map((m) => m[selectedDataPoint.key] as number);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;

  const aboveAverageCount = values.filter((val) => val > average).length;
  const belowAverageCount = values.filter((val) => val < average).length;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-4 md:p-8 h-full min-w-screen-lg flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-bold">{selectedDataPoint.detailedDescription}</p>
            <p>
              <span className="text-gray-400">
                {t("municipalities.list.insights.keyStatistics.average")}
              </span>{" "}
              <span className="text-white">
                {average.toFixed(1) + selectedDataPoint.unit}
              </span>
            </p>
            <p>
              {aboveAverageCount}{" "}
              <span className="text-gray-400">
                {t(
                  "municipalities.list.insights.keyStatistics.distributionAbove",
                )}
              </span>{" "}
              {belowAverageCount}{" "}
              <span className="text-gray-400">
                {t(
                  "municipalities.list.insights.keyStatistics.distributionBelow",
                )}
              </span>{" "}
            </p>
          </div>

          <InsightsList
            title={t(
              selectedDataPoint.higherIsBetter
                ? "municipalities.list.insights.topPerformers.titleTop"
                : "municipalities.list.insights.topPerformers.titleBest",
            )}
            municipalities={topMunicipalities}
            dataPointKey={selectedDataPoint.key}
            unit={selectedDataPoint.unit}
            textColor="text-green-3"
          />

          <InsightsList
            title={t("municipalities.list.insights.improvement.title")}
            municipalities={bottomMunicipalities}
            dataPointKey={selectedDataPoint.key}
            unit={selectedDataPoint.unit}
            textColor="text-pink-3"
          />
        </div>
      </div>
    </div>
  );
}

export default InsightsPanel;

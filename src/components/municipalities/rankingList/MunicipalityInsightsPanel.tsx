import { t } from "i18next";

interface Municipality {
  name: string;
  value: number;
  bicycleMetrePerCapita: number;
  historicalEmissionChangePercent: number;
  neededEmissionChangePercent: number;
  hitNetZero: string;
  budgetRunsOut: string;
  electricCarChangePercent: number;
  climatePlanYear: number;
  totalConsumptionEmission: number;
  electricVehiclePerChargePoints: number;
  procurementScore: string;
}

interface DataPoint {
  label: string;
  key: keyof Municipality;
  unit: string;
  description?: string;
  higherIsBetter: boolean;
}

interface InsightsPanelProps {
  municipalityData: Municipality[];
  selectedDataPoint: DataPoint;
}

function InsightsPanel({
  municipalityData,
  selectedDataPoint,
}: InsightsPanelProps) {
  if (!municipalityData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 h-full flex items-center justify-center">
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
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 h-full flex items-center justify-center">
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
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const aboveAverageCount = values.filter((val) => val > average).length;
  const belowAverageCount = values.filter((val) => val < average).length;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 h-full flex flex-col min-h-0">
      <h2 className="text-white text-2xl font-bold mb-6">
        {t("municipalities.list.insights.title")} - {selectedDataPoint.label}
      </h2>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <div className="space-y-6">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              {t("municipalities.list.insights.keyStatistics.title")}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-white/70 text-sm">
                  {t("municipalities.list.insights.keyStatistics.average", {
                    metric: selectedDataPoint.label,
                  })}
                </p>
                <p className="text-white text-2xl font-bold">
                  {!isNaN(average) ? average.toFixed(1) : "0"}
                  {selectedDataPoint.unit}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm">
                  {t("municipalities.list.insights.keyStatistics.range.label")}
                </p>
                <p className="text-white text-2xl font-bold">
                  {t(
                    "municipalities.list.insights.keyStatistics.range.fromTo",
                    {
                      min: minValue.toFixed(1) + selectedDataPoint.unit,
                      max: maxValue.toFixed(1) + selectedDataPoint.unit,
                    },
                  )}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {t(
                    "municipalities.list.insights.keyStatistics.range.description",
                  )}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm">
                  {t(
                    "municipalities.list.insights.keyStatistics.distribution.label",
                  )}
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

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              {t(
                selectedDataPoint.higherIsBetter
                  ? "insights.topPerformers.titleTop"
                  : "insights.topPerformers.titleBest",
              )}
            </h3>
            <div className="space-y-2">
              {topMunicipalities.map((municipality, index) => (
                <div
                  key={municipality.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">{index + 1}.</span>
                    <span className="text-blue-400">{municipality.name}</span>
                  </div>
                  <span className="text-blue-400 font-semibold">
                    {(municipality[selectedDataPoint.key] as number).toFixed(1)}
                    {selectedDataPoint.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              {t("municipalities.list.insights.improvement.title")}
            </h3>
            <div className="space-y-2">
              {bottomMunicipalities.map((municipality, index) => (
                <div
                  key={municipality.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">{index + 1}.</span>
                    <span className="text-red-400">{municipality.name}</span>
                  </div>
                  <span className="text-red-400 font-semibold">
                    {(municipality[selectedDataPoint.key] as number).toFixed(1)}
                    {selectedDataPoint.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightsPanel;

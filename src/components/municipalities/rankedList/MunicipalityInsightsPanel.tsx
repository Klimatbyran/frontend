import { t } from "i18next";
import { KPIValue, Municipality } from "@/types/municipality";
import InsightsList from "./MunicipalityInsightsList";
import KPIDetailsPanel from "./KPIDetailsPanel";

interface InsightsPanelProps {
  municipalityData: Municipality[];
  selectedKPI: KPIValue;
}

function InsightsPanel({ municipalityData, selectedKPI }: InsightsPanelProps) {
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
      typeof m[selectedKPI.key] === "number" &&
      !isNaN(m[selectedKPI.key] as number),
  );

  if (!validData.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("municipalities.list.insights.noData.metric", {
            metric: selectedKPI.label,
          })}
        </p>
      </div>
    );
  }

  const sortedData = [...validData].sort((a, b) =>
    selectedKPI.higherIsBetter
      ? (b[selectedKPI.key] as number) - (a[selectedKPI.key] as number)
      : (a[selectedKPI.key] as number) - (b[selectedKPI.key] as number),
  );

  const topMunicipalities = sortedData.slice(0, 5);
  const bottomMunicipalities = sortedData.slice(-5).reverse();

  const values = validData.map((m) => m[selectedKPI.key] as number);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;

  const aboveAverageCount = values.filter((val) => val > average).length;
  const belowAverageCount = values.filter((val) => val < average).length;
  const nullValues = municipalityData.filter(
    (m) => m[selectedKPI.key] === null || m[selectedKPI.key] === undefined,
  ).length;

  return (
    <div className="flex-1 overflow-y-auto min-h-0 pr-2">
      <div className="space-y-6">
        <KPIDetailsPanel
          selectedKPI={selectedKPI}
          average={average}
          aboveAverageCount={aboveAverageCount}
          belowAverageCount={belowAverageCount}
          nullValues={nullValues}
        />

        <InsightsList
          title={t(
            selectedKPI.higherIsBetter
              ? "municipalities.list.insights.topPerformers.titleTop"
              : "municipalities.list.insights.topPerformers.titleBest",
          )}
          municipalities={topMunicipalities}
          dataPointKey={selectedKPI.key}
          unit={selectedKPI.unit}
          textColor="text-blue-3"
        />

        <InsightsList
          title={t("municipalities.list.insights.improvement.title")}
          municipalities={bottomMunicipalities}
          dataPointKey={selectedKPI.key}
          unit={selectedKPI.unit}
          textColor="text-pink-3"
        />
      </div>
    </div>
  );
}

export default InsightsPanel;

import { t } from "i18next";
import { KPIValue, Municipality, getSortedMunicipalKPIValues } from "@/types/municipality";
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

  const sortedData = getSortedMunicipalKPIValues(municipalityData, selectedKPI);

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
      <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
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
          totalCount={municipalityData.length}
          dataPointKey={selectedKPI.key}
          unit={selectedKPI.unit}
          nullValues={selectedKPI.nullValues}
          textColor="text-blue-3"
        />

        <InsightsList
          title={t("municipalities.list.insights.improvement.title")}
          municipalities={bottomMunicipalities}
          totalCount={municipalityData.length}
          isBottomRanking={true}
          dataPointKey={selectedKPI.key}
          unit={selectedKPI.unit}
          nullValues={selectedKPI.nullValues}
          textColor="text-pink-3"
        />
      </div>
    </div>
  );
}

export default InsightsPanel;

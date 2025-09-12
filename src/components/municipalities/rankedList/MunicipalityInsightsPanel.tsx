import { t } from "i18next";
import { KPIValue, Municipality } from "@/types/municipality";
import InsightsList from "./MunicipalityInsightsList";
import KPIDetailsPanel from "./KPIDetailsPanel";
import { getSortedMunicipalKPIValues } from "@/utils/data/sorting";

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

  const validData = municipalityData.filter((m) => {
    const value = m[selectedKPI.key];

    // Handle boolean values if KPI is binary
    if (selectedKPI.isBoolean) {
      return typeof value === "boolean";
    }

    // Handle numeric values (existing logic)
    return typeof value === "number" && !isNaN(value as number);
  });

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

  const values = validData.map((m) => {
    const value = m[selectedKPI.key];
    // Convert boolean to number for calculations if KPI is binary
    if (selectedKPI.isBoolean && typeof value === "boolean") {
      return value ? 1 : 0;
    }
    return value as number;
  });
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;

  // For boolean KPIs, these counts have a different meaning
  const aboveAverageCount = selectedKPI.isBoolean
    ? values.filter((val) => val > 0).length // Count of "true" values
    : values.filter((val) => val > average).length;

  const belowAverageCount = selectedKPI.isBoolean
    ? values.filter((val) => val === 0).length // Count of "false" values
    : values.filter((val) => val < average).length;
  const nullValues = municipalityData.filter(
    (m) => m[selectedKPI.key] === null || m[selectedKPI.key] === undefined,
  ).length;

  return (
    <div className="flex-1 overflow-y-auto min-h-0 pr-2">
      <div
        className={`${!selectedKPI.isBoolean ? "space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6" : ""} `}
      >
        <KPIDetailsPanel
          selectedKPI={selectedKPI}
          average={average}
          aboveAverageCount={aboveAverageCount}
          belowAverageCount={belowAverageCount}
          nullValues={nullValues}
        />

        {!selectedKPI.isBoolean && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export default InsightsPanel;

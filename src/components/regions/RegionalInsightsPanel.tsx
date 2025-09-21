import { t } from "i18next";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import KPIDetailsPanel from "../ranked/KPIDetailsPanel";
import InsightsList from "../ranked/InsightsList";
import { Region } from "@/types/region";
import { KPIValue } from "@/types/entity-rankings";

interface InsightsPanelProps {
  regionData: Region[];
  selectedKPI: KPIValue;
}

function RegionalInsightsPanel({
  regionData,
  selectedKPI,
}: InsightsPanelProps) {
  if (!regionData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">{t("noData")}</p>
      </div>
    );
  }

  const validData = regionData.filter((m) => {
    const value = m[selectedKPI.key as keyof Region];

    // Handle boolean values if KPI is binary
    if (selectedKPI.isBoolean) {
      return typeof value === "boolean";
    }

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

  const sortedData = getSortedEntityKPIValues(regionData, selectedKPI);

  const topMunicipalities = sortedData.slice(0, 5);
  const bottomMunicipalities = sortedData.slice(-5).reverse();

  const values = validData.map((m) => {
    const value = m[selectedKPI.key as keyof Region];
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

  const nullValues = regionData.filter(
    (m) =>
      m[selectedKPI.key as keyof Region] === null ||
      m[selectedKPI.key as keyof Region] === undefined,
  ).length;

  // Adapt the data for the new KPIDetailsPanel interface
  const distributionStats = [
    {
      count: aboveAverageCount,
      colorClass: "text-blue-3",
      label: selectedKPI.isBoolean
        ? selectedKPI.booleanLabels?.true || t("yes")
        : t("municipalities.list.insights.keyStatistics.distributionAbove"),
    },
    {
      count: belowAverageCount,
      colorClass: "text-pink-3",
      label: selectedKPI.isBoolean
        ? selectedKPI.booleanLabels?.false || t("no")
        : t("municipalities.list.insights.keyStatistics.distributionBelow"),
    },
  ];

  // Format the average value for display
  const formattedAverage = !selectedKPI.isBoolean
    ? `${average.toFixed(1)}${selectedKPI.unit || ""}`
    : undefined;

  const sourceLinks =
    selectedKPI.sourceUrls?.map((url, i) => ({
      url,
      label: Array.isArray(selectedKPI.source)
        ? selectedKPI.source[i] || ""
        : selectedKPI.source || "",
    })) || [];

  return (
    <div className="flex-1 overflow-y-auto min-h-0 pr-2">
      <div
        className={`${!selectedKPI.isBoolean ? "space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6" : ""} `}
      >
        <KPIDetailsPanel
          title={selectedKPI.label}
          averageValue={formattedAverage}
          averageLabel={t("municipalities.list.insights.keyStatistics.average")}
          distributionStats={distributionStats}
          missingDataCount={nullValues}
          missingDataLabel={selectedKPI.nullValues}
          sourceLinks={sourceLinks}
        />

        {!selectedKPI.isBoolean && (
          <>
            <InsightsList<Region>
              title={t(
                selectedKPI.higherIsBetter
                  ? "municipalities.list.insights.topPerformers.titleTop"
                  : "municipalities.list.insights.topPerformers.titleBest",
              )}
              entities={topMunicipalities}
              totalCount={regionData.length}
              dataPointKey={selectedKPI.key as keyof Region}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-blue-3"
              entityType="municipalities"
              nameKey="name"
            />
            <InsightsList
              title={t("municipalities.list.insights.improvement.title")}
              entities={bottomMunicipalities}
              totalCount={regionData.length}
              isBottomRanking={true}
              dataPointKey={selectedKPI.key as keyof Region}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-pink-3"
              entityType="municipalities"
              nameKey="name"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default RegionalInsightsPanel;

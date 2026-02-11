import { t } from "i18next";
import { Municipality } from "@/types/municipality";
import { KPIValue } from "@/types/rankings";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  calculateEntityStatistics,
  createSourceLinks,
} from "@/utils/insights/rankedListUtils";
import KPIDetailsPanel from "../../ranked/KPIDetailsPanel";
import InsightsList from "../../ranked/InsightsList";

interface InsightsPanelProps {
  municipalityData: Municipality[];
  selectedKPI: KPIValue<Municipality>;
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

  // Calculate statistics using shared utility
  const statistics = calculateEntityStatistics(
    municipalityData,
    selectedKPI,
    (m) => m[selectedKPI.key],
  );

  if (!statistics.validData.length) {
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

  const sortedData = getSortedEntityKPIValues(municipalityData, selectedKPI);

  const topMunicipalities = sortedData.slice(0, 5);
  const bottomMunicipalities = sortedData.slice(-5).reverse();

  const sourceLinks = createSourceLinks(selectedKPI);

  const entityPlural = t("header.municipalities").toLowerCase();

  return (
    <div className="flex-1 overflow-y-auto min-h-0 pr-2">
      <div
        className={`${!selectedKPI.isBoolean ? "space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6" : ""} `}
      >
        <KPIDetailsPanel
          title={selectedKPI.label}
          averageValue={statistics.formattedAverage}
          averageLabel={t("municipalities.list.insights.keyStatistics.average")}
          distributionStats={statistics.distributionStats}
          missingDataCount={statistics.nullCount}
          missingDataLabel={selectedKPI.nullValues}
          sourceLinks={sourceLinks}
        />

        {!selectedKPI.isBoolean && (
          <>
            <InsightsList<Municipality>
              title={t(
                selectedKPI.higherIsBetter
                  ? "rankedInsights.titleTop"
                  : "rankedInsights.titleBest",
                { entityPlural },
              )}
              entities={topMunicipalities}
              totalCount={municipalityData.length}
              dataPointKey={selectedKPI.key as keyof Municipality}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-blue-3"
              entityType="municipalities"
              nameKey="name"
            />
            <InsightsList
              title={t("rankedInsights.titleWorst", {
                entityPlural,
              })}
              entities={bottomMunicipalities}
              totalCount={municipalityData.length}
              isBottomRanking
              dataPointKey={selectedKPI.key as keyof Municipality}
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

export default InsightsPanel;

import { t } from "i18next";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import { Region } from "@/types/region";
import { KPIValue } from "@/types/rankings";
import {
  calculateEntityStatistics,
  createSourceLinks,
} from "@/utils/insights/rankedListUtils";
import InsightsList from "../ranked/InsightsList";
import KPIDetailsPanel from "../ranked/KPIDetailsPanel";

interface InsightsPanelProps {
  regionsData: Region[];
  selectedKPI: KPIValue<Region>;
}

function RegionalInsightsPanel({
  regionsData: regionData,
  selectedKPI,
}: InsightsPanelProps) {
  if (!regionData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">{t("noData")}</p>
      </div>
    );
  }

  // Calculate statistics using shared utility
  const statistics = calculateEntityStatistics(
    regionData,
    selectedKPI,
    (m) => m[selectedKPI.key as keyof Region],
    "regions",
  );

  if (!statistics.validData.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("noData", {
            metric: selectedKPI.label,
          })}
        </p>
      </div>
    );
  }

  const sortedData = getSortedEntityKPIValues(regionData, selectedKPI);

  const topMunicipalities = sortedData.slice(0, 5);
  const bottomMunicipalities = sortedData.slice(-5).reverse();

  const sourceLinks = createSourceLinks(selectedKPI);

  const entityPlural = t("header.regions").toLowerCase();

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
            <InsightsList<Region>
              title={t(
                selectedKPI.higherIsBetter
                  ? "rankedInsights.titleTop"
                  : "rankedInsights.titleBest",
                { entityPlural },
              )}
              entities={topMunicipalities}
              totalCount={regionData.length}
              dataPointKey={selectedKPI.key as keyof Region}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-blue-3"
              entityType="regions"
              nameKey="name"
            />
            <InsightsList
              title={t("rankedInsights.titleWorst", {
                entityPlural,
              })}
              entities={bottomMunicipalities}
              totalCount={regionData.length}
              isBottomRanking
              dataPointKey={selectedKPI.key as keyof Region}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-pink-3"
              entityType="regions"
              nameKey="name"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default RegionalInsightsPanel;

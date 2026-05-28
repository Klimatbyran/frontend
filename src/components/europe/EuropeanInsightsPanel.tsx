import { t } from "i18next";
import { KPIValue } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";
import KPIDetailsPanel from "@/components/ranked/KPIDetailsPanel";
import InsightsList from "@/components/ranked/InsightsList";
import {
  calculateEntityStatistics,
  createSourceLinks,
} from "@/utils/insights/rankedListUtils";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";

interface InsightsPanelProps {
  countriesData: EuropeanCountry[];
  selectedKPI: KPIValue<EuropeanCountry>;
}

function EuropeanInsightsPanel({
  countriesData: countryData,
  selectedKPI,
}: InsightsPanelProps) {
  if (!countryData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">{t("noData")}</p>
      </div>
    );
  }

  // Calculate statistics using shared utility
  const statistics = calculateEntityStatistics(
    countryData,
    selectedKPI,
    (c) => c[selectedKPI.key as keyof EuropeanCountry],
    "countries",
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

  const sortedData = getSortedEntityKPIValues(countryData, selectedKPI);

  const topCountries = sortedData.slice(0, 5);
  const bottomCountries = sortedData.slice(-5).reverse();

  const sourceLinks = createSourceLinks(selectedKPI);

  const entityPlural = t("header.countries").toLowerCase();

  return (
    <div className="flex-1 overflow-y-auto min-h-0 pr-2">
      <div
        className={`${!selectedKPI.isBoolean ? "space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6" : ""} `}
      >
        <KPIDetailsPanel
          title={selectedKPI.label}
          averageValue={statistics.formattedAverage}
          averageLabel={t("rankedInsights.average")}
          distributionStats={statistics.distributionStats}
          missingDataCount={statistics.nullCount}
          missingDataLabel={selectedKPI.nullValues}
          sourceLinks={sourceLinks}
        />

        {!selectedKPI.isBoolean && (
          <>
            <InsightsList<EuropeanCountry>
              title={t(
                selectedKPI.higherIsBetter
                  ? "rankedInsights.titleTop"
                  : "rankedInsights.titleBest",
                { entityPlural },
              )}
              entities={topCountries}
              totalCount={countryData.length}
              dataPointKey={selectedKPI.key as keyof EuropeanCountry}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-blue-3"
              entityType="europe"
              nameKey="name"
            />
            <InsightsList
              title={t("rankedInsights.titleWorst", {
                entityPlural,
              })}
              entities={bottomCountries}
              totalCount={countryData.length}
              isBottomRanking
              dataPointKey={selectedKPI.key as keyof EuropeanCountry}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-pink-3"
              entityType="europe"
              nameKey="name"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default EuropeanInsightsPanel;

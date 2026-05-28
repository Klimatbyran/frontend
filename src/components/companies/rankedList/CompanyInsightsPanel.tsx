import { t } from "i18next";
import {
  CompanyWithKPIs,
  CompanyKPIValue,
} from "@/hooks/companies/useCompanyKPIs";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  calculateEntityStatistics,
  createSourceLinks,
} from "@/utils/insights/rankedListUtils";
import KPIDetailsPanel from "../../ranked/KPIDetailsPanel";
import InsightsList from "../../ranked/InsightsList";

interface InsightsPanelProps {
  companyData: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
}

function CompanyInsightsPanel({
  companyData,
  selectedKPI,
}: InsightsPanelProps) {
  if (!companyData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("companies.list.insights.noData.company")}
        </p>
      </div>
    );
  }

  // Calculate statistics using shared utility
  const statistics = calculateEntityStatistics(
    companyData,
    selectedKPI,
    (c) => c[selectedKPI.key],
    "companies",
  );

  const minNrOfCompaniesToShowDetails = 10;

  if (statistics.validData.length < minNrOfCompaniesToShowDetails) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("companies.list.insights.noData.metric", {
            metric: selectedKPI.label,
          })}
        </p>
      </div>
    );
  }

  // Use statistics.validData which already filters out null/undefined values
  const sortedValidData = getSortedEntityKPIValues(
    statistics.validData,
    selectedKPI,
  );

  const topCompanies = sortedValidData.slice(0, 5);
  // For "needs improvement", take the worst 5 from valid data only, excludes unknowns and nulls
  const bottomCompanies = sortedValidData.slice(-5).reverse();

  const sourceLinks = createSourceLinks(selectedKPI);

  const entityPlural = t("header.companies").toLowerCase();

  return (
    <div className="flex-1 overflow-y-auto min-h-0 pr-2">
      <div
        className={`${!selectedKPI.isBoolean ? "space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6" : ""} `}
      >
        <KPIDetailsPanel
          title={selectedKPI.label}
          averageValue={statistics.formattedAverage}
          averageLabel={t("companies.list.insights.keyStatistics.average")}
          distributionStats={statistics.distributionStats}
          missingDataCount={statistics.nullCount}
          missingDataLabel={selectedKPI.nullValues}
          sourceLinks={sourceLinks}
        />

        {!selectedKPI.isBoolean && (
          <>
            <InsightsList
              title={t(
                selectedKPI.higherIsBetter
                  ? "rankedInsights.titleTop"
                  : "rankedInsights.titleBest",
                { entityPlural },
              )}
              entities={topCompanies}
              totalCount={companyData.length}
              dataPointKey={selectedKPI.key}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-blue-3"
              entityType="companies"
              nameKey="name"
            />
            <InsightsList
              title={t("rankedInsights.titleWorst", {
                entityPlural,
              })}
              entities={bottomCompanies}
              totalCount={companyData.length}
              isBottomRanking
              dataPointKey={selectedKPI.key}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-pink-3"
              entityType="companies"
              nameKey="name"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default CompanyInsightsPanel;

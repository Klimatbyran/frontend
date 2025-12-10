import { t } from "i18next";
import {
  CompanyWithKPIs,
  CompanyKPIValue,
} from "@/hooks/companies/useCompanyKPIs";
import InsightsList from "../../ranked/InsightsList";
import KPIDetailsPanel from "../../ranked/KPIDetailsPanel";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  calculateEntityStatistics,
  createSourceLinks,
} from "@/utils/insights/rankedListUtils";

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
      <div className="dark:bg-white/5 bg-grey/10 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="dark:text-white text-black-3 text-lg">
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
  );

  if (!statistics.validData.length) {
    return (
      <div className="dark:bg-white/5 bg-grey/10 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="dark:text-white text-black-3 text-lg">
          {t("companies.list.insights.noData.metric", {
            metric: selectedKPI.label,
          })}
        </p>
      </div>
    );
  }

  const sortedData = getSortedEntityKPIValues(companyData, selectedKPI);

  // Use statistics.validData which already filters out null/undefined values
  const sortedValidData = getSortedEntityKPIValues(
    statistics.validData,
    selectedKPI,
  );

  const topCompanies = sortedData.slice(0, 5);
  // For "needs improvement", take the worst 5 from valid data only, excludes unknowns and nulls
  const bottomCompanies = sortedValidData.slice(-5).reverse();

  const sourceLinks = createSourceLinks(selectedKPI);

  return (
    <div className="flex-1 overflow-y-auto min-h-0 pr-2 dark:bg-black-2 bg-grey/10 rounded-level-2 p-6">
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
            <InsightsList<CompanyWithKPIs>
              title={t(
                selectedKPI.higherIsBetter
                  ? "companies.list.insights.topPerformers.titleTop"
                  : "companies.list.insights.topPerformers.titleBest",
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
              title={t("companies.list.insights.improvement.title")}
              entities={bottomCompanies}
              totalCount={companyData.length}
              isBottomRanking={true}
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

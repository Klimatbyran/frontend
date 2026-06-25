import { useTranslation } from "react-i18next";
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
import { KPIDistributionChart } from "../../ranked/KPIDistributionChart";

interface InsightsPanelProps {
  companyData: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
}

const TOP_N = 10;
const MIN_COMPANIES = 10;

function CompanyInsightsPanel({
  companyData,
  selectedKPI,
}: InsightsPanelProps) {
  const { t } = useTranslation();

  if (!companyData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("companies.list.insights.noData.company")}
        </p>
      </div>
    );
  }

  const statistics = calculateEntityStatistics(
    companyData,
    selectedKPI,
    (c) => c[selectedKPI.key],
    "companies",
  );

  if (statistics.validData.length < MIN_COMPANIES) {
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

  const sortedValidData = getSortedEntityKPIValues(
    statistics.validData,
    selectedKPI,
  );
  const topCompanies = sortedValidData.slice(0, TOP_N);
  const bottomCompanies = sortedValidData.slice(-TOP_N).reverse();
  const sourceLinks = createSourceLinks(selectedKPI);
  const entityPlural = t("header.companies").toLowerCase();

  return (
    <div>
      <div
        className={
          !selectedKPI.isBoolean
            ? "grid grid-cols-1 md:grid-cols-3 gap-6"
            : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }
      >
        <KPIDetailsPanel
          title={selectedKPI.label}
          averageValue={statistics.formattedAverage}
          averageLabel={t("companies.list.insights.keyStatistics.average")}
          distributionStats={statistics.distributionStats}
          missingDataCount={statistics.nullCount}
          missingDataLabel={selectedKPI.nullValues}
          sourceLinks={sourceLinks}
        >
          <KPIDistributionChart<CompanyWithKPIs>
            data={companyData}
            selectedKPI={selectedKPI}
            average={!selectedKPI.isBoolean ? statistics.average : undefined}
            entityLabel={entityPlural}
          />
        </KPIDetailsPanel>

        {!selectedKPI.isBoolean ? (
          <>
            <InsightsList<CompanyWithKPIs>
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
              barColor="#4C9BE8"
              entityType="companies"
              nameKey="name"
              showBars
            />
            <InsightsList<CompanyWithKPIs>
              title={t("rankedInsights.titleWorst", { entityPlural })}
              entities={bottomCompanies}
              totalCount={companyData.length}
              isBottomRanking
              dataPointKey={selectedKPI.key}
              unit={selectedKPI.unit}
              nullValues={selectedKPI.nullValues}
              textColor="text-pink-3"
              barColor="#E8666A"
              entityType="companies"
              nameKey="name"
              showBars
            />
          </>
        ) : (
          <div className="bg-white/5 rounded-level-2 p-6 flex flex-col justify-center gap-6">
            <h3 className="text-lg font-semibold text-white">
              {t("municipalities.list.insights.distribution.summary")}
            </h3>
            {statistics.distributionStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="text-4xl font-bold"
                  style={{ color: i === 0 ? "#4C9BE8" : "#E8666A" }}
                >
                  {stat.count}
                </div>
                <div className="text-white/70 text-sm leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyInsightsPanel;

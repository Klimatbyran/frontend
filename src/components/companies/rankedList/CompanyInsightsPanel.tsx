import { useTranslation } from "react-i18next";
import {
  CompanyWithKPIs,
  CompanyKPIValue,
} from "@/hooks/companies/useCompanyKPIs";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  calculateEntityStatistics,
  createDefaultColorGetter,
  createSourceLinks,
  buildPerformerProps,
  TOP_N,
} from "@/utils/insights/rankedListUtils";
import KPIDetailsPanel from "../../ranked/KPIDetailsPanel";
import InsightsList from "../../ranked/InsightsList";
import { KPIDistributionChart } from "../../ranked/KPIDistributionChart";
import {
  DistributionBox,
  BooleanSummaryBox,
} from "../../ranked/InsightsPanelParts";

type InsightsPanelSection = "stats" | "top" | "bottom" | "distribution";

interface InsightsPanelProps {
  companyData: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
  section?: InsightsPanelSection;
}

const MIN_COMPANIES = 2;

function InsightsEmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
      <p className="text-white text-lg">{message}</p>
    </div>
  );
}

function getCompanyInsightsData(
  companyData: CompanyWithKPIs[],
  selectedKPI: CompanyKPIValue,
  t: ReturnType<typeof useTranslation>["t"],
) {

  const statistics = calculateEntityStatistics(
    companyData,
    selectedKPI,
    (company) => company[selectedKPI.key],
    "companies",
  );

  const sortedValidData = getSortedEntityKPIValues(
    statistics.validData,
    selectedKPI,
  );
  const topCompanies = sortedValidData.slice(0, TOP_N);
  const bottomCompanies = sortedValidData.slice(-TOP_N).reverse();
  const sourceLinks = createSourceLinks(selectedKPI);
  const entityPlural = t("header.companies").toLowerCase();
  const unit = selectedKPI.unit || "";
  const { topPerformer, bottomPerformer } = buildPerformerProps(
    sortedValidData,
    { key: selectedKPI.key, unit, isBoolean: selectedKPI.isBoolean },
  );
  const colorItem = selectedKPI.createKPIColorGetter
    ? selectedKPI.createKPIColorGetter(companyData)
    : createDefaultColorGetter(
        companyData,
        selectedKPI.key,
        selectedKPI.isBoolean,
        selectedKPI.higherIsBetter,
      );

  return {
    t,
    statistics,
    sortedValidData,
    topCompanies,
    bottomCompanies,
    sourceLinks,
    entityPlural,
    topPerformer,
    bottomPerformer,
    colorItem,
  };
}

function CompanyInsightsPanels({
  companyData,
  selectedKPI,
  insightsData,
}: {
  companyData: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
  insightsData: ReturnType<typeof getCompanyInsightsData>;
}) {
  const {
    t,
    statistics,
    topCompanies,
    bottomCompanies,
    sourceLinks,
    entityPlural,
    topPerformer,
    bottomPerformer,
    colorItem,
  } = insightsData;

  const booleanSummary = (
    <BooleanSummaryBox distributionStats={statistics.distributionStats} />
  );

  return {
    stats: (
      <KPIDetailsPanel
        title={selectedKPI.label}
        description={selectedKPI.detailedDescription || selectedKPI.description}
        isBoolean={selectedKPI.isBoolean}
        higherIsBetter={selectedKPI.higherIsBetter}
        averageValue={statistics.formattedAverage}
        averageLabel={t("companies.list.insights.keyStatistics.average")}
        topPerformer={topPerformer}
        bottomPerformer={bottomPerformer}
        chart={
          selectedKPI.isBoolean ? (
            <KPIDistributionChart
              data={companyData}
              selectedKPI={selectedKPI}
              entityLabel={entityPlural}
            />
          ) : undefined
        }
        distributionStats={statistics.distributionStats}
        sourceLinks={sourceLinks}
      />
    ),
    distribution: (
      <DistributionBox
        entityType="companies"
        chart={
          <KPIDistributionChart<CompanyWithKPIs>
            data={companyData}
            selectedKPI={selectedKPI}
            average={!selectedKPI.isBoolean ? statistics.average : undefined}
            entityLabel={entityPlural}
          />
        }
      />
    ),
    top: !selectedKPI.isBoolean ? (
      <InsightsList<CompanyWithKPIs>
        title={t(
          selectedKPI.higherIsBetter
            ? "rankedInsights.titleTop"
            : "rankedInsights.titleBest",
          { nrOfEntities: topCompanies.length, entityPlural },
        )}
        entities={topCompanies}
        totalCount={statistics.validData.length}
        dataPointKey={selectedKPI.key}
        unit={selectedKPI.unit}
        nullValues={selectedKPI.nullValues}
        entityType="companies"
        nameKey="name"
        showBars
        colorItem={colorItem}
      />
    ) : (
      booleanSummary
    ),
    bottom: !selectedKPI.isBoolean ? (
      <InsightsList<CompanyWithKPIs>
        title={t("rankedInsights.titleWorst", {
          nrOfEntities: bottomCompanies.length,
          entityPlural,
        })}
        entities={bottomCompanies}
        totalCount={statistics.validData.length}
        isBottomRanking
        dataPointKey={selectedKPI.key}
        unit={selectedKPI.unit}
        nullValues={selectedKPI.nullValues}
        entityType="companies"
        nameKey="name"
        showBars
        colorItem={colorItem}
      />
    ) : null,
  };
}

function CompanyInsightsPanel({
  companyData,
  selectedKPI,
  section,
}: InsightsPanelProps) {
  const { t } = useTranslation();

  if (!companyData?.length) {
    return (
      <InsightsEmptyState
        message={t("companies.list.insights.noData.company")}
      />
    );
  }

  const insightsData = getCompanyInsightsData(companyData, selectedKPI, t);

  if (insightsData.statistics.validData.length < MIN_COMPANIES) {
    return (
      <InsightsEmptyState
        message={t("companies.list.insights.noData.metric", {
          metric: selectedKPI.label,
        })}
      />
    );
  }

  const panels = CompanyInsightsPanels({
    companyData,
    selectedKPI,
    insightsData,
  });

  if (section === "stats") return panels.stats;
  if (section === "distribution") return panels.distribution;
  if (section === "top") return panels.top;
  return panels.bottom ?? panels.stats;
}

export default CompanyInsightsPanel;

import { COLORS } from "@/lib/colors";
import { useTranslation } from "react-i18next";
import type { OverviewViewMode } from "@/components/ranked/OverviewSplitLayout";
import {
  CompanyWithKPIs,
  CompanyKPIValue,
} from "@/hooks/companies/useCompanyKPIs";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  calculateEntityStatistics,
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
  viewMode?: OverviewViewMode;
}

const MIN_COMPANIES = 2;

function CompanyInsightsPanel({
  companyData,
  selectedKPI,
  section,
  viewMode = "graph",
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
  const unit = selectedKPI.unit || "";

  const { topPerformer, bottomPerformer } = buildPerformerProps(
    sortedValidData,
    { key: selectedKPI.key, unit, isBoolean: selectedKPI.isBoolean },
  );

  const statsPanel = (
    <KPIDetailsPanel
      title={selectedKPI.label}
      description={selectedKPI.description}
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
      footerNote={
        viewMode === "graph"
          ? t(
              "companiesOverviewPage.visualizations.meetsParis.bubbleChart.sizeLegend",
            )
          : undefined
      }
    />
  );

  const distributionPanel = (
    <DistributionBox
      chart={
        <KPIDistributionChart<CompanyWithKPIs>
          data={companyData}
          selectedKPI={selectedKPI}
          average={!selectedKPI.isBoolean ? statistics.average : undefined}
          entityLabel={entityPlural}
        />
      }
    />
  );

  const booleanSummary = (
    <BooleanSummaryBox distributionStats={statistics.distributionStats} />
  );

  const topPanel = !selectedKPI.isBoolean ? (
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
      barColor={COLORS.blue3}
      entityType="companies"
      nameKey="name"
      showBars
    />
  ) : (
    booleanSummary
  );

  const bottomPanel = !selectedKPI.isBoolean ? (
    <InsightsList<CompanyWithKPIs>
      title={t("rankedInsights.titleWorst", { entityPlural })}
      entities={bottomCompanies}
      totalCount={companyData.length}
      isBottomRanking
      dataPointKey={selectedKPI.key}
      unit={selectedKPI.unit}
      nullValues={selectedKPI.nullValues}
      textColor="text-pink-3"
      barColor={COLORS.pink3}
      entityType="companies"
      nameKey="name"
      showBars
    />
  ) : null;

  if (section === "stats") return statsPanel;
  if (section === "distribution") return distributionPanel;
  if (section === "top") return topPanel;
  return bottomPanel ?? statsPanel;
}

export default CompanyInsightsPanel;

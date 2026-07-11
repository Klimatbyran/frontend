import { useTranslation } from "react-i18next";
import { getCompanyDetailPath } from "@/utils/companyRouting";
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
import { getTopParisEmissionsCompanies } from "@/utils/insights/meetsParisChartData";
import { DEFAULT_BOOLEAN_DATA_COLORS } from "@/utils/ui/colors";
import {
  DistributionBox,
  BooleanSummaryBox,
} from "../../ranked/InsightsPanelParts";

const MEETS_PARIS_KPI_KEY = "meetsParis";

type InsightsPanelSection = "stats" | "top" | "bottom" | "distribution";

interface InsightsPanelProps {
  companyData: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
  section?: InsightsPanelSection;
  /** Forces insight lists to remount when the active filter changes */
  listKey?: string;
}

const MIN_COMPANIES = 2;

function CompanyInsightsPanel({
  companyData,
  selectedKPI,
  section,
  listKey,
}: InsightsPanelProps) {
  const { t } = useTranslation();
  const kpiKey = String(selectedKPI.key);

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
            metric: t(`companies.list.kpis.${kpiKey}.label`),
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
    (company) => getCompanyDetailPath(company),
  );

  const colorItem = selectedKPI.createKPIColorGetter
    ? selectedKPI.createKPIColorGetter(companyData)
    : createDefaultColorGetter(
        companyData,
        selectedKPI.key,
        selectedKPI.isBoolean,
        selectedKPI.higherIsBetter,
      );

  const statsPanel = (
    <KPIDetailsPanel
      title={t(`companies.list.kpis.${kpiKey}.label`)}
      description={t(`companies.list.kpis.${kpiKey}.detailedDescription`, {
        defaultValue: t(`companies.list.kpis.${kpiKey}.description`),
      })}
      isBoolean={selectedKPI.isBoolean}
      higherIsBetter={selectedKPI.higherIsBetter}
      averageValue={statistics.formattedAverage}
      averageLabel={t("companies.list.insights.keyStatistics.average")}
      topPerformer={topPerformer}
      bottomPerformer={bottomPerformer}
      chart={
        selectedKPI.isBoolean ? (
          <KPIDistributionChart<CompanyWithKPIs>
            data={companyData}
            selectedKPI={selectedKPI}
            entityLabel={entityPlural}
            translationPrefix="companies.list"
          />
        ) : undefined
      }
      distributionStats={statistics.distributionStats}
      sourceLinks={sourceLinks}
    />
  );

  const distributionPanel = (
    <DistributionBox
      entityType="companies"
      chart={
        <KPIDistributionChart<CompanyWithKPIs>
          data={companyData}
          selectedKPI={selectedKPI}
          average={!selectedKPI.isBoolean ? statistics.average : undefined}
          entityLabel={entityPlural}
          translationPrefix="companies.list"
        />
      }
    />
  );

  const booleanSummary = (
    <BooleanSummaryBox distributionStats={statistics.distributionStats} />
  );

  const isMeetsParisKpi =
    selectedKPI.isBoolean && selectedKPI.key === MEETS_PARIS_KPI_KEY;

  const renderParisEmissionsList = (meetsParis: boolean) => {
    const { entities, unitScale } = getTopParisEmissionsCompanies(
      companyData,
      meetsParis,
    );

    if (entities.length === 0) {
      return (
        <div className="flex h-full items-center justify-center rounded-level-2 bg-black-2 p-8">
          <p className="text-lg text-white">
            {t("companies.list.insights.noData.metric", {
              metric: t(`companies.list.kpis.${kpiKey}.label`),
            })}
          </p>
        </div>
      );
    }

    return (
      <InsightsList<CompanyWithKPIs & { rankedEmissions: number }>
        key={
          listKey
            ? `${meetsParis ? "paris-yes" : "paris-no"}-${listKey}`
            : undefined
        }
        title={t(
          meetsParis
            ? "companiesOverviewPage.visualizations.meetsParis.topEmittersMeetingGoal"
            : "companiesOverviewPage.visualizations.meetsParis.topEmittersMissingGoal",
          {
            nrOfEntities: entities.length,
            entityPlural,
          },
        )}
        entities={entities}
        totalCount={entities.length}
        dataPointKey="rankedEmissions"
        unit={unitScale.unit}
        entityType="companies"
        nameKey="name"
        showBars
        colorItem={() =>
          meetsParis
            ? DEFAULT_BOOLEAN_DATA_COLORS.positive
            : DEFAULT_BOOLEAN_DATA_COLORS.negative
        }
      />
    );
  };

  const topPanel = isMeetsParisKpi ? (
    renderParisEmissionsList(true)
  ) : !selectedKPI.isBoolean ? (
    <InsightsList<CompanyWithKPIs>
      key={listKey ? `top-${listKey}` : undefined}
      title={t(
        selectedKPI.higherIsBetter
          ? "rankedInsights.titleTop"
          : "rankedInsights.titleBest",
        { nrOfEntities: topCompanies.length, entityPlural: entityPlural },
      )}
      entities={topCompanies}
      totalCount={statistics.validData.length}
      dataPointKey={selectedKPI.key}
      unit={selectedKPI.unit}
      nullValues={t(`companies.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
      entityType="companies"
      nameKey="name"
      showBars
      colorItem={colorItem}
    />
  ) : (
    booleanSummary
  );

  const bottomPanel = isMeetsParisKpi ? (
    renderParisEmissionsList(false)
  ) : !selectedKPI.isBoolean ? (
    <InsightsList<CompanyWithKPIs>
      key={listKey ? `bottom-${listKey}` : undefined}
      title={t("rankedInsights.titleWorst", {
        nrOfEntities: bottomCompanies.length,
        entityPlural: entityPlural,
      })}
      entities={bottomCompanies}
      totalCount={statistics.validData.length}
      isBottomRanking
      dataPointKey={selectedKPI.key}
      unit={selectedKPI.unit}
      nullValues={t(`companies.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
      entityType="companies"
      nameKey="name"
      showBars
      colorItem={colorItem}
    />
  ) : null;

  if (section === "stats") return statsPanel;
  if (section === "distribution") return distributionPanel;
  if (section === "top") return topPanel;
  return bottomPanel ?? statsPanel;
}

export default CompanyInsightsPanel;

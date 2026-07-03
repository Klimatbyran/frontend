import { Building2, TrendingDown, TrendingUp } from "lucide-react";
import type { ChartInsight } from "./useSectorChartInsights";
import {
  buildTopCompanyBars,
  buildTrendChangeBars,
  buildTrendInsight,
  countReportingCompanies,
  getComparableCompanyTrends,
  type SectorInsightsContext,
} from "./sectorChartInsightsShared";

function buildCompaniesInSectorInsight(
  t: SectorInsightsContext["t"],
  reportingCompanies: ReturnType<typeof countReportingCompanies>,
  pieChartData: SectorInsightsContext["pieChartData"],
  currentLanguage: SectorInsightsContext["currentLanguage"],
): ChartInsight {
  return {
    title: t("sectorsOverviewPage.insights.companiesInSector"),
    stat: String(reportingCompanies.length),
    statLabel: t("sectorsOverviewPage.insights.companiesReportingLabel"),
    description: t(
      "sectorsOverviewPage.insights.topEmittersInSectorDescription",
    ),
    bars: buildTopCompanyBars(pieChartData, currentLanguage),
    icon: Building2,
    iconColor: "text-blue-3",
    bgColor: "bg-blue-5",
  };
}

export function buildSectorSelectedInsights(
  context: SectorInsightsContext & { selectedSector: string },
): ChartInsight[] {
  const { t, companies, pieChartData, selectedSector, reportingYear, currentLanguage } =
    context;

  const reportingCompanies = countReportingCompanies(
    companies,
    reportingYear,
    selectedSector,
  );

  const comparableTrends = getComparableCompanyTrends(reportingCompanies);
  const reducingCount = comparableTrends.filter(
    (trend) => trend.changePercent < 0,
  ).length;
  const increasingCount = comparableTrends.filter(
    (trend) => trend.changePercent > 0,
  ).length;
  const comparableCount = comparableTrends.length;
  const reducingBars = buildTrendChangeBars(
    comparableTrends,
    "reducing",
    currentLanguage,
  );
  const increasingBars = buildTrendChangeBars(
    comparableTrends,
    "increasing",
    currentLanguage,
  );

  return [
    buildCompaniesInSectorInsight(
      t,
      reportingCompanies,
      pieChartData,
      currentLanguage,
    ),
    buildTrendInsight(
      t,
      {
        titleKey: "sectorsOverviewPage.insights.reducingEmissions",
        statLabelKey: "sectorsOverviewPage.insights.sinceBaseYear",
        topDescriptionKey: "sectorsOverviewPage.insights.topReducersDescription",
        fallbackDescriptionKey:
          "sectorsOverviewPage.insights.reducingEmissionsDescription",
        comparableCount,
        count: reducingCount,
        bars: reducingBars,
        icon: TrendingDown,
        iconColor: "text-green-3",
        bgColor: "bg-green-5",
      },
      currentLanguage,
    ),
    buildTrendInsight(
      t,
      {
        titleKey: "sectorsOverviewPage.insights.increasingEmissions",
        statLabelKey: "sectorsOverviewPage.insights.increasingSinceBaseYear",
        topDescriptionKey: "sectorsOverviewPage.insights.topIncreasersDescription",
        fallbackDescriptionKey:
          "sectorsOverviewPage.insights.increasingEmissionsDescription",
        comparableCount,
        count: increasingCount,
        bars: increasingBars,
        icon: TrendingUp,
        iconColor: "text-pink-3",
        bgColor: "bg-pink-5",
      },
      currentLanguage,
    ),
  ];
}

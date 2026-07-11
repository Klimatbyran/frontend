import { Layers, PieChart, Users } from "lucide-react";
import {
  formatEmissionsAbsolute,
  formatEmissionsAbsoluteCompact,
  formatPercent,
} from "@/utils/formatting/localization";
import type {
  ChartInsight,
  InsightBar,
  InsightSegment,
} from "./useSectorChartInsights";
import {
  countReportingCompanies,
  formatEmissionsLabel,
  getMeetsParisStatus,
  getSectorColor,
  type PieChartEntry,
  type SectorInsightsContext,
} from "./sectorChartInsightsShared";

function countMeetsParisStatuses(
  reportingCompanies: Parameters<typeof countReportingCompanies>[0],
) {
  let meetsParisYes = 0;
  let meetsParisNo = 0;
  let meetsParisUnknown = 0;

  reportingCompanies.forEach((company) => {
    const status = getMeetsParisStatus(company);
    if (status === "yes") meetsParisYes += 1;
    else if (status === "no") meetsParisNo += 1;
    else meetsParisUnknown += 1;
  });

  return { meetsParisYes, meetsParisNo, meetsParisUnknown };
}

function buildScopeSegment(
  label: string,
  count: number,
  color: string,
  scopeTotal: number,
  currentLanguage: SectorInsightsContext["currentLanguage"],
): InsightSegment {
  return {
    label,
    count,
    color,
    displayValue:
      scopeTotal > 0 && count > 0
        ? formatPercent(count / scopeTotal, currentLanguage)
        : undefined,
  };
}

function buildScopeSegments(
  largest: PieChartEntry,
  t: SectorInsightsContext["t"],
  currentLanguage: SectorInsightsContext["currentLanguage"],
): InsightSegment[] {
  const scopeTotal =
    (largest.scope1 ?? 0) + (largest.scope2 ?? 0) + (largest.scope3 ?? 0);

  return [
    buildScopeSegment(
      t("sectorsOverviewPage.insights.scope1"),
      largest.scope1 ?? 0,
      getSectorColor(largest.sectorCode),
      scopeTotal,
      currentLanguage,
    ),
    buildScopeSegment(
      t("sectorsOverviewPage.insights.scope2"),
      largest.scope2 ?? 0,
      "var(--blue-3)",
      scopeTotal,
      currentLanguage,
    ),
    buildScopeSegment(
      t("sectorsOverviewPage.insights.scope3"),
      largest.scope3 ?? 0,
      "var(--pink-3)",
      scopeTotal,
      currentLanguage,
    ),
  ].filter((segment) => segment.count > 0);
}

function buildTopSectorBars(
  pieChartData: PieChartEntry[],
  currentLanguage: SectorInsightsContext["currentLanguage"],
): InsightBar[] {
  return pieChartData.slice(0, 3).map((entry) => ({
    label: entry.name,
    valueLabel: formatEmissionsLabel(
      entry.value,
      entry.value / entry.total,
      currentLanguage,
    ),
    share: entry.value / entry.total,
    color: getSectorColor(entry.sectorCode),
  }));
}

function calculateAverageEmissions(
  reportingCompanies: ReturnType<typeof countReportingCompanies>,
  reportingYear: string,
): number {
  if (reportingCompanies.length === 0) {
    return 0;
  }

  const total = reportingCompanies.reduce((sum, company) => {
    const period = company.reportingPeriods.find((p) =>
      p.endDate.startsWith(reportingYear),
    );
    return sum + (period?.emissions?.calculatedTotalEmissions ?? 0);
  }, 0);

  return total / reportingCompanies.length;
}

function buildParisSegments(
  t: SectorInsightsContext["t"],
  counts: ReturnType<typeof countMeetsParisStatuses>,
): InsightSegment[] {
  const { meetsParisYes, meetsParisNo, meetsParisUnknown } = counts;
  return [
    {
      label: t("sectorsOverviewPage.filteringOptions.meetsParisYes"),
      count: meetsParisYes,
      color: "var(--green-3)",
    },
    {
      label: t("sectorsOverviewPage.filteringOptions.meetsParisNo"),
      count: meetsParisNo,
      color: "var(--pink-3)",
    },
    {
      label: t("sectorsOverviewPage.filteringOptions.meetsParisUnknown"),
      count: meetsParisUnknown,
      color: "var(--grey)",
    },
  ];
}

function buildLargestSectorInsight(
  context: SectorInsightsContext,
  largest: PieChartEntry,
  largestShare: number,
  scopeSegments: InsightSegment[],
): ChartInsight {
  const { t, currentLanguage, emissionsUnit } = context;
  return {
    title: t("sectorsOverviewPage.insights.largestSector"),
    stat: formatPercent(largestShare, currentLanguage),
    statLabel: largest.name,
    description: t("sectorsOverviewPage.insights.emissionsAmount", {
      amount: formatEmissionsAbsolute(
        Math.round(largest.value),
        currentLanguage,
      ),
      unit: emissionsUnit,
    }),
    segments:
      scopeSegments.length > 0
        ? scopeSegments
        : [
            {
              label: largest.name,
              count: largest.value,
              color: getSectorColor(largest.sectorCode),
            },
          ],
    icon: PieChart,
    iconColor: "text-orange-3",
    bgColor: "bg-orange-5",
  };
}

function buildTopThreeSectorsInsight(
  context: SectorInsightsContext,
  pieChartData: PieChartEntry[],
  topThreeShare: number,
): ChartInsight {
  const { t, currentLanguage } = context;
  return {
    title: t("sectorsOverviewPage.insights.topThreeSectors"),
    stat: formatPercent(topThreeShare, currentLanguage),
    statLabel: t("sectorsOverviewPage.insights.ofTotalEmissions"),
    description: t("sectorsOverviewPage.insights.topThreeSectorsDescription", {
      share: formatPercent(topThreeShare, currentLanguage),
    }),
    bars: buildTopSectorBars(pieChartData, currentLanguage),
    icon: Layers,
    iconColor: "text-pink-3",
    bgColor: "bg-pink-5",
  };
}

function buildReportingCompaniesInsight(
  context: SectorInsightsContext,
  reportingCompanies: ReturnType<typeof countReportingCompanies>,
  averageEmissions: number,
  parisSegments: InsightSegment[],
): ChartInsight {
  const { t, currentLanguage, emissionsUnit, reportingYear } = context;
  return {
    title: t("sectorsOverviewPage.insights.reportingCompanies"),
    stat: String(reportingCompanies.length),
    statLabel: t("sectorsOverviewPage.insights.forReportingYear", {
      year: reportingYear,
    }),
    description: t("sectorsOverviewPage.insights.reportingCompaniesAvg", {
      amount: formatEmissionsAbsoluteCompact(
        Math.round(averageEmissions),
        currentLanguage,
      ),
      unit: emissionsUnit,
    }),
    segments: parisSegments,
    icon: Users,
    iconColor: "text-blue-3",
    bgColor: "bg-blue-5",
  };
}

export function buildSectorOverviewInsights(
  context: SectorInsightsContext,
): ChartInsight[] {
  const { t, companies, pieChartData, reportingYear, currentLanguage } =
    context;

  const largest = pieChartData[0];
  const largestShare = largest.value / largest.total;
  const topThreeShare =
    pieChartData.slice(0, 3).reduce((sum, item) => sum + item.value, 0) /
    largest.total;
  const reportingCompanies = countReportingCompanies(companies, reportingYear);
  const averageEmissions = calculateAverageEmissions(
    reportingCompanies,
    reportingYear,
  );
  const scopeSegments = buildScopeSegments(largest, t, currentLanguage);
  const parisSegments = buildParisSegments(
    t,
    countMeetsParisStatuses(reportingCompanies),
  );

  return [
    buildLargestSectorInsight(context, largest, largestShare, scopeSegments),
    buildTopThreeSectorsInsight(context, pieChartData, topThreeShare),
    buildReportingCompaniesInsight(
      context,
      reportingCompanies,
      averageEmissions,
      parisSegments,
    ),
  ];
}

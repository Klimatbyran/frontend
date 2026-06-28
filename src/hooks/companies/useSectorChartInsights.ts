import { useMemo } from "react";
import {
  Building2,
  Layers,
  PieChart,
  TrendingDown,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";
import { calculateEmissionsChangeFromBaseYear } from "@/utils/calculations/emissionsCalculations";
import {
  formatEmissionsAbsolute,
  formatEmissionsAbsoluteCompact,
  formatPercent,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { getCompanyColors, sectorColors } from "@/lib/constants/companyColors";
import type { SectorCode } from "@/lib/constants/sectors";

export type InsightBar = {
  label: string;
  valueLabel: string;
  share: number;
  color: string;
};

export type InsightSegment = {
  label: string;
  count: number;
  color: string;
  displayValue?: string;
};

export type ChartInsight = {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  stat?: string;
  statLabel?: string;
  bars?: InsightBar[];
  segments?: InsightSegment[];
};

type PieChartEntry = {
  name: string;
  value: number;
  total: number;
  sectorCode?: string;
  wikidataId?: string;
  scope1?: number;
  scope2?: number;
  scope3?: number;
};

const countReportingCompanies = (
  companies: RankedCompany[],
  reportingYear: string,
  sectorCode?: string,
): RankedCompany[] => {
  return companies.filter((company) => {
    if (
      sectorCode &&
      company.industry?.industryGics?.sectorCode !== sectorCode
    ) {
      return false;
    }

    const period = company.reportingPeriods.find((p) =>
      p.endDate.startsWith(reportingYear),
    );
    return (period?.emissions?.calculatedTotalEmissions ?? 0) > 0;
  });
};

const getMeetsParisStatus = (
  company: RankedCompany,
): "yes" | "no" | "unknown" => {
  const trendAnalysis = calculateTrendline(company);
  if (!trendAnalysis) {
    return "unknown";
  }

  return calculateMeetsParis(company, trendAnalysis) ? "yes" : "no";
};

const getSectorColor = (sectorCode?: string): string => {
  if (!sectorCode) {
    return "var(--grey)";
  }

  return sectorColors[sectorCode as SectorCode]?.base ?? "var(--grey)";
};

const formatEmissionsLabel = (
  value: number,
  share: number,
  currentLanguage: ReturnType<typeof useLanguage>["currentLanguage"],
): string => {
  return `${formatPercent(share, currentLanguage)} · ${formatEmissionsAbsoluteCompact(value, currentLanguage)}`;
};

export const useSectorChartInsights = (
  companies: RankedCompany[],
  pieChartData: PieChartEntry[],
  selectedSector: string | null,
  reportingYear: string,
): ChartInsight[] => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const emissionsUnit = t("companyDetailPage.sectorGraphs.emissionsUnit");

  return useMemo(() => {
    if (pieChartData.length === 0) {
      return [];
    }

    if (selectedSector) {
      const largest = pieChartData[0];
      const largestShare = largest.value / largest.total;
      const reportingCompanies = countReportingCompanies(
        companies,
        reportingYear,
        selectedSector,
      );

      let reducingCount = 0;
      let increasingCount = 0;
      let comparableCount = 0;

      reportingCompanies.forEach((company) => {
        const changePercent = calculateEmissionsChangeFromBaseYear(company, {
          useLastPeriod: true,
        });

        if (changePercent !== null && Math.abs(changePercent) <= 60) {
          comparableCount += 1;
          if (changePercent < 0) {
            reducingCount += 1;
          } else if (changePercent > 0) {
            increasingCount += 1;
          }
        }
      });

      const topCompanyBars: InsightBar[] = pieChartData
        .slice(0, 5)
        .map((entry, index) => ({
          label: entry.name,
          valueLabel: formatEmissionsLabel(
            entry.value,
            entry.value / entry.total,
            currentLanguage,
          ),
          share: entry.value / entry.total,
          color: getCompanyColors(index).base,
        }));

      const trendSegments: InsightSegment[] = [
        {
          label: t("sectorsOverviewPage.insights.reducing"),
          count: reducingCount,
          color: "var(--green-3)",
        },
        {
          label: t("sectorsOverviewPage.insights.increasing"),
          count: increasingCount,
          color: "var(--pink-3)",
        },
      ];

      return [
        {
          title: t("sectorsOverviewPage.insights.largestCompany"),
          stat: formatPercent(largestShare, currentLanguage),
          statLabel: largest.name,
          description: t("sectorsOverviewPage.insights.emissionsAmount", {
            amount: formatEmissionsAbsolute(
              Math.round(largest.value),
              currentLanguage,
            ),
            unit: emissionsUnit,
          }),
          bars: [
            {
              label: largest.name,
              valueLabel: formatPercent(largestShare, currentLanguage),
              share: largestShare,
              color: getCompanyColors(0).base,
            },
          ],
          icon: Trophy,
          iconColor: "text-orange-3",
          bgColor: "bg-orange-5",
        },
        {
          title: t("sectorsOverviewPage.insights.companiesInSector"),
          stat: String(reportingCompanies.length),
          statLabel: t("sectorsOverviewPage.insights.companiesReportingLabel"),
          description: t(
            "sectorsOverviewPage.insights.topEmittersInSectorDescription",
          ),
          bars: topCompanyBars,
          icon: Building2,
          iconColor: "text-blue-3",
          bgColor: "bg-blue-5",
        },
        {
          title: t("sectorsOverviewPage.insights.reducingEmissions"),
          stat:
            comparableCount > 0
              ? formatPercent(reducingCount / comparableCount, currentLanguage)
              : "–",
          statLabel: t("sectorsOverviewPage.insights.sinceBaseYear"),
          description:
            comparableCount > 0
              ? t("sectorsOverviewPage.insights.reducingEmissionsDescription", {
                  count: reducingCount,
                  total: comparableCount,
                })
              : t("sectorsOverviewPage.insights.noComparableTrendData"),
          segments: comparableCount > 0 ? trendSegments : undefined,
          icon: TrendingDown,
          iconColor: "text-green-3",
          bgColor: "bg-green-5",
        },
      ];
    }

    const largest = pieChartData[0];
    const largestShare = largest.value / largest.total;
    const topThreeShare =
      pieChartData.slice(0, 3).reduce((sum, item) => sum + item.value, 0) /
      largest.total;
    const reportingCompanies = countReportingCompanies(
      companies,
      reportingYear,
    );
    const averageEmissions =
      reportingCompanies.length > 0
        ? reportingCompanies.reduce((sum, company) => {
            const period = company.reportingPeriods.find((p) =>
              p.endDate.startsWith(reportingYear),
            );
            return sum + (period?.emissions?.calculatedTotalEmissions ?? 0);
          }, 0) / reportingCompanies.length
        : 0;

    let meetsParisYes = 0;
    let meetsParisNo = 0;
    let meetsParisUnknown = 0;

    reportingCompanies.forEach((company) => {
      const status = getMeetsParisStatus(company);
      if (status === "yes") {
        meetsParisYes += 1;
      } else if (status === "no") {
        meetsParisNo += 1;
      } else {
        meetsParisUnknown += 1;
      }
    });

    const topSectorBars: InsightBar[] = pieChartData
      .slice(0, 3)
      .map((entry) => ({
        label: entry.name,
        valueLabel: formatEmissionsLabel(
          entry.value,
          entry.value / entry.total,
          currentLanguage,
        ),
        share: entry.value / entry.total,
        color: getSectorColor(entry.sectorCode),
      }));

    const scopeTotal =
      (largest.scope1 ?? 0) + (largest.scope2 ?? 0) + (largest.scope3 ?? 0);

    const scopeSegments: InsightSegment[] = [
      {
        label: t("sectorsOverviewPage.insights.scope1"),
        count: largest.scope1 ?? 0,
        color: getSectorColor(largest.sectorCode),
        displayValue:
          scopeTotal > 0 && largest.scope1
            ? formatPercent((largest.scope1 ?? 0) / scopeTotal, currentLanguage)
            : undefined,
      },
      {
        label: t("sectorsOverviewPage.insights.scope2"),
        count: largest.scope2 ?? 0,
        color: "var(--blue-3)",
        displayValue:
          scopeTotal > 0 && largest.scope2
            ? formatPercent((largest.scope2 ?? 0) / scopeTotal, currentLanguage)
            : undefined,
      },
      {
        label: t("sectorsOverviewPage.insights.scope3"),
        count: largest.scope3 ?? 0,
        color: "var(--pink-3)",
        displayValue:
          scopeTotal > 0 && largest.scope3
            ? formatPercent((largest.scope3 ?? 0) / scopeTotal, currentLanguage)
            : undefined,
      },
    ].filter((segment) => segment.count > 0);

    const parisSegments: InsightSegment[] = [
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

    return [
      {
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
      },
      {
        title: t("sectorsOverviewPage.insights.topThreeSectors"),
        stat: formatPercent(topThreeShare, currentLanguage),
        statLabel: t("sectorsOverviewPage.insights.ofTotalEmissions"),
        description: t(
          "sectorsOverviewPage.insights.topThreeSectorsDescription",
          {
            share: formatPercent(topThreeShare, currentLanguage),
          },
        ),
        bars: topSectorBars,
        icon: Layers,
        iconColor: "text-pink-3",
        bgColor: "bg-pink-5",
      },
      {
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
      },
    ];
  }, [
    companies,
    pieChartData,
    selectedSector,
    reportingYear,
    currentLanguage,
    emissionsUnit,
    t,
  ]);
};

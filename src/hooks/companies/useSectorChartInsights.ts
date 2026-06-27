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
import { formatPercent } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

export type ChartInsight = {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
};

type PieChartEntry = {
  name: string;
  value: number;
  total: number;
  sectorCode?: string;
  wikidataId?: string;
};

const countReportingCompanies = (
  companies: RankedCompany[],
  reportingYear: string,
  sectorCode?: string,
): number => {
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
  }).length;
};

export const useSectorChartInsights = (
  companies: RankedCompany[],
  pieChartData: PieChartEntry[],
  selectedSector: string | null,
  reportingYear: string,
): ChartInsight[] => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return useMemo(() => {
    if (pieChartData.length === 0) {
      return [];
    }

    if (selectedSector) {
      const largest = pieChartData[0];
      const largestShare = formatPercent(
        largest.value / largest.total,
        currentLanguage,
      );
      const reportingCount = countReportingCompanies(
        companies,
        reportingYear,
        selectedSector,
      );

      const sectorCompanies = companies.filter(
        (company) =>
          company.industry?.industryGics?.sectorCode === selectedSector,
      );

      let reducingCount = 0;
      let comparableCount = 0;

      sectorCompanies.forEach((company) => {
        const changePercent = calculateEmissionsChangeFromBaseYear(company, {
          useLastPeriod: true,
        });

        if (changePercent !== null && Math.abs(changePercent) <= 60) {
          comparableCount += 1;
          if (changePercent < 0) {
            reducingCount += 1;
          }
        }
      });

      return [
        {
          title: t("sectorsOverviewPage.insights.largestCompany"),
          description: t(
            "sectorsOverviewPage.insights.largestCompanyDescription",
            {
              name: largest.name,
              share: largestShare,
            },
          ),
          icon: Trophy,
          iconColor: "text-orange-3",
          bgColor: "bg-orange-5",
        },
        {
          title: t("sectorsOverviewPage.insights.companiesInSector"),
          description: t(
            "sectorsOverviewPage.insights.companiesInSectorDescription",
            {
              count: reportingCount,
            },
          ),
          icon: Building2,
          iconColor: "text-blue-3",
          bgColor: "bg-blue-5",
        },
        {
          title: t("sectorsOverviewPage.insights.reducingEmissions"),
          description:
            comparableCount > 0
              ? t(
                  "sectorsOverviewPage.insights.reducingEmissionsDescription",
                  {
                    count: reducingCount,
                    total: comparableCount,
                  },
                )
              : t("sectorsOverviewPage.insights.noComparableTrendData"),
          icon: TrendingDown,
          iconColor: "text-green-3",
          bgColor: "bg-green-5",
        },
      ];
    }

    const largest = pieChartData[0];
    const largestShare = formatPercent(
      largest.value / largest.total,
      currentLanguage,
    );
    const topThreeShare = formatPercent(
      pieChartData.slice(0, 3).reduce((sum, item) => sum + item.value, 0) /
        largest.total,
      currentLanguage,
    );
    const reportingCount = countReportingCompanies(companies, reportingYear);

    return [
      {
        title: t("sectorsOverviewPage.insights.largestSector"),
        description: t("sectorsOverviewPage.insights.largestSectorDescription", {
          name: largest.name,
          share: largestShare,
        }),
        icon: PieChart,
        iconColor: "text-orange-3",
        bgColor: "bg-orange-5",
      },
      {
        title: t("sectorsOverviewPage.insights.topThreeSectors"),
        description: t(
          "sectorsOverviewPage.insights.topThreeSectorsDescription",
          {
            share: topThreeShare,
          },
        ),
        icon: Layers,
        iconColor: "text-pink-3",
        bgColor: "bg-pink-5",
      },
      {
        title: t("sectorsOverviewPage.insights.reportingCompanies"),
        description: t(
          "sectorsOverviewPage.insights.reportingCompaniesDescription",
          {
            count: reportingCount,
            year: reportingYear,
          },
        ),
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
    t,
  ]);
};

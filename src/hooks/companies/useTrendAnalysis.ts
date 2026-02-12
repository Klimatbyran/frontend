import { useMemo } from "react";
import { TrendingDown, TrendingUp, MinusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RankedCompany, TrendData } from "@/types/company";
import { TrendCardInfo } from "@/types/company";
import { calculateEmissionsChangeFromBaseYear } from "@/utils/calculations/emissionsCalculations";

export const useCategoryInfo = (): Record<string, TrendCardInfo> => {
  const { t } = useTranslation();

  return {
    decreasing: {
      title: t("companyDetailPage.sectorGraphs.decreasing"),
      icon: TrendingDown,
      color: "bg-green-5",
      textColor: "text-green-3",
    },
    increasing: {
      title: t("companyDetailPage.sectorGraphs.increasing"),
      icon: TrendingUp,
      color: "bg-orange-5",
      textColor: "text-orange-3",
    },
    noComparable: {
      title: t("companyDetailPage.sectorGraphs.noComparable"),
      icon: MinusCircle,
      color: "bg-blue-5",
      textColor: "text-blue-3",
    },
  };
};

export const useTrendAnalysis = (
  companies: RankedCompany[],
  selectedSectors: string[],
): TrendData => {
  return useMemo(() => {
    const trends: TrendData = {
      decreasing: [],
      increasing: [],
      noComparable: [],
    };

    companies.forEach((company) => {
      if (
        !selectedSectors.includes(
          company.industry?.industryGics?.sectorCode || "",
        )
      ) {
        return;
      }

      // Calculate emissions change using the utility function
      // Use useLastPeriod: true to match previous behavior (uses last period, not necessarily >0)
      const changePercent = calculateEmissionsChangeFromBaseYear(company, {
        useLastPeriod: true,
      });

      // If calculation returns null, it's not comparable
      if (changePercent === null) {
        trends.noComparable.push(company);
        return;
      }

      // Filter out changes > 60% as outliers (not comparable)
      if (Math.abs(changePercent) > 60) {
        trends.noComparable.push(company);
        return;
      }

      // Get base year and latest period info for the trend data
      const baseYear = company.baseYear?.year?.toString();
      if (!baseYear) {
        trends.noComparable.push(company);
        return;
      }

      // Get latest period for currentYear (using endDate year)
      const sortedPeriods = [...(company.reportingPeriods || [])].sort((a, b) =>
        a.endDate.localeCompare(b.endDate),
      );
      const latestPeriod = sortedPeriods[sortedPeriods.length - 1];
      const currentYear = latestPeriod
        ? new Date(latestPeriod.endDate).getFullYear().toString()
        : baseYear;

      if (changePercent < 0) {
        trends.decreasing.push({
          company,
          changePercent,
          baseYear: baseYear,
          currentYear: currentYear,
        });
      } else {
        trends.increasing.push({
          company,
          changePercent,
          baseYear: baseYear,
          currentYear: currentYear,
        });
      }
    });

    // Sort by percentage change
    trends.decreasing.sort((a, b) => a.changePercent - b.changePercent);
    trends.increasing.sort((a, b) => b.changePercent - a.changePercent);

    return trends;
  }, [companies, selectedSectors]);
};

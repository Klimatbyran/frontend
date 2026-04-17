import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { RankedCompany } from "@/types/company";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { useLanguage } from "@/components/LanguageProvider";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import { useVerificationStatus } from "../useVerificationStatus";
import { useSectorNames } from "./useCompanySectors";
import {
  UPSTREAM_CATEGORIES,
  DOWNSTREAM_CATEGORIES,
} from "@/lib/constants/categories";

interface IUseTransformCompanyListCard {
  filteredCompanies: RankedCompany[];
}

//Recieves pre-filtered companies or municipalities
import type { ListCardProps } from "@/components/explore/ListCard";

const useTransformCompanyListCard = ({
  filteredCompanies,
}: IUseTransformCompanyListCard): ListCardProps[] => {
  const sectorNames = useSectorNames();
  const { isEmissionsAIGenerated } = useVerificationStatus();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  // Transform company data for ListCard components
  const transformedCards = useMemo(() => {
    if (!filteredCompanies) {
      return [];
    }
    return filteredCompanies.map((company: RankedCompany) => {
      const { wikidataId, name, industry, reportingPeriods } = company;
      const isFinancialsSector = industry?.industryGics?.sectorCode === "40";
      const latestPeriod = reportingPeriods?.[0];
      const previousPeriod = reportingPeriods?.[1];

      // Get sector name instead of description
      const sectorName = getCompanySectorName(company, sectorNames);

      const currentEmissions =
        latestPeriod?.emissions?.calculatedTotalEmissions || null;

      // Calculate emissions change from previous period
      const emissionsChange = calculateEmissionsChange(
        latestPeriod,
        previousPeriod,
      );

      const totalEmissionsAIGenerated = latestPeriod
        ? isEmissionsAIGenerated(latestPeriod)
        : false;
      const yearOverYearAIGenerated =
        (latestPeriod && isEmissionsAIGenerated(latestPeriod)) ||
        (previousPeriod && isEmissionsAIGenerated(previousPeriod));

      // Calculate trend analysis and meets Paris status
      const trendAnalysis = calculateTrendline(company);
      const meetsParis = trendAnalysis
        ? calculateMeetsParis(company, trendAnalysis)
        : null; // null = unknown

      const scope3Coverage =
        latestPeriod?.emissions?.scope3?.categories?.filter(
          (c) =>
            UPSTREAM_CATEGORIES.includes(c.category) ||
            DOWNSTREAM_CATEGORIES.includes(c.category),
        ).length || 0;

      return {
        name,
        description: sectorName,
        logoUrl: company.logoUrl,
        variant: "company" as const,
        baseYear: company?.baseYear?.year || null,
        linkTo: `/companies/${wikidataId}`,
        meetsParis,
        meetsParisTranslationKey: "companies.card.meetsParis",
        emissionsValue:
          currentEmissions != null
            ? formatEmissionsAbsolute(currentEmissions, currentLanguage)
            : null,
        emissionsYear: latestPeriod
          ? new Date(latestPeriod.endDate).getFullYear().toString()
          : undefined,
        emissionsUnit: t("emissionsUnit"),
        emissionsIsAIGenerated: totalEmissionsAIGenerated,
        changeRateValue: emissionsChange
          ? formatPercentChange(emissionsChange, currentLanguage)
          : null,
        changeRateColor: emissionsChange
          ? emissionsChange < 0
            ? "text-orange-2"
            : "text-pink-3"
          : undefined,
        changeRateIsAIGenerated: yearOverYearAIGenerated,
        changeRateTooltip:
          emissionsChange && (emissionsChange <= -80 || emissionsChange >= 80)
            ? `${t("companies.card.emissionsChangeRateInfo")}\n\n${t("companies.card.emissionsChangeRateInfoExtended")}`
            : t("companies.card.emissionsChangeRateInfo"),

        isFinancialsSector,
        scope3Coverage,
      };
    });
  }, [
    filteredCompanies,
    sectorNames,
    isEmissionsAIGenerated,
    currentLanguage,
    t,
  ]);

  return transformedCards;
};

export default useTransformCompanyListCard;

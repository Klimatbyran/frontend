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

interface IUseTransformCompanyListCard {
  filteredCompanies: RankedCompany[];
}

//Recieves pre-filtered companies or municipalities
import type { ListCardProps } from "@/components/layout/ListCard";

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

      // Find largest emission source (scope1, scope2, or scope3 category)
      let largestEmission:
        | {
            key: string | number;
            value: number | null;
            type: "scope1" | "scope2" | "scope3";
          }
        | undefined = undefined;

      // Get values for scope 1 and 2
      const scope1Value = latestPeriod?.emissions?.scope1?.total ?? null;
      const scope2Value =
        latestPeriod?.emissions?.scope2?.calculatedTotalEmissions ?? null;

      // Get largest scope 3 category
      let largestScope3Cat:
        | { category: number; total: number | null }
        | undefined = undefined;
      if (
        latestPeriod?.emissions?.scope3?.categories &&
        Array.isArray(latestPeriod.emissions.scope3.categories)
      ) {
        const categories = latestPeriod.emissions.scope3.categories;
        const validCategories = categories.filter(
          (cat) => cat && typeof cat.total === "number" && cat.total !== null,
        );
        if (validCategories.length > 0) {
          largestScope3Cat = validCategories.reduce(
            (max, cat) =>
              (cat.total ?? -Infinity) > (max.total ?? -Infinity) ? cat : max,
            validCategories[0],
          );
        }
      }

      // Compare all values
      const candidates: Array<{
        key: string | number;
        value: number | null;
        type: "scope1" | "scope2" | "scope3";
      }> = [];
      if (scope1Value !== null && typeof scope1Value === "number") {
        candidates.push({ key: "scope1", value: scope1Value, type: "scope1" });
      }
      if (scope2Value !== null && typeof scope2Value === "number") {
        candidates.push({ key: "scope2", value: scope2Value, type: "scope2" });
      }
      if (
        largestScope3Cat &&
        largestScope3Cat.total !== null &&
        typeof largestScope3Cat.total === "number"
      ) {
        candidates.push({
          key: largestScope3Cat.category,
          value: largestScope3Cat.total,
          type: "scope3",
        });
      }

      if (candidates.length > 0) {
        const largest = candidates.reduce(
          (max, item) => (item.value! > (max.value ?? -Infinity) ? item : max),
          candidates[0],
        );
        largestEmission = largest;
      }

      return {
        name,
        description: sectorName,
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
        largestEmission,
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

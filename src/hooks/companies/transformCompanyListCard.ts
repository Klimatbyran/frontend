import type { TFunction } from "i18next";
import type { RankedCompany } from "@/types/company";
import type { ListCardProps } from "@/components/explore/ListCard";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
  type SupportedLanguage,
} from "@/utils/formatting/localization";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import { getCompanyDetailPath } from "@/utils/companyRouting";

type TransformCompanyOptions = {
  sectorNames: Record<string, string>;
  isEmissionsAIGenerated: (
    period: RankedCompany["reportingPeriods"][number],
  ) => boolean;
  currentLanguage: SupportedLanguage;
  t: TFunction;
};

function getMeetsParisStatus(company: RankedCompany): boolean | null {
  const trendAnalysis = calculateTrendline(company);
  return trendAnalysis ? calculateMeetsParis(company, trendAnalysis) : null;
}

function getChangeRateTooltip(
  emissionsChange: number | null,
  t: TFunction,
): string {
  if (emissionsChange && (emissionsChange <= -80 || emissionsChange >= 80)) {
    return `${t("companies.card.emissionsChangeRateInfo")}\n\n${t("companies.card.emissionsChangeRateInfoExtended")}`;
  }
  return t("companies.card.emissionsChangeRateInfo");
}

function getChangeRateColor(
  emissionsChange: number | null,
): string | undefined {
  if (!emissionsChange) return undefined;
  return emissionsChange < 0 ? "text-orange-2" : "text-pink-3";
}

function buildEmissionsFields(
  latestPeriod: RankedCompany["reportingPeriods"][number] | undefined,
  previousPeriod: RankedCompany["reportingPeriods"][number] | undefined,
  options: TransformCompanyOptions,
) {
  const { isEmissionsAIGenerated, currentLanguage, t } = options;
  const currentEmissions =
    latestPeriod?.emissions?.calculatedTotalEmissions || null;
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

  return {
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
    changeRateColor: getChangeRateColor(emissionsChange),
    changeRateIsAIGenerated: yearOverYearAIGenerated,
    changeRateTooltip: getChangeRateTooltip(emissionsChange, t),
  };
}

export function transformCompanyToListCard(
  company: RankedCompany,
  options: TransformCompanyOptions,
): ListCardProps {
  const { sectorNames } = options;
  const { name, industry, reportingPeriods } = company;
  const latestPeriod = reportingPeriods?.[0];
  const previousPeriod = reportingPeriods?.[1];

  return {
    name,
    description: getCompanySectorName(company, sectorNames),
    logoUrl: company.logoUrl,
    variant: "company" as const,
    baseYear: company?.baseYear?.year || null,
    linkTo: getCompanyDetailPath(company),
    meetsParis: getMeetsParisStatus(company),
    meetsParisTranslationKey: "companies.card.meetsParis",
    ...buildEmissionsFields(latestPeriod, previousPeriod, options),
    isFinancialsSector: industry?.industryGics?.sectorCode === "40",
    hasScope3Coverage:
      (latestPeriod?.emissions?.scope3?.categories?.length || 0) > 0,
  };
}

import type { TFunction } from "i18next";
import { createElement, Fragment } from "react";
import type { PageExploreCompany } from "@/types/pages";
import type { ListCardProps } from "@/components/explore/ListCard";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { getCompanyDetailPath } from "@/utils/companyRouting";
import type { IndustryGroupCode } from "@/lib/constants/sectors";
import type { SupportedLanguage } from "@/lib/languageDetection";

type TransformCompanyOptions = {
  sectorNames: Record<string, string>;
  industryGroupNames: Record<IndustryGroupCode, string>;
  currentLanguage: SupportedLanguage;
  t: TFunction;
};

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

export function transformCompanyToListCard(
  company: PageExploreCompany,
  options: TransformCompanyOptions,
): ListCardProps {
  const { sectorNames, industryGroupNames, currentLanguage, t } = options;
  const sectorName = company.sectorCode
    ? (sectorNames[company.sectorCode] ?? company.sectorCode)
    : "";
  const industryGroupName = company.industryGroupCode
    ? (industryGroupNames[company.industryGroupCode as IndustryGroupCode] ??
      company.industryGroupCode)
    : "";
  const emissionsChange = company.emissionsChangeLastTwoYears;

  return {
    name: company.name,
    description: company.sectorCode
      ? createElement(
          Fragment,
          null,
          createElement("span", { className: "font-semibold" }, sectorName),
          industryGroupName
            ? createElement("span", null, ` • ${industryGroupName}`)
            : null,
        )
      : createElement("span", { className: "font-semibold" }, sectorName),
    logoUrl: company.logoUrl,
    variant: "company" as const,
    baseYear: company.baseYear,
    linkTo: getCompanyDetailPath(company),
    meetsParis: company.meetsParis,
    meetsParisTranslationKey: "companies.card.meetsParis",
    emissionsValue:
      company.latestTotalEmissions != null
        ? formatEmissionsAbsolute(company.latestTotalEmissions, currentLanguage)
        : null,
    emissionsYear: company.latestYear?.toString(),
    emissionsUnit: t("emissionsUnit"),
    emissionsIsAIGenerated: company.emissionsIsAIGenerated,
    changeRateValue: emissionsChange
      ? formatPercentChange(emissionsChange, currentLanguage)
      : null,
    changeRateColor: getChangeRateColor(emissionsChange),
    changeRateIsAIGenerated: company.changeRateIsAIGenerated,
    changeRateTooltip: getChangeRateTooltip(emissionsChange, t),
    isFinancialsSector: company.isFinancialsSector,
    hasScope3Coverage: company.hasScope3Coverage,
  };
}

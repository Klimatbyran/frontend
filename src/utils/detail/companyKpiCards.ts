import type { TFunction } from "i18next";
import { getMeetsParisDisplay } from "@/components/detail/meetsParisStat";
import type { SupportedLanguage } from "@/lib/languageDetection";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import {
  resolvePlacement,
  valuesForPlacement,
  type PlacementStatus,
} from "@/utils/insights/kpiPlacement";
import {
  totalEmissionsForComparisonYear,
  yearOverYearForComparisonYear,
} from "./companyPeriodMetrics";
import type { KpiCardModel } from "./kpiCardModel";

export type CompanyKpiSubject = {
  wikidataId: string;
  meetsParis: boolean | null;
  yearOverYearChange: number | null;
  totalEmissions: number | null;
  periodYear: string;
  totalEmissionsAi: boolean;
  yearOverYearAi: boolean;
  sectorCode?: string;
};

type CompanyPeer = {
  wikidataId: string;
  meetsParis?: boolean | null;
  reportingPeriods?: Parameters<typeof yearOverYearForComparisonYear>[0];
};

function changeClass(value: number | null): string {
  if (value == null) return "text-grey";
  return value < 0 ? "text-orange-2" : "text-pink-3";
}

function yoyInfo(change: number | null, t: TFunction): string {
  if (change == null) return t("companies.card.noData");
  const base = t("companies.card.emissionsChangeRateInfo");
  if (change <= -80 || change >= 80) {
    return `${base} ${t("companies.card.emissionsChangeRateInfoExtended")}`;
  }
  return base;
}

export function buildCompanyKpiCards(
  subject: CompanyKpiSubject,
  peers: readonly CompanyPeer[],
  comparisonYear: string,
  status: PlacementStatus,
  t: TFunction,
  language: SupportedLanguage,
): KpiCardModel[] {
  const datasetLabel = t("detailPage.kpiPlacement.allCompanies");
  const isSubject = (peer: CompanyPeer) =>
    peer.wikidataId === subject.wikidataId;
  const paris = getMeetsParisDisplay(subject.meetsParis, t);

  const datasetScope = (
    read: (peer: CompanyPeer) => number | boolean | null | undefined,
    subjectValue: number | boolean | null | undefined,
    higherIsBetter: boolean,
  ) => {
    const resolved = resolvePlacement(
      status,
      peers,
      valuesForPlacement(peers, isSubject, subjectValue, read),
      subjectValue,
      higherIsBetter,
    );
    return [{ id: "dataset", label: datasetLabel, ...resolved }];
  };

  return [
    {
      id: "meetsParis",
      label: t("detailPage.meetsParisGoal"),
      value: paris.value,
      valueClassName: paris.valueClassName,
      caption: paris.caption,
      scopes: datasetScope(
        (peer) => peer.meetsParis ?? null,
        subject.meetsParis,
        true,
      ),
    },
    {
      id: "yearOverYear",
      label: t("companies.overview.changeSinceLastYear"),
      value:
        subject.yearOverYearChange == null
          ? t("companies.overview.noData")
          : formatPercentChange(subject.yearOverYearChange, language, false),
      valueClassName: changeClass(subject.yearOverYearChange),
      infoText: yoyInfo(subject.yearOverYearChange, t),
      showAiIcon: subject.yearOverYearAi,
      scopes: datasetScope(
        (peer) =>
          yearOverYearForComparisonYear(
            peer.reportingPeriods ?? [],
            comparisonYear,
          ),
        subject.yearOverYearChange,
        false,
      ),
    },
    {
      id: "totalEmissions",
      label: `${t("companies.overview.totalEmissions")} ${subject.periodYear}`,
      value:
        subject.totalEmissions == null
          ? t("companies.overview.noData")
          : formatEmissionsAbsolute(subject.totalEmissions, language),
      valueClassName:
        subject.totalEmissions == null ? "text-grey" : "text-orange-2",
      unit: subject.totalEmissions == null ? undefined : t("emissionsUnit"),
      infoText:
        subject.sectorCode === "40"
          ? t("companies.overview.financialsTooltip")
          : undefined,
      showAiIcon: subject.totalEmissionsAi,
      scopes: datasetScope(
        (peer) =>
          totalEmissionsForComparisonYear(
            peer.reportingPeriods ?? [],
            comparisonYear,
          ),
        subject.totalEmissions,
        false,
      ),
    },
  ];
}

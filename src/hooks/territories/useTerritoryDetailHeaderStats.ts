import { useTranslation } from "react-i18next";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { DetailStat } from "@/components/detail/DetailHeader";
import type { EmissionDataPoint } from "@/types/municipality";
import type { SupportedLanguage } from "@/lib/languageDetection";

export type TerritoryDetailStatsSource = {
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
  emissions: (EmissionDataPoint | null)[];
};

function createMeetsParisStat(
  meetsParis: boolean,
  t: ReturnType<typeof useTranslation>["t"],
): DetailStat {
  return {
    label: t("detailPage.meetsParisGoal"),
    value:
      meetsParis === true
        ? t("yes")
        : meetsParis === false
          ? t("no")
          : t("unknown"),
    valueClassName:
      meetsParis === true
        ? "text-green-3"
        : meetsParis === false
          ? "text-pink-3"
          : "text-grey",
  };
}

function createChangeSince2015Stat(
  historicalEmissionChangePercent: number,
  currentLanguage: SupportedLanguage,
  t: ReturnType<typeof useTranslation>["t"],
): DetailStat {
  return {
    label: t("detailPage.changeSince2015"),
    value: formatPercentChange(
      historicalEmissionChangePercent,
      currentLanguage,
    ),
    valueClassName:
      historicalEmissionChangePercent > 0 ? "text-pink-3" : "text-orange-2",
  };
}

function createTotalEmissionsStat(
  emissions: number,
  lastYear: number,
  currentLanguage: SupportedLanguage,
  t: ReturnType<typeof useTranslation>["t"],
): DetailStat {
  return {
    label: t("detailPage.totalEmissions", { year: lastYear }),
    value: formatEmissionsAbsolute(emissions, currentLanguage),
    unit: t("emissionsUnit"),
    valueClassName: "text-orange-2",
    info: true,
    infoText: t("municipalityDetailPage.totalEmissionsTooltip"),
  };
}

export function useTerritoryDetailHeaderStats(
  territory: TerritoryDetailStatsSource | null,
  lastYear: number | undefined,
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!territory || !lastYear) {
    return [];
  }

  const lastYearEmissions =
    territory.emissions.find((d) => d?.year === lastYear)?.value ?? 0;

  return [
    createMeetsParisStat(territory.meetsParis, t),
    createChangeSince2015Stat(
      territory.historicalEmissionChangePercent,
      currentLanguage,
      t,
    ),
    createTotalEmissionsStat(
      lastYearEmissions,
      lastYear,
      currentLanguage,
      t,
    ),
  ];
}

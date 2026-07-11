import { useTranslation } from "react-i18next";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
  localizeUnit,
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
  meetsParis: boolean | null,
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
  historicalEmissionChangePercent: number | null,
  currentLanguage: SupportedLanguage,
  t: ReturnType<typeof useTranslation>["t"],
): DetailStat {
  if (historicalEmissionChangePercent === null) {
    return {
      label: t("detailPage.changeSince2015"),
      value: t("unknown"),
      valueClassName: "text-grey",
    };
  }

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
  options: { infoText?: string } = {},
): DetailStat {
  return {
    label: t("detailPage.totalEmissions", { year: lastYear }),
    value: formatEmissionsAbsolute(emissions, currentLanguage),
    unit: t("emissionsUnit"),
    valueClassName: "text-orange-2",
    info: true,
    infoText:
      options.infoText ?? t("municipalityDetailPage.totalEmissionsTooltip"),
  };
}

type EmissionsPerCapitaStatOptions = {
  label?: string;
  unit?: string;
  infoText?: string;
};

export function createEmissionsPerCapitaStat(
  emissionsPerCapita: number,
  currentLanguage: SupportedLanguage,
  t: ReturnType<typeof useTranslation>["t"],
  options: EmissionsPerCapitaStatOptions = {},
): DetailStat {
  return {
    label: options.label ?? t("detailPage.emissionsPerCapita"),
    value: localizeUnit(emissionsPerCapita, currentLanguage),
    unit: options.unit ?? t("detailPage.emissionsPerCapitaUnit"),
    valueClassName: "text-orange-2",
    info: Boolean(options.infoText),
    infoText: options.infoText,
  };
}

export {
  createMeetsParisStat,
  createChangeSince2015Stat,
  createTotalEmissionsStat,
};

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
    createTotalEmissionsStat(lastYearEmissions, lastYear, currentLanguage, t),
  ];
}

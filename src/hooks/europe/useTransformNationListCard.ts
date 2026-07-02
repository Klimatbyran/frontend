import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import type { ClimateTraceEmissionsByIso } from "@/lib/climateTrace";
import type { RankedListItem } from "@/types/rankings";
import { CLIMATE_TRACE_REPORTED_END_YEAR } from "@/utils/europe/climateTraceKpis";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";
import { getEntityDetailPath } from "@/utils/routing";

interface UseTransformNationListCardInput {
  countries: RankedListItem[];
  emissionsByIso: ClimateTraceEmissionsByIso;
}

export function useTransformNationListCard({
  countries,
  emissionsByIso,
}: UseTransformNationListCardInput) {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  return useMemo(() => {
    return countries.map((country) => {
      const iso3 = String(country.id);
      const ranking = emissionsByIso[iso3];
      const lastYear = CLIMATE_TRACE_REPORTED_END_YEAR;
      const lastYearEmissions = ranking?.emissionsByYear[lastYear];
      const emissionsValue =
        lastYearEmissions !== undefined
          ? formatEmissionsAbsolute(lastYearEmissions, currentLanguage)
          : t("municipalities.card.noData");
      const changeValue =
        country.historicalEmissionChangePercent != null
          ? formatPercentChange(
              country.historicalEmissionChangePercent,
              currentLanguage,
            )
          : t("municipalities.card.noData");

      return {
        name: country.displayName ?? country.name,
        description: t("europe.detailPage.dataSource"),
        linkTo: getEntityDetailPath("europe", {
          id: iso3,
          name: country.mapName ?? country.name,
        }),
        variant: "nation" as const,
        meetsParis: country.meetsParis ?? null,
        meetsParisTranslationKey: "detailPage.meetsParisGoal",
        emissionsValue,
        emissionsYear: String(lastYear),
        emissionsUnit: t("emissionsUnit"),
        changeRateValue: changeValue,
        changeRateColor:
          country.historicalEmissionChangePercent != null &&
          country.historicalEmissionChangePercent > 0
            ? "text-pink-3"
            : "text-orange-2",
        changeRateTooltip: t("municipalities.card.changeRateInfo"),
        hasScope3Coverage: false,
      };
    });
  }, [countries, currentLanguage, emissionsByIso, t]);
}

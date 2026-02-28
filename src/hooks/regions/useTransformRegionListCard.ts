import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import type { RegionForExplore } from "./useRegionsForExplore";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { getEntityDetailPath } from "@/utils/routing";

interface UseTransformRegionListCardInput {
  filteredRegions: RegionForExplore[];
}

export function useTransformRegionListCard({
  filteredRegions,
}: UseTransformRegionListCardInput) {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  return useMemo(() => {
    return filteredRegions.map((region) => {
      const lastYear = Object.keys(region.emissions)
        .filter((y) => !isNaN(Number(y)))
        .map(Number)
        .sort((a, b) => b - a)[0];
      const lastYearStr = lastYear?.toString() ?? "";
      const lastYearValue = lastYear
        ? region.emissions[lastYearStr]
        : undefined;
      const emissionsValue =
        lastYearValue !== undefined
          ? formatEmissionsAbsolute(lastYearValue, currentLanguage)
          : t("municipalities.card.noData");
      const changeValue =
        region.historicalEmissionChangePercent != null
          ? formatPercentChange(
              region.historicalEmissionChangePercent,
              currentLanguage,
            )
          : t("municipalities.card.noData");

      return {
        name: region.name,
        logoUrl: region.logoUrl,
        description: t("explorePage.regions.municipalityCount", {
          count: region.municipalityCount,
        }),
        linkTo: getEntityDetailPath("region", region.name),
        variant: "region" as const,
        meetsParis: region.meetsParis,
        meetsParisTranslationKey: "municipalities.card.meetsParis",
        emissionsValue,
        emissionsYear: lastYearStr,
        emissionsUnit: t("emissionsUnit"),
        changeRateValue: changeValue,
        changeRateColor:
          region.historicalEmissionChangePercent != null &&
          region.historicalEmissionChangePercent > 0
            ? "text-pink-3"
            : "text-orange-2",
        changeRateTooltip: t("municipalities.card.changeRateInfo"),
      };
    });
  }, [filteredRegions, currentLanguage, t]);
}

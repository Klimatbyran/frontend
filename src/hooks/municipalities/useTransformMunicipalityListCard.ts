import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import type { Municipality } from "@/types/municipality";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";

interface IUseTransformMunicipalityListCard {
  filteredMunicipalities: Municipality[];
}

// Transform municipality data for ListCard components
const useTransformMunicipalityListCard = ({
  filteredMunicipalities,
}: IUseTransformMunicipalityListCard) => {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  const transformedMunicipalities = useMemo(() => {
    return filteredMunicipalities.map((municipality) => {
      const { meetsParisGoal } = municipality;

      const lastYearEmission = municipality.emissions.at(-1);
      const lastYearEmissions = lastYearEmission
        ? formatEmissionsAbsolute(lastYearEmission.value, currentLanguage)
        : t("municipalities.card.noData");
      const lastYear = lastYearEmission?.year.toString() || "";

      const emissionsChangeExists =
        municipality.historicalEmissionChangePercent;
      const emissionsChange = emissionsChangeExists
        ? formatPercentChange(emissionsChangeExists, currentLanguage)
        : t("municipalities.card.noData");

      const hasClimatePlan =
        municipality.climatePlan ??
        Boolean(
          municipality.climatePlanLink &&
            municipality.climatePlanLink !== "Saknar plan",
        );

      return {
        name: municipality.name,
        description: municipality.region,
        logoUrl: municipality.logoUrl,
        linkTo: `/municipalities/${municipality.name}`,
        variant: "municipality" as const,
        meetsParis: meetsParisGoal,
        meetsParisTranslationKey: "municipalities.card.meetsParis",
        emissionsValue: lastYearEmissions,
        emissionsYear: lastYear,
        emissionsUnit: t("emissionsUnit"),
        changeRateValue: emissionsChange,
        changeRateColor:
          emissionsChangeExists > 0 ? "text-pink-3" : "text-orange-2",
        changeRateTooltip: t("municipalities.card.changeRateInfo"),
        climatePlanHasPlan: hasClimatePlan,
        climatePlanYear: hasClimatePlan ? municipality.climatePlanYear : null,
      };
    });
  }, [filteredMunicipalities, currentLanguage, t]);
  return transformedMunicipalities;
};

export default useTransformMunicipalityListCard;

import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import type { Municipality } from "@/types/municipality";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";

interface IUseTransformMunicipalityListCard {
  sortedMunicipalities: Municipality[];
}

// Transform municipality data for ListCard components
const useTransformMunicipalityListCard = ({
  sortedMunicipalities,
}: IUseTransformMunicipalityListCard) => {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  const transformedMunicipalities = sortedMunicipalities.map((municipality) => {
    const { meetsParisGoal } = municipality;

    const lastYearEmission = municipality.emissions.at(-1);
    const lastYearEmissions = lastYearEmission
      ? formatEmissionsAbsolute(lastYearEmission.value, currentLanguage)
      : t("municipalities.card.noData");
    const lastYear = lastYearEmission?.year.toString() || "";

    const emissionsChangeExists = municipality.historicalEmissionChangePercent;
    const emissionsChange = emissionsChangeExists
      ? formatPercentChange(emissionsChangeExists, currentLanguage)
      : t("municipalities.card.noData");

    const noClimatePlan = !municipality.climatePlanLink;

    return {
      name: municipality.name,
      description: municipality.region,
      logoUrl: municipality.logoUrl,
      linkTo: `/municipalities/${municipality.name}`,
      meetsParis: meetsParisGoal,
      meetsParisTranslationKey: "municipalities.card.meetsParis",
      emissionsValue: lastYearEmissions,
      emissionsYear: lastYear,
      emissionsUnit: t("emissionsUnit"),
      changeRateValue: emissionsChange,
      changeRateColor:
        emissionsChangeExists > 0 ? "text-pink-3" : "text-orange-2",
      changeRateTooltip: t("municipalities.card.changeRateInfo"),
      linkCardLink:
        municipality.climatePlanLink &&
        municipality.climatePlanLink !== "Saknar plan"
          ? municipality.climatePlanLink
          : undefined,
      linkCardTitle: t("municipalities.card.climatePlan"),
      linkCardDescription: noClimatePlan
        ? t("municipalities.card.noPlan")
        : t("municipalities.card.adopted", {
            year: municipality.climatePlanYear,
          }),
      linkCardDescriptionColor: noClimatePlan ? "text-pink-3" : "text-green-3",
    };
  });
  return transformedMunicipalities;
};

export default useTransformMunicipalityListCard;

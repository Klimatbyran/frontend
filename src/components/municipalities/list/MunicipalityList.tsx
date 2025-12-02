import { CardGrid } from "@/components/layout/CardGrid";
import { ListCard } from "@/components/layout/ListCard";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { useMemo } from "react";
import type {
  Municipality,
  MunicipalitySortBy,
  MunicipalitySortDirection,
} from "@/types/municipality";

interface MunicipalityListProps {
  municipalities: Municipality[];
  selectedRegion: string;
  searchQuery: string;
  sortBy: MunicipalitySortBy;
  sortDirection: MunicipalitySortDirection;
}
export function MunicipalityList({
  municipalities,
  selectedRegion,
  searchQuery,
  sortBy,
  sortDirection,
}: MunicipalityListProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const filteredMunicipalities = municipalities.filter((municipality) => {
    if (selectedRegion !== "all" && municipality.region !== selectedRegion) {
      return false;
    }

    if (searchQuery) {
      const searchTerms = searchQuery
        .toLowerCase()
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term.length > 0);

      return searchTerms.some((term) =>
        municipality.name.toLowerCase().startsWith(term),
      );
    }

    return true;
  });

  const sortedMunicipalities = filteredMunicipalities.sort((a, b) => {
    const directionMultiplier = sortDirection === "best" ? 1 : -1;
    switch (sortBy) {
      case "meets_paris": {
        return (
          directionMultiplier *
          ((a.meetsParisGoal ? 0 : 1) - (b.meetsParisGoal ? 0 : 1))
        );
      }
      case "name":
        return directionMultiplier * a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Transform municipality data for ListCard components
  const transformedMunicipalities = useMemo(() => {
    return sortedMunicipalities.map((municipality) => {
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
        linkCardDescriptionColor: noClimatePlan
          ? "text-pink-3"
          : "text-green-3",
      };
    });
  }, [sortedMunicipalities, currentLanguage, t]);

  return (
    <div className="space-y-8">
      <CardGrid
        items={transformedMunicipalities}
        itemContent={(transformedData) => (
          <ListCard key={transformedData.linkTo} {...transformedData} />
        )}
      />
    </div>
  );
}

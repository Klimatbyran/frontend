import { useTranslation } from "react-i18next";
import { SortOption } from "@/components/explore/SortPopover";

export const useRegionSortOptions = (): SortOption[] => {
  const { t } = useTranslation();

  return [
    {
      value: "total_emissions",
      label: t("explorePage.regions.sortingOptions.emissions"),
    },
    {
      value: "emissions_reduction",
      label: t("explorePage.regions.sortingOptions.emissionsChangeRate"),
    },
    {
      value: "name",
      label: t("explorePage.regions.sortingOptions.name"),
      directionLabels: {
        asc: t("explorePage.sortingOptions.aToZ"),
        desc: t("explorePage.sortingOptions.zToA"),
      },
      defaultDirection: "asc",
    },
    {
      value: "meets_paris",
      label: t("explorePage.regions.sortingOptions.meetsParis"),
      directionLabels: {
        asc: t("explorePage.sortingOptions.bestFirst"),
        desc: t("explorePage.sortingOptions.worstFirst"),
      },
      defaultDirection: "asc",
    },
  ];
};

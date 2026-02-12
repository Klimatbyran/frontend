import { useTranslation } from "react-i18next";
import { SortOption } from "@/components/explore/SortPopover";

export const useSortOptions = (): SortOption[] => {
  const { t } = useTranslation();

  return [
    {
      value: "total_emissions",
      label: t("explorePage.municipalities.sortingOptions.emissions"),
    },
    {
      value: "emissions_reduction",
      label: t("explorePage.municipalities.sortingOptions.emissionsChangeRate"),
    },
    {
      value: "name",
      label: t("explorePage.municipalities.sortingOptions.name"),
      directionLabels: {
        asc: t("explorePage.sortingOptions.aToZ"),
        desc: t("explorePage.sortingOptions.zToA"),
      },
      defaultDirection: "asc",
    },
    {
      value: "meets_paris",
      label: t("explorePage.municipalities.sortingOptions.meetsParis"),
      directionLabels: {
        asc: t("explorePage.sortingOptions.bestFirst"),
        desc: t("explorePage.sortingOptions.worstFirst"),
      },
    },
  ];
};

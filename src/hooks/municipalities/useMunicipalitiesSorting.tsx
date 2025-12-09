import { SortOption } from "@/components/explore/SortPopover";
import { useTranslation } from "react-i18next";

export const useSortOptions = (): SortOption[] => {
    const { t } = useTranslation();

    return [
    {
      value: "meets_paris", 
      label: t("municipalitiesComparePage.sort.meetsParis"),
      directionLabels: {
        asc: t("municipalitiesComparePage.sort.bestFirst"),
        desc: t("municipalitiesComparePage.sort.worstFirst")
      },
      defaultDirection: "desc"
    },
    {
      value: "name", 
      label: t("municipalitiesComparePage.sort.name"),
      directionLabels: {
        asc: t("municipalitiesComparePage.sort.aToZ"),
        desc: t("municipalitiesComparePage.sort.zToA")
      },
      defaultDirection: "asc"
    }
  ];
}
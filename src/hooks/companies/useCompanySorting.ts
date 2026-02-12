import { useTranslation } from "react-i18next";
import { SortOption } from "@/components/explore/SortPopover";

export const useSortOptions = (): SortOption[] => {
  const { t } = useTranslation();

  return [
    {
      value: "total_emissions",
      label: t("explorePage.companies.sortingOptions.totalEmissions"),
    },
    {
      value: "emissions_reduction",
      label: t("explorePage.companies.sortingOptions.emissionsChange"),
    },
    {
      value: "name",
      label: t("explorePage.companies.sortingOptions.name"),
      directionLabels: {
        asc: t("explorePage.sortingOptions.aToZ"),
        desc: t("explorePage.sortingOptions.zToA"),
      },
      defaultDirection: "asc",
    },
    {
      value: "meets_paris",
      label: t("explorePage.companies.sortingOptions.meetsParis"),
      directionLabels: {
        asc: t("explorePage.sortingOptions.bestFirst"),
        desc: t("explorePage.sortingOptions.worstFirst"),
      },
      defaultDirection: "asc"
    },
    {
      value: "scope3_coverage",
      label: t("explorePage.companies.sortingOptions.scope3Coverage"),
    }, 
  ] as const;
};

const SORT_OPTIONS = [
  "emissions_reduction",
  "total_emissions",
  "scope3_coverage",
  "meets_paris",
  "name",
] as const;
export type CompanySortBy = (typeof SORT_OPTIONS)[number];

export function isSortOption(value: string): value is CompanySortBy {
  return SORT_OPTIONS.includes(value as CompanySortBy);
}
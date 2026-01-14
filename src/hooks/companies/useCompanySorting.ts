import { useTranslation } from "react-i18next";

export const useSortOptions = () => {
  const { t } = useTranslation();

  return [
    {
      value: "emissions_reduction",
      label: t("explorePage.companies.sortingOptions.emissionsChange"),
    },
    {
      value: "total_emissions",
      label: t("explorePage.companies.sortingOptions.totalEmissions"),
    },
    {
      value: "scope3_coverage",
      label: t("explorePage.companies.sortingOptions.scope3Coverage"),
    },
    {
      value: "meets_paris",
      label: t("explorePage.companies.sortingOptions.meetsParis"),
    },
    {
      value: "name_asc",
      label: t("explorePage.companies.sortingOptions.nameAsc"),
    },
    {
      value: "name_desc",
      label: t("explorePage.companies.sortingOptions.nameDesc"),
    },
  ] as const;
};

const SORT_OPTIONS = [
  "emissions_reduction",
  "total_emissions",
  "scope3_coverage",
  "meets_paris",
  "name_asc",
  "name_desc",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export function isSortOption(value: string): value is SortOption {
  return SORT_OPTIONS.includes(value as SortOption);
}

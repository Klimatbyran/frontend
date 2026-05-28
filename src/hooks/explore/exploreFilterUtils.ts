import type { TFunction } from "i18next";
import type { FilterGroup } from "@/components/explore/FilterPopover";
import type { MeetsParisFilter } from "./useExploreFilters";

export function buildMeetsParisFilterGroup(
  t: TFunction,
  headingKey: string,
  meetsParisFilter: MeetsParisFilter,
  setMeetsParisFilter: (value: MeetsParisFilter) => void,
): FilterGroup {
  return {
    heading: t(headingKey),
    options: [
      { value: "all", label: t("all") },
      { value: "yes", label: t("yes") },
      { value: "no", label: t("no") },
    ],
    selectedValues: [meetsParisFilter],
    onSelect: (value: string) => setMeetsParisFilter(value as MeetsParisFilter),
    selectMultiple: false,
  };
}

export function buildMeetsParisActiveFilter(
  t: TFunction,
  headingKey: string,
  meetsParisFilter: MeetsParisFilter,
  reset: () => void,
) {
  if (meetsParisFilter === "all") return [];

  const label = `${t(headingKey)}: ${
    meetsParisFilter === "yes" ? t("yes") : t("no")
  }`;

  return [
    {
      type: "filter" as const,
      label,
      onRemove: reset,
    },
  ];
}

export function getSearchTerms(searchQuery: string): string[] {
  return searchQuery
    .toLowerCase()
    .split(",")
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
}

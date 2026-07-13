import type { TFunction } from "i18next";
import { regions } from "@/lib/constants/regions";
import type { FilterGroup } from "@/components/explore/FilterPopover";
import type { MeetsParisFilter } from "@/hooks/explore/useExploreFilters";
import {
  buildMeetsParisActiveFilter,
  buildMeetsParisFilterGroup,
} from "@/hooks/explore/exploreFilterUtils";

export function buildRegionFilterGroup(
  t: TFunction,
  selectedRegions: string[],
  setSelectedRegions: (regions: string[]) => void,
): FilterGroup {
  return {
    heading: t("explorePage.municipalities.filteringOptions.selectRegion"),
    options: [
      {
        value: "all",
        label: t("explorePage.municipalities.filteringOptions.allRegions"),
      },
      ...Object.keys(regions).map((r) => ({ value: r, label: r })),
    ],
    selectedValues: selectedRegions,
    onSelect: (value: string) => {
      if (value === "all") {
        setSelectedRegions(["all"]);
      } else if (selectedRegions.includes("all")) {
        setSelectedRegions([value]);
      } else if (selectedRegions.includes(value)) {
        setSelectedRegions(selectedRegions.filter((s) => s !== value));
      } else {
        setSelectedRegions([...selectedRegions, value]);
      }
    },
    selectMultiple: true,
  };
}

export function buildMunicipalityActiveFilters(
  t: TFunction,
  selectedRegions: string[],
  meetsParisFilter: MeetsParisFilter,
  setSelectedRegions: (regions: string[]) => void,
  setMeetsParisFilter: (value: MeetsParisFilter) => void,
) {
  return [
    ...(selectedRegions.includes("all")
      ? []
      : selectedRegions.map((selectedRegion) => ({
          type: "filter" as const,
          label: selectedRegion,
          onRemove: () =>
            setSelectedRegions(
              selectedRegions.filter((s) => s !== selectedRegion),
            ),
        }))),
    ...buildMeetsParisActiveFilter(
      t,
      "explorePage.municipalities.sortingOptions.meetsParis",
      meetsParisFilter,
      () => setMeetsParisFilter("all"),
    ),
  ];
}

export function parseSelectedRegions(searchParams: URLSearchParams): string[] {
  return (searchParams
    .get("selectedRegions")
    ?.split(",")
    .filter(
      (s) => Object.keys(regions).some((region) => region === s) || s == "all",
    ) ?? ["all"]) as string[];
}

export { buildMeetsParisFilterGroup };

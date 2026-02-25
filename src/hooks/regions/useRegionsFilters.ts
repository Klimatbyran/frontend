import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { RegionForExplore } from "./useRegionsForExplore";
import { FilterGroup } from "@/components/explore/FilterPopover";
import { useRegionSortOptions } from "./useRegionSorting";
import {
  useExploreFilters,
  type MeetsParisFilter,
} from "@/hooks/explore/useExploreFilters";
import type { SortDirection } from "@/components/explore/SortPopover";

type RegionSortBy =
  | "total_emissions"
  | "emissions_reduction"
  | "name"
  | "meets_paris";
function isRegionSortBy(s: string): s is RegionSortBy {
  return [
    "total_emissions",
    "emissions_reduction",
    "name",
    "meets_paris",
  ].includes(s);
}

export function useRegionsFilters(regions: RegionForExplore[]) {
  const { t } = useTranslation();
  const sortOptions = useRegionSortOptions();

  const {
    searchQuery,
    setSearchQuery,
    meetsParisFilter,
    setMeetsParisFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
  } = useExploreFilters<RegionSortBy>({
    defaultSortBy: "total_emissions",
    isValidSortBy: isRegionSortBy,
    sortOptions,
  });

  const filteredRegions = useMemo(
    () =>
      filterAndSortRegions(regions, {
        meetsParisFilter,
        searchQuery,
        sortBy,
        sortDirection,
      }),
    [regions, meetsParisFilter, searchQuery, sortBy, sortDirection],
  );

  const filterGroups: FilterGroup[] = [
    {
      heading: t("explorePage.regions.sortingOptions.meetsParis"),
      options: [
        { value: "all", label: t("all") },
        { value: "yes", label: t("yes") },
        { value: "no", label: t("no") },
      ],
      selectedValues: [meetsParisFilter],
      onSelect: (value: string) =>
        setMeetsParisFilter(value as MeetsParisFilter),
      selectMultiple: false,
    },
  ];

  const activeFilters = useMemo(
    () => [
      ...(meetsParisFilter !== "all"
        ? [
            {
              type: "filter" as const,
              label: `${t("explorePage.regions.sortingOptions.meetsParis")}: ${
                meetsParisFilter === "yes" ? t("yes") : t("no")
              }`,
              onRemove: () => setMeetsParisFilter("all"),
            },
          ]
        : []),
    ],
    [meetsParisFilter, t, setMeetsParisFilter],
  );

  return {
    searchQuery,
    setSearchQuery,
    meetsParisFilter,
    setMeetsParisFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filteredRegions,
    filterGroups,
    activeFilters,
    sortOptions,
  };
}

function filterAndSortRegions(
  regions: RegionForExplore[],
  filters: {
    meetsParisFilter: MeetsParisFilter;
    searchQuery: string;
    sortBy: RegionSortBy;
    sortDirection: SortDirection;
  },
): RegionForExplore[] {
  const { meetsParisFilter, searchQuery, sortBy, sortDirection } = filters;

  const searchTerms = searchQuery
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return regions
    .filter((region) => {
      if (meetsParisFilter === "yes" && !region.meetsParis) return false;
      if (meetsParisFilter === "no" && region.meetsParis) return false;
      if (searchTerms.length === 0) return true;
      return searchTerms.some((term) =>
        region.name.toLowerCase().includes(term),
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      const lastYearA = getLastEmissionYear(a);
      const lastYearB = getLastEmissionYear(b);
      const emissionsA = lastYearA ? (a.emissions[lastYearA] ?? 0) : 0;
      const emissionsB = lastYearB ? (b.emissions[lastYearB] ?? 0) : 0;

      switch (sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "total_emissions":
          cmp = emissionsA - emissionsB;
          break;
        case "emissions_reduction":
          cmp =
            a.historicalEmissionChangePercent -
            b.historicalEmissionChangePercent;
          break;
        case "meets_paris":
          cmp = (a.meetsParis ? 1 : 0) - (b.meetsParis ? 1 : 0);
          break;
        default:
          cmp = emissionsA - emissionsB;
      }

      if (sortDirection === "asc") return cmp;
      return -cmp;
    });
}

function getLastEmissionYear(region: RegionForExplore): string | null {
  const years = Object.keys(region.emissions)
    .filter((y) => !isNaN(Number(y)))
    .map(Number)
    .sort((a, b) => b - a);
  return years.length > 0 ? String(years[0]) : null;
}

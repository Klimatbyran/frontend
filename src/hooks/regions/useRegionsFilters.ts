import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  type RegionForExplore,
  getLastEmissionYear,
} from "./useRegionsForExplore";
import { useRegionSortOptions } from "./useRegionSorting";
import {
  useExploreFilters,
  type MeetsParisFilter,
} from "@/hooks/explore/useExploreFilters";
import {
  buildMeetsParisFilterGroup,
  buildMeetsParisActiveFilter,
  getSearchTerms,
} from "@/hooks/explore/exploreFilterUtils";
import type { SortDirection } from "@/components/explore/SortPopover";
import { buildSearchRegex } from "@/utils/data/search";
import { SupportedLanguage } from "@/lib/languageDetection";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { currentLanguage } = useLanguage();
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
      filterAndSortRegions(
        regions,
        {
          meetsParisFilter,
          searchQuery,
          sortBy,
          sortDirection,
        },
        currentLanguage,
      ),
    [
      regions,
      meetsParisFilter,
      searchQuery,
      sortBy,
      sortDirection,
      currentLanguage,
    ],
  );

  const filterGroups = [
    buildMeetsParisFilterGroup(
      t,
      "explorePage.regions.sortingOptions.meetsParis",
      meetsParisFilter,
      setMeetsParisFilter,
    ),
  ];

  const activeFilters = useMemo(
    () =>
      buildMeetsParisActiveFilter(
        t,
        "explorePage.regions.sortingOptions.meetsParis",
        meetsParisFilter,
        () => setMeetsParisFilter("all"),
      ),
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
  currentLanguage: SupportedLanguage,
): RegionForExplore[] {
  const { meetsParisFilter, searchQuery, sortBy, sortDirection } = filters;

  const searchPatterns = getSearchTerms(searchQuery).map((s) =>
    buildSearchRegex(s, currentLanguage, false),
  );

  return regions
    .filter((region) => {
      if (meetsParisFilter === "yes" && !region.meetsParis) return false;
      if (meetsParisFilter === "no" && region.meetsParis) return false;
      if (searchPatterns.length === 0) return true;
      return searchPatterns.some((pattern) => pattern.test(region.name));
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

import {
  Municipality,
  type MunicipalitySortBy,
} from "@/types/municipality";
import type { SortDirection } from "@/components/explore/SortPopover";
import type { MeetsParisFilter } from "@/hooks/explore/useExploreFilters";
import { getSearchTerms } from "@/hooks/explore/exploreFilterUtils";

export const filterAndSortMunicipalities = (
  municipalities: Municipality[],
  filters: {
    selectedRegions: string[];
    meetsParisFilter: MeetsParisFilter;
    searchQuery: string;
    sortBy: MunicipalitySortBy;
    sortDirection: SortDirection;
  },
): Municipality[] => {
  const {
    selectedRegions,
    meetsParisFilter,
    searchQuery,
    sortBy,
    sortDirection,
  } = filters;
  return municipalities
    .filter((municipality) => {
      if (
        !selectedRegions.includes("all") &&
        !selectedRegions.includes(municipality.region)
      ) {
        return false;
      }

      if (meetsParisFilter !== "all") {
        const meetsGoal = municipality.meetsParisGoal;
        if (meetsParisFilter === "yes" && meetsGoal !== true) {
          return false;
        }
        if (meetsParisFilter === "no" && meetsGoal !== false) {
          return false;
        }
      }

      if (searchQuery) {
        const searchTerms = getSearchTerms(searchQuery);
        return searchTerms.some((term) =>
          municipality.name.toLowerCase().startsWith(term),
        );
      }

      return true;
    })
    .sort((a, b) => sortMunicipalities(a, b, sortBy, sortDirection));
};

const sortMunicipalities = (
  a: Municipality,
  b: Municipality,
  sortBy: MunicipalitySortBy,
  sortDirection: SortDirection,
): number => {
  const directionMultiplier = sortDirection === "desc" ? -1 : 1;
  switch (sortBy) {
    case "meets_paris":
      return compareMeetsParis(a, b, directionMultiplier);
    case "name":
      return compareNames(a, b, directionMultiplier);
    case "total_emissions":
      return compareEmissions(a, b, directionMultiplier);
    case "emissions_reduction":
      return compareEmissionsChangeRate(a, b, directionMultiplier);
    default:
      return 0;
  }
};

const compareMeetsParis = (
  a: Municipality,
  b: Municipality,
  multiplier: number,
): number => {
  return multiplier * ((a.meetsParisGoal ? 0 : 1) - (b.meetsParisGoal ? 0 : 1));
};

const compareNames = (
  a: Municipality,
  b: Municipality,
  multiplier: number,
): number => {
  return multiplier * a.name.localeCompare(b.name);
};

const compareEmissions = (
  a: Municipality,
  b: Municipality,
  multiplier: number,
): number => {
  return (
    multiplier *
    ((a.emissions?.at(-1)?.value ?? 0) - (b.emissions?.at(-1)?.value ?? 0))
  );
};

const compareEmissionsChangeRate = (
  a: Municipality,
  b: Municipality,
  multiplier: number,
): number => {
  return (
    multiplier *
    (a.historicalEmissionChangePercent - b.historicalEmissionChangePercent)
  );
};

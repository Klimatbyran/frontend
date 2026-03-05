import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Municipality,
  isMunicipalitySortBy,
  type MunicipalitySortBy,
} from "@/types/municipality";
import { regions } from "@/lib/constants/regions";
import { useSortOptions } from "./useMunicipalitiesSorting";
import setOrDeleteSearchParam from "@/utils/data/setOrDeleteSearchParam";
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

export const useMunicipalitiesFilters = (municipalities: Municipality[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const sortOptions = useSortOptions();

  const {
    searchQuery,
    setSearchQuery,
    meetsParisFilter,
    setMeetsParisFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
  } = useExploreFilters<MunicipalitySortBy>({
    defaultSortBy: "total_emissions",
    isValidSortBy: isMunicipalitySortBy,
    sortOptions,
  });

  const selectedRegions = (searchParams
    .get("selectedRegions")
    ?.split(",")
    .filter(
      (s) => Object.keys(regions).some((region) => region === s) || s == "all",
    ) ?? ["all"]) as string[];
  const setSelectedRegions = useCallback(
    (selectedRegions: string[]) =>
      setOrDeleteSearchParam(
        setSearchParams,
        selectedRegions.length > 0 ? selectedRegions.join(",") : null,
        "selectedRegions",
      ),
    [],
  );
  const filteredMunicipalities = useMemo(
    () =>
      filterAndSortMunicipalities(municipalities, {
        selectedRegions,
        meetsParisFilter,
        searchQuery,
        sortBy,
        sortDirection,
      }),
    [
      municipalities,
      selectedRegions,
      meetsParisFilter,
      searchQuery,
      sortBy,
      sortDirection,
    ],
  );

  const filterGroups = [
    {
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
    },
    buildMeetsParisFilterGroup(
      t,
      "explorePage.municipalities.sortingOptions.meetsParis",
      meetsParisFilter,
      setMeetsParisFilter,
    ),
  ];

  const activeFilters = useMemo(() => {
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
  }, [
    selectedRegions,
    meetsParisFilter,
    t,
    setSelectedRegions,
    setMeetsParisFilter,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    selectedRegions,
    setSelectedRegions,
    meetsParisFilter,
    setMeetsParisFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filteredMunicipalities,
    filterGroups,
    activeFilters,
  };
};

const filterAndSortMunicipalities = (
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
      // Filter by region
      if (
        !selectedRegions.includes("all") &&
        !selectedRegions.includes(municipality.region)
      ) {
        return false;
      }

      // Filter by meets Paris
      if (meetsParisFilter !== "all") {
        const meetsGoal = municipality.meetsParisGoal;
        if (meetsParisFilter === "yes" && meetsGoal !== true) {
          return false;
        }
        if (meetsParisFilter === "no" && meetsGoal !== false) {
          return false;
        }
      }

      // Filter by search query
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

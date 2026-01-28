import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Municipality,
  isMunicipalitySortBy,
  type MunicipalitySortBy,
  isMeetsParisFilter,
  type MeetsParisFilter,
} from "@/types/municipality";
import {
  isSortDirection,
  type SortDirection,
} from "@/components/explore/SortPopover";
import { FilterGroup } from "@/components/explore/FilterPopover";
import { regions } from "@/lib/constants/regions";

export const useMunicipalitiesFilters = (municipalities: Municipality[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const searchQuery = searchParams.get("searchQuery") || "";
  const meetsParisFilter = isMeetsParisFilter(
    searchParams.get("meetsParisFilter") ?? "",
  )
    ? (searchParams.get("meetsParisFilter") as MeetsParisFilter)
    : "all";
  const selectedRegion = searchParams.get("selectedRegion") || "all";
  const sortBy = isMunicipalitySortBy(searchParams.get("sortBy") ?? "")
    ? (searchParams.get("sortBy") as MunicipalitySortBy)
    : "emissions";
  const sortDirection = (
    isSortDirection(searchParams.get("sortDirection") ?? "")
      ? searchParams.get("sortDirection")
      : "desc"
  ) as SortDirection;

  const setOrDeleteSearchParam = useCallback(
    (value: string | null, param: string) => {
      setSearchParams(
        (searchParams) => {
          if (value) {
            searchParams.set(param, value);
          } else {
            searchParams.delete(param);
          }
          return searchParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSearchQuery = useCallback(
    (searchQuery: string) =>
      setOrDeleteSearchParam(searchQuery.trim() || null, "searchQuery"),
    [setOrDeleteSearchParam],
  );
  const setMeetsParisFilter = useCallback(
    (meetsParisFilter: string) =>
      setOrDeleteSearchParam(meetsParisFilter, "meetsParisFilter"),
    [setOrDeleteSearchParam],
  );
  const setSelectedRegion = useCallback(
    (selectedRegion: string) =>
      setOrDeleteSearchParam(selectedRegion, "selectedRegion"),
    [setOrDeleteSearchParam],
  );
  const setSortBy = useCallback(
    (sortBy: string) => setOrDeleteSearchParam(sortBy, "sortBy"),
    [setOrDeleteSearchParam],
  );
  const setSortDirection = useCallback(
    (sortDirection: string) =>
      setOrDeleteSearchParam(sortDirection, "sortDirection"),
    [setOrDeleteSearchParam],
  );

  const filteredMunicipalities = useMemo(
    () =>
      filterAndSortMunicipalities(municipalities, {
        selectedRegion,
        meetsParisFilter,
        searchQuery,
        sortBy,
        sortDirection,
      }),
    [
      municipalities,
      selectedRegion,
      meetsParisFilter,
      searchQuery,
      sortBy,
      sortDirection,
    ],
  );

  const filterGroups: FilterGroup[] = [
    {
      heading: t("explorePage.municipalities.filteringOptions.selectRegion"),
      options: [
        {
          value: "all",
          label: t("explorePage.municipalities.filteringOptions.allRegions"),
        },
        ...Object.keys(regions).map((r) => ({ value: r, label: r })),
      ],
      selectedValues: [selectedRegion],
      onSelect: setSelectedRegion,
      selectMultiple: false,
    },
    {
      heading: t("explorePage.municipalities.sortingOptions.meetsParis"),
      options: [
        { value: "all", label: t("all") },
        {
          value: "yes",
          label: t("yes"),
        },
        {
          value: "no",
          label: t("no"),
        },
      ],
      selectedValues: [meetsParisFilter],
      onSelect: (value: string) =>
        setMeetsParisFilter(value as MeetsParisFilter),
      selectMultiple: false,
    },
  ];

  const activeFilters = useMemo(() => {
    return [
      ...(selectedRegion !== "all"
        ? [
            {
              type: "filter" as const,
              label: selectedRegion,
              onRemove: () => setSelectedRegion("all"),
            },
          ]
        : []),
      ...(meetsParisFilter !== "all"
        ? [
            {
              type: "filter" as const,
              label: `${t("explorePage.municipalities.sortingOptions.meetsParis")}: ${
                meetsParisFilter === "yes" ? t("yes") : t("no")
              }`,
              onRemove: () => setMeetsParisFilter("all"),
            },
          ]
        : []),
    ];
  }, [
    selectedRegion,
    meetsParisFilter,
    t,
    setSelectedRegion,
    setMeetsParisFilter,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
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
    selectedRegion: string;
    meetsParisFilter: MeetsParisFilter;
    searchQuery: string;
    sortBy: MunicipalitySortBy;
    sortDirection: SortDirection;
  },
): Municipality[] => {
  const {
    selectedRegion,
    meetsParisFilter,
    searchQuery,
    sortBy,
    sortDirection,
  } = filters;
  return municipalities
    .filter((municipality) => {
      // Filter by region
      if (selectedRegion !== "all" && municipality.region !== selectedRegion) {
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
        const searchTerms = searchQuery
          .toLowerCase()
          .split(",")
          .map((term) => term.trim())
          .filter((term) => term.length > 0);

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
    case "emissions":
      return compareEmissions(a, b, directionMultiplier);
    case "emissionsChangeRate":
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

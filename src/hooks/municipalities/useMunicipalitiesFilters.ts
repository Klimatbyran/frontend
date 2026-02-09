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
import setOrDeleteSearchParam from "@/utils/data/setOrDeleteSearchParam";
import { useSortOptions } from "./useMunicipalitiesSorting";

export const useMunicipalitiesFilters = (municipalities: Municipality[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const sortOptions = useSortOptions();

  const searchQuery = searchParams.get("searchQuery") || "";
  const meetsParisFilter = isMeetsParisFilter(
    searchParams.get("meetsParisFilter") ?? "",
  )
    ? (searchParams.get("meetsParisFilter") as MeetsParisFilter)
    : "all";
  const selectedRegions = (searchParams
    .get("selectedRegions")
    ?.split(",")
    .filter(
      (s) => Object.keys(regions).some((region) => region === s) || s == "all",
    ) ?? ["all"]) as string[];
  const sortBy = isMunicipalitySortBy(searchParams.get("sortBy") ?? "")
    ? (searchParams.get("sortBy") as MunicipalitySortBy)
    : "total_emissions";
  const sortDirection = (
    isSortDirection(searchParams.get("sortDirection") ?? "")
      ? searchParams.get("sortDirection")
      : sortOptions.find(o => o.value == sortBy)?.defaultDirection ?? "desc"
  ) as SortDirection;

  const setSearchQuery = useCallback(
    (searchQuery: string) =>
      setOrDeleteSearchParam(
        setSearchParams,
        searchQuery.trim() || null,
        "searchQuery",
      ),
    [],
  );
  const setMeetsParisFilter = useCallback(
    (meetsParisFilter: string) =>
      setOrDeleteSearchParam(
        setSearchParams,
        meetsParisFilter,
        "meetsParisFilter",
      ),
    [],
  );
  const setSelectedRegions = useCallback(
    (selectedRegions: string[]) =>
      setOrDeleteSearchParam(
        setSearchParams,
        selectedRegions.length > 0 ? selectedRegions.join(",") : null,
        "selectedRegions",
      ),
    [],
  );
  const setSortBy = useCallback(
    (sortBy: string) =>
      setOrDeleteSearchParam(setSearchParams, sortBy, "sortBy"),
    [],
  );
  const setSortDirection = useCallback(
    (sortDirection: string) =>
      setOrDeleteSearchParam(setSearchParams, sortDirection, "sortDirection"),
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
      ...(!selectedRegions.includes("all")
        ? selectedRegions.map((selectedRegion) => ({
            type: "filter" as const,
            label: selectedRegion,
            onRemove: () =>
              setSelectedRegions(
                selectedRegions.filter((s) => s !== selectedRegion),
              ),
          }))
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

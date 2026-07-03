import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Municipality,
  isMunicipalitySortBy,
  type MunicipalitySortBy,
} from "@/types/municipality";
import { useSortOptions } from "./useMunicipalitiesSorting";
import setOrDeleteSearchParam from "@/utils/data/setOrDeleteSearchParam";
import { useExploreFilters } from "@/hooks/explore/useExploreFilters";
import {
  parseSelectedRegions,
} from "./municipalityFilterUtils";
import { filterAndSortMunicipalities } from "./municipalityFilterSort";
import { useMunicipalityFilterGroups } from "./useMunicipalityFilterGroups";

function useMunicipalityRegionFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRegions = parseSelectedRegions(searchParams);

  const setSelectedRegions = useCallback(
    (value: string[]) =>
      setOrDeleteSearchParam(
        setSearchParams,
        value.length > 0 ? value.join(",") : null,
        "selectedRegions",
      ),
    [setSearchParams],
  );

  return { selectedRegions, setSelectedRegions };
}

export const useMunicipalitiesFilters = (municipalities: Municipality[]) => {
  const { t } = useTranslation();
  const sortOptions = useSortOptions();
  const { selectedRegions, setSelectedRegions } = useMunicipalityRegionFilter();

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

  const { filterGroups, activeFilters } = useMunicipalityFilterGroups({
    t,
    selectedRegions,
    setSelectedRegions,
    meetsParisFilter,
    setMeetsParisFilter,
  });

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

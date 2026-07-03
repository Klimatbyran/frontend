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
  buildMunicipalityActiveFilters,
  buildMeetsParisFilterGroup,
  buildRegionFilterGroup,
  parseSelectedRegions,
} from "./municipalityFilterUtils";
import { filterAndSortMunicipalities } from "./municipalityFilterSort";

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

  const filterGroups = useMemo(
    () => [
      buildRegionFilterGroup(t, selectedRegions, setSelectedRegions),
      buildMeetsParisFilterGroup(
        t,
        "explorePage.municipalities.sortingOptions.meetsParis",
        meetsParisFilter,
        setMeetsParisFilter,
      ),
    ],
    [t, selectedRegions, setSelectedRegions, meetsParisFilter, setMeetsParisFilter],
  );

  const activeFilters = useMemo(
    () =>
      buildMunicipalityActiveFilters(
        t,
        selectedRegions,
        meetsParisFilter,
        setSelectedRegions,
        setMeetsParisFilter,
      ),
    [selectedRegions, meetsParisFilter, t, setSelectedRegions, setMeetsParisFilter],
  );

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

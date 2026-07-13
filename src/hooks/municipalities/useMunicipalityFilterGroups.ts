import { useMemo } from "react";
import type { TFunction } from "i18next";
import type { MeetsParisFilter } from "@/hooks/explore/useExploreFilters";
import {
  buildMunicipalityActiveFilters,
  buildMeetsParisFilterGroup,
  buildRegionFilterGroup,
} from "./municipalityFilterUtils";

interface UseMunicipalityFilterGroupsOptions {
  t: TFunction;
  selectedRegions: string[];
  setSelectedRegions: (value: string[]) => void;
  meetsParisFilter: MeetsParisFilter;
  setMeetsParisFilter: (value: MeetsParisFilter) => void;
}

export function useMunicipalityFilterGroups({
  t,
  selectedRegions,
  setSelectedRegions,
  meetsParisFilter,
  setMeetsParisFilter,
}: UseMunicipalityFilterGroupsOptions) {
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
    [
      t,
      selectedRegions,
      setSelectedRegions,
      meetsParisFilter,
      setMeetsParisFilter,
    ],
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
    [
      selectedRegions,
      meetsParisFilter,
      t,
      setSelectedRegions,
      setMeetsParisFilter,
    ],
  );

  return { filterGroups, activeFilters };
}

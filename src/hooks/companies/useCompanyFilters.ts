import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { RankedCompany } from "@/types/company";
import {
  useSectorNames,
  useSectors,
} from "@/hooks/companies/useCompanySectors";
import { CompanySector } from "@/lib/constants/sectors";
import setOrDeleteSearchParam from "@/utils/data/setOrDeleteSearchParam";
import {
  isSortOption,
  useSortOptions,
  type CompanySortBy,
} from "./useCompanySorting";
import { useExploreFilters } from "@/hooks/explore/useExploreFilters";
import {
  buildCompanyFilterUi,
  filterAndSortCompanies,
  parseCompanySectors,
  parseMeetsParisFilter,
} from "./companyFilterUtils";

type UseCompanyFiltersOptions = {
  includeSectorFilter?: boolean;
};

function useCompanySearchParamSetters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const setMeetsParisFilter = useCallback(
    (value: string) =>
      setOrDeleteSearchParam(setSearchParams, value, "meetsParisFilter"),
    [setSearchParams],
  );
  const setSectors = useCallback(
    (value: CompanySector[]) =>
      setOrDeleteSearchParam(
        setSearchParams,
        value.length > 0 ? value.join(",") : null,
        "sectors",
      ),
    [setSearchParams],
  );

  return { searchParams, setMeetsParisFilter, setSectors };
}

export const useCompanyFilters = (
  companies: RankedCompany[],
  options: UseCompanyFiltersOptions = {},
) => {
  const { includeSectorFilter = true } = options;
  const { searchParams, setMeetsParisFilter, setSectors } =
    useCompanySearchParamSetters();
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const sectorOptions = useSectors();

  const exploreFilters = useExploreFilters<CompanySortBy>({
    defaultSortBy: "total_emissions",
    isValidSortBy: isSortOption,
    sortOptions: useSortOptions(),
  });

  const meetsParisFilter = parseMeetsParisFilter(searchParams);
  const sectors = parseCompanySectors(searchParams, includeSectorFilter);

  const filteredCompanies = useMemo(
    () =>
      filterAndSortCompanies(companies, {
        sectors,
        searchQuery: exploreFilters.searchQuery,
        meetsParisFilter,
        sortBy: exploreFilters.sortBy,
        sortDirection: exploreFilters.sortDirection,
        sectorNames,
      }),
    [companies, sectors, exploreFilters, meetsParisFilter, sectorNames],
  );

  const { filterGroups, activeFilters } = useMemo(
    () =>
      buildCompanyFilterUi(t, {
        includeSectorFilter,
        sectorOptions,
        sectors,
        meetsParisFilter,
        sectorNames,
        setSectors,
        setMeetsParisFilter,
      }),
    [
      t,
      includeSectorFilter,
      sectorOptions,
      sectors,
      meetsParisFilter,
      sectorNames,
      setSectors,
      setMeetsParisFilter,
    ],
  );

  return {
    ...exploreFilters,
    sectors,
    setSectors,
    meetsParisFilter,
    setMeetsParisFilter,
    filteredCompanies,
    filterGroups,
    activeFilters,
  };
};

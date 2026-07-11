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
import type { CompanyCountryTagSlug } from "@/lib/constants/companyCountryTags";
import {
  getAvailableCountryOptions,
  parseCountriesFromURL,
  toggleCountrySelection,
  useCompanyCountryNames,
} from "./companyCountryFilterUtils";

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
  const setSelectedCountries = useCallback(
    (countries: CompanyCountryTagSlug[]) =>
      setOrDeleteSearchParam(
        setSearchParams,
        countries.length > 0 ? countries.join(",") : null,
        "countries",
      ),
    [setSearchParams],
  );

  return {
    searchParams,
    setMeetsParisFilter,
    setSectors,
    setSelectedCountries,
  };
}

function useFilteredCompanies(
  companies: RankedCompany[],
  params: {
    sectors: ReturnType<typeof parseCompanySectors>;
    selectedCountries: CompanyCountryTagSlug[];
    searchQuery: string;
    meetsParisFilter: ReturnType<typeof parseMeetsParisFilter>;
    sortBy: CompanySortBy;
    sortDirection: ReturnType<typeof useExploreFilters<CompanySortBy>>["sortDirection"];
    sectorNames: Record<string, string>;
  },
) {
  return useMemo(
    () => filterAndSortCompanies(companies, params),
    [companies, params],
  );
}

function useCompanyFilterGroups(
  companies: RankedCompany[],
  options: {
    includeSectorFilter: boolean;
    searchParams: URLSearchParams;
    sectorNames: Record<string, string>;
    sectorOptions: ReturnType<typeof useSectors>;
    countryNames: ReturnType<typeof useCompanyCountryNames>;
    setSectors: (value: CompanySector[]) => void;
    setSelectedCountries: (countries: CompanyCountryTagSlug[]) => void;
    setMeetsParisFilter: (value: string) => void;
  },
) {
  const { t } = useTranslation();
  const {
    includeSectorFilter,
    searchParams,
    sectorNames,
    sectorOptions,
    countryNames,
    setSectors,
    setSelectedCountries,
    setMeetsParisFilter,
  } = options;

  const meetsParisFilter = parseMeetsParisFilter(searchParams);
  const sectors = parseCompanySectors(searchParams, includeSectorFilter);
  const selectedCountries = parseCountriesFromURL(searchParams);
  const availableCountries = useMemo(
    () => getAvailableCountryOptions(companies),
    [companies],
  );

  const { filterGroups, activeFilters } = useMemo(
    () =>
      buildCompanyFilterUi(t, {
        includeSectorFilter,
        sectorOptions,
        sectors,
        selectedCountries,
        availableCountries,
        meetsParisFilter,
        sectorNames,
        countryNames,
        setSectors,
        setSelectedCountries,
        onCountrySelect: (value) =>
          setSelectedCountries(
            toggleCountrySelection(selectedCountries, value),
          ),
        setMeetsParisFilter,
      }),
    [
      t,
      includeSectorFilter,
      sectorOptions,
      sectors,
      selectedCountries,
      availableCountries,
      meetsParisFilter,
      sectorNames,
      countryNames,
      setSectors,
      setSelectedCountries,
      setMeetsParisFilter,
    ],
  );

  return {
    sectors,
    selectedCountries,
    meetsParisFilter,
    filterGroups,
    activeFilters,
  };
}

function useCompanyFilterUiState(
  companies: RankedCompany[],
  options: {
    includeSectorFilter: boolean;
    searchParams: URLSearchParams;
    exploreFilters: ReturnType<typeof useExploreFilters<CompanySortBy>>;
    sectorNames: Record<string, string>;
    sectorOptions: ReturnType<typeof useSectors>;
    countryNames: ReturnType<typeof useCompanyCountryNames>;
    setSectors: (value: CompanySector[]) => void;
    setSelectedCountries: (countries: CompanyCountryTagSlug[]) => void;
    setMeetsParisFilter: (value: string) => void;
  },
) {
  const { exploreFilters, sectorNames } = options;
  const {
    sectors,
    selectedCountries,
    meetsParisFilter,
    filterGroups,
    activeFilters,
  } = useCompanyFilterGroups(companies, options);

  const filteredCompanies = useFilteredCompanies(companies, {
    sectors,
    selectedCountries,
    searchQuery: exploreFilters.searchQuery,
    meetsParisFilter,
    sortBy: exploreFilters.sortBy,
    sortDirection: exploreFilters.sortDirection,
    sectorNames,
  });

  return {
    sectors,
    selectedCountries,
    meetsParisFilter,
    filteredCompanies,
    filterGroups,
    activeFilters,
  };
}

export const useCompanyFilters = (
  companies: RankedCompany[],
  options: UseCompanyFiltersOptions = {},
) => {
  const { includeSectorFilter = true } = options;
  const {
    searchParams,
    setMeetsParisFilter,
    setSectors,
    setSelectedCountries,
  } = useCompanySearchParamSetters();
  const sectorNames = useSectorNames();
  const sectorOptions = useSectors();
  const countryNames = useCompanyCountryNames();

  const exploreFilters = useExploreFilters<CompanySortBy>({
    defaultSortBy: "total_emissions",
    isValidSortBy: isSortOption,
    sortOptions: useSortOptions(),
  });

  const {
    sectors,
    selectedCountries,
    meetsParisFilter,
    filteredCompanies,
    filterGroups,
    activeFilters,
  } = useCompanyFilterUiState(companies, {
    includeSectorFilter,
    searchParams,
    exploreFilters,
    sectorNames,
    sectorOptions,
    countryNames,
    setSectors,
    setSelectedCountries,
    setMeetsParisFilter,
  });

  return {
    ...exploreFilters,
    sectors,
    setSectors,
    selectedCountries,
    setSelectedCountries,
    meetsParisFilter,
    setMeetsParisFilter,
    filteredCompanies,
    filterGroups,
    activeFilters,
  };
};

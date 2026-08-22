import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { RankedCompany } from "@/types/company";
import {
  useIndustryGroupFilterOptionGroups,
  useIndustryGroupNames,
  useSectorNames,
  useSectors,
} from "@/hooks/companies/useCompanySectors";
import { CompanySector, IndustryGroupOption } from "@/lib/constants/sectors";
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
  parseIndustryGroups,
  parseMeetsParisFilter,
} from "./companyFilterUtils";
import type { CompanyCountryTagSlug } from "@/lib/constants/companyCountryTags";
import {
  getAvailableCountryOptions,
  parseCountriesFromURL,
  toggleCountrySelection,
  useCompanyCountryNames,
} from "./companyCountryFilterUtils";
import { FilterOptionGroup } from "@/components/explore/FilterPopover";

type UseCompanyFiltersOptions = {
  includeSectorFilter?: boolean;
  includeIndustryGroupFilter?: boolean;
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
  const setIndustryGroups = useCallback(
    (value: IndustryGroupOption[]) =>
      setOrDeleteSearchParam(
        setSearchParams,
        value.length > 0 ? value.join(",") : null,
        "industryGroups",
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
    setIndustryGroups,
    setSelectedCountries,
  };
}

function useFilteredCompanies(
  companies: RankedCompany[],
  params: {
    sectors: ReturnType<typeof parseCompanySectors>;
    industryGroups: IndustryGroupOption[];
    selectedCountries: CompanyCountryTagSlug[];
    searchQuery: string;
    meetsParisFilter: ReturnType<typeof parseMeetsParisFilter>;
    sortBy: CompanySortBy;
    sortDirection: ReturnType<
      typeof useExploreFilters<CompanySortBy>
    >["sortDirection"];
    sectorNames: Record<string, string>;
    industryGroupNames: Record<string, string>;
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
    includeIndustryGroupFilter: boolean;
    searchParams: URLSearchParams;
    sectorNames: Record<string, string>;
    sectorOptions: ReturnType<typeof useSectors>;
    industryGroupNames: Record<string, string>;
    industryGroupFilterOptionGroups: FilterOptionGroup[];
    countryNames: ReturnType<typeof useCompanyCountryNames>;
    setSectors: (value: CompanySector[]) => void;
    setIndustryGroups: (value: IndustryGroupOption[]) => void;
    setSelectedCountries: (countries: CompanyCountryTagSlug[]) => void;
    setMeetsParisFilter: (value: string) => void;
  },
) {
  const { t } = useTranslation();
  const {
    includeSectorFilter,
    includeIndustryGroupFilter,
    searchParams,
    sectorNames,
    sectorOptions,
    industryGroupNames,
    industryGroupFilterOptionGroups,
    countryNames,
    setSectors,
    setIndustryGroups,
    setSelectedCountries,
    setMeetsParisFilter,
  } = options;

  const meetsParisFilter = parseMeetsParisFilter(searchParams);
  const sectors = parseCompanySectors(searchParams, includeSectorFilter);
  const industryGroups = parseIndustryGroups(
    searchParams,
    includeIndustryGroupFilter,
  );
  const selectedCountries = parseCountriesFromURL(searchParams);
  const availableCountries = useMemo(
    () => getAvailableCountryOptions(companies),
    [companies],
  );

  const { filterGroups, activeFilters } = useMemo(
    () =>
      buildCompanyFilterUi(t, {
        includeSectorFilter,
        includeIndustryGroupFilter,
        sectorOptions,
        sectors,
        industryGroupFilterOptionGroups,
        industryGroups,
        selectedCountries,
        availableCountries,
        meetsParisFilter,
        sectorNames,
        industryGroupNames,
        countryNames,
        setSectors,
        setIndustryGroups,
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
      includeIndustryGroupFilter,
      sectorOptions,
      sectors,
      industryGroupFilterOptionGroups,
      industryGroups,
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
    industryGroups,
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
    includeIndustryGroupFilter: boolean;
    searchParams: URLSearchParams;
    exploreFilters: ReturnType<typeof useExploreFilters<CompanySortBy>>;
    sectorNames: Record<string, string>;
    sectorOptions: ReturnType<typeof useSectors>;
    industryGroupNames: Record<string, string>;
    industryGroupFilterOptionGroups: FilterOptionGroup[];
    countryNames: ReturnType<typeof useCompanyCountryNames>;
    setSectors: (value: CompanySector[]) => void;
    setIndustryGroups: (value: IndustryGroupOption[]) => void;
    setSelectedCountries: (countries: CompanyCountryTagSlug[]) => void;
    setMeetsParisFilter: (value: string) => void;
  },
) {
  const { exploreFilters, sectorNames, industryGroupNames } = options;
  const {
    sectors,
    industryGroups,
    selectedCountries,
    meetsParisFilter,
    filterGroups,
    activeFilters,
  } = useCompanyFilterGroups(companies, options);

  const filteredCompanies = useFilteredCompanies(companies, {
    sectors,
    industryGroups,
    selectedCountries,
    searchQuery: exploreFilters.searchQuery,
    meetsParisFilter,
    sortBy: exploreFilters.sortBy,
    sortDirection: exploreFilters.sortDirection,
    sectorNames,
    industryGroupNames,
  });

  return {
    sectors,
    industryGroups,
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
  const { includeSectorFilter = true, includeIndustryGroupFilter = false } =
    options;
  const {
    searchParams,
    setMeetsParisFilter,
    setSectors,
    setIndustryGroups,
    setSelectedCountries,
  } = useCompanySearchParamSetters();
  const sectorNames = useSectorNames();
  const sectorOptions = useSectors();
  const industryGroupNames = useIndustryGroupNames();
  const industryGroupFilterOptionGroups = useIndustryGroupFilterOptionGroups();
  const countryNames = useCompanyCountryNames();

  const exploreFilters = useExploreFilters<CompanySortBy>({
    defaultSortBy: "total_emissions",
    isValidSortBy: isSortOption,
    sortOptions: useSortOptions(),
  });

  const {
    sectors,
    industryGroups,
    selectedCountries,
    meetsParisFilter,
    filteredCompanies,
    filterGroups,
    activeFilters,
  } = useCompanyFilterUiState(companies, {
    includeSectorFilter,
    includeIndustryGroupFilter,
    searchParams,
    exploreFilters,
    sectorNames,
    sectorOptions,
    industryGroupNames,
    industryGroupFilterOptionGroups,
    countryNames,
    setSectors,
    setIndustryGroups,
    setSelectedCountries,
    setMeetsParisFilter,
  });

  return {
    ...exploreFilters,
    sectors,
    setSectors,
    industryGroups,
    setIndustryGroups,
    selectedCountries,
    setSelectedCountries,
    meetsParisFilter,
    setMeetsParisFilter,
    filteredCompanies,
    filterGroups,
    activeFilters,
  };
};

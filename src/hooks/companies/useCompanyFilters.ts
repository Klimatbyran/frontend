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
import { FilterOptionGroup } from "@/components/explore/FilterPopover";
import { SupportedLanguage } from "@/lib/languageDetection";
import { useLanguage } from "@/components/LanguageProvider";

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

  return {
    searchParams,
    setMeetsParisFilter,
    setSectors,
    setIndustryGroups,
  };
}

function useFilteredCompanies(
  companies: RankedCompany[],
  params: {
    sectors: ReturnType<typeof parseCompanySectors>;
    industryGroups: IndustryGroupOption[];
    searchQuery: string;
    meetsParisFilter: ReturnType<typeof parseMeetsParisFilter>;
    sortBy: CompanySortBy;
    sortDirection: ReturnType<
      typeof useExploreFilters<CompanySortBy>
    >["sortDirection"];
    sectorNames: Record<string, string>;
    industryGroupNames: Record<string, string>;
    currentLanguage: SupportedLanguage;
  },
) {
  return useMemo(
    () => filterAndSortCompanies(companies, params),
    [companies, params],
  );
}

function useCompanyFilterGroups(options: {
  includeSectorFilter: boolean;
  includeIndustryGroupFilter: boolean;
  searchParams: URLSearchParams;
  sectorNames: Record<string, string>;
  sectorOptions: ReturnType<typeof useSectors>;
  industryGroupNames: Record<string, string>;
  industryGroupFilterOptionGroups: FilterOptionGroup[];
  setSectors: (value: CompanySector[]) => void;
  setIndustryGroups: (value: IndustryGroupOption[]) => void;
  setMeetsParisFilter: (value: string) => void;
}) {
  const { t } = useTranslation();
  const {
    includeSectorFilter,
    includeIndustryGroupFilter,
    searchParams,
    sectorNames,
    sectorOptions,
    industryGroupNames,
    industryGroupFilterOptionGroups,
    setSectors,
    setIndustryGroups,
    setMeetsParisFilter,
  } = options;

  const meetsParisFilter = parseMeetsParisFilter(searchParams);
  const sectors = parseCompanySectors(searchParams, includeSectorFilter);
  const industryGroups = parseIndustryGroups(
    searchParams,
    includeIndustryGroupFilter,
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
        meetsParisFilter,
        sectorNames,
        industryGroupNames,
        setSectors,
        setIndustryGroups,
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
      meetsParisFilter,
      sectorNames,
      industryGroupNames,
      setSectors,
      setIndustryGroups,
      setMeetsParisFilter,
    ],
  );

  return {
    sectors,
    industryGroups,
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
    currentLanguage: SupportedLanguage;
    setSectors: (value: CompanySector[]) => void;
    setIndustryGroups: (value: IndustryGroupOption[]) => void;
    setMeetsParisFilter: (value: string) => void;
  },
) {
  const { exploreFilters, sectorNames, industryGroupNames, currentLanguage } =
    options;
  const {
    sectors,
    industryGroups,
    meetsParisFilter,
    filterGroups,
    activeFilters,
  } = useCompanyFilterGroups(options);

  const filteredCompanies = useFilteredCompanies(companies, {
    sectors,
    industryGroups,
    searchQuery: exploreFilters.searchQuery,
    meetsParisFilter,
    sortBy: exploreFilters.sortBy,
    sortDirection: exploreFilters.sortDirection,
    sectorNames,
    industryGroupNames,
    currentLanguage,
  });

  return {
    sectors,
    industryGroups,
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
  const { searchParams, setMeetsParisFilter, setSectors, setIndustryGroups } =
    useCompanySearchParamSetters();
  const sectorNames = useSectorNames();
  const sectorOptions = useSectors();
  const industryGroupNames = useIndustryGroupNames();
  const industryGroupFilterOptionGroups = useIndustryGroupFilterOptionGroups();
  const { currentLanguage } = useLanguage();

  const exploreFilters = useExploreFilters<CompanySortBy>({
    defaultSortBy: "total_emissions",
    isValidSortBy: isSortOption,
    sortOptions: useSortOptions(),
  });

  const {
    sectors,
    industryGroups,
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
    currentLanguage,
    setSectors,
    setIndustryGroups,
    setMeetsParisFilter,
  });

  return {
    ...exploreFilters,
    sectors,
    setSectors,
    industryGroups,
    setIndustryGroups,
    meetsParisFilter,
    setMeetsParisFilter,
    filteredCompanies,
    filterGroups,
    activeFilters,
  };
};

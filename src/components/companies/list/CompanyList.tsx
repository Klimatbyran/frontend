import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useSortOptions } from "@/hooks/companies/useCompanySorting";
import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";
import { ExploreEntityList } from "@/components/explore/ExploreEntityList";
import {
  PAGE_EXPLORE_COMPANIES_PAGE_SIZE,
  usePageExploreCompaniesList,
  type ExploreListSortBy,
} from "@/hooks/pages/usePageExploreCompanies";

const SEARCH_DEBOUNCE_MS = 300;

export function CompanyList() {
  const { t } = useTranslation();

  const companyFilters = useCompanyFilters([], {
    includeSectorFilter: false,
    includeIndustryGroupFilter: true,
    serverSide: true,
  });
  const sortOptions = useSortOptions();

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(companyFilters.searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [companyFilters.searchQuery]);

  const industryGroups = companyFilters.industryGroups.includes("all")
    ? undefined
    : companyFilters.industryGroups.join(",");
  const countries =
    companyFilters.selectedCountries.length > 0
      ? companyFilters.selectedCountries.join(",")
      : undefined;
  const meetsParis =
    companyFilters.meetsParisFilter === "all"
      ? undefined
      : companyFilters.meetsParisFilter;

  const { companies, total, loading, fetchingMore, hasMore, loadMore, error } =
    usePageExploreCompaniesList({
      q: debouncedQuery,
      sortBy: companyFilters.sortBy as ExploreListSortBy,
      sortDir: companyFilters.sortDirection,
      meetsParis,
      industryGroups,
      countries,
    });

  const transformedCompanies: ListCardProps[] = useTransformCompanyListCard({
    filteredCompanies: companies,
  });

  const filterProps = {
    searchQuery: companyFilters.searchQuery,
    setSearchQuery: companyFilters.setSearchQuery,
    sortBy: companyFilters.sortBy,
    setSortBy: companyFilters.setSortBy,
    sortDirection: companyFilters.sortDirection,
    setSortDirection: companyFilters.setSortDirection,
    filterGroups: companyFilters.filterGroups,
    activeFilters: companyFilters.activeFilters,
    sortOptions,
    searchPlaceholder: t("explorePage.companies.searchPlaceholder"),
  };

  if (error && companies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-light text-grey">
          {t("explorePage.companies.errorTitle")}
        </h3>
        <p className="text-grey mt-2">
          {t("explorePage.companies.errorDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <ExploreEntityList
        items={transformedCompanies}
        filterProps={filterProps}
      />
      {!loading && companies.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-light text-grey">
            {t("explorePage.companies.noCompaniesFound")}
          </h3>
          <p className="text-grey mt-2">
            {t("explorePage.companies.tryDifferentCriteria")}
          </p>
        </div>
      )}
      {(companies.length > 0 || hasMore) && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={fetchingMore || loading}
              className="rounded-full bg-black-1 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {t("explorePage.companies.showMoreRows", {
                count: PAGE_EXPLORE_COMPANIES_PAGE_SIZE,
              })}
            </button>
          )}
          <span className="text-xs text-grey">
            {t("explorePage.companies.showingCount", {
              shown: companies.length,
              total,
            })}
          </span>
        </div>
      )}
    </>
  );
}

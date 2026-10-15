import { useTranslation } from "react-i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import { useExploreCompaniesData } from "@/hooks/companies/useExploreCompaniesData";
import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";
import { ExploreEntityList } from "@/components/explore/ExploreEntityList";
import { PAGE_EXPLORE_COMPANIES_PAGE_SIZE } from "@/hooks/pages/usePageExploreCompanies";

export function CompanyList() {
  const { t } = useTranslation();
  const {
    companyFilters,
    sortOptions,
    companies,
    total,
    loading,
    refreshing,
    fetchingMore,
    hasMore,
    loadMore,
    error,
  } = useExploreCompaniesData();

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

  const remaining = Math.max(total - companies.length, 0);
  const showMoreCount = Math.min(PAGE_EXPLORE_COMPANIES_PAGE_SIZE, remaining);

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

  if (loading && companies.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 animate-pulse lg:grid-cols-2">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-64 rounded-level-2 bg-black-2" />
        ))}
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
              disabled={fetchingMore || loading || refreshing}
              className="rounded-full bg-black-1 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {t("explorePage.companies.showMoreRows", {
                count: showMoreCount,
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

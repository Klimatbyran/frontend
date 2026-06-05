import { useTranslation } from "react-i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import type { RankedCompany } from "@/types/company";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useSortOptions } from "@/hooks/companies/useCompanySorting";
import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";
import { ExploreEntityList } from "@/components/explore/ExploreEntityList";

interface CompanyListProps {
  companies: RankedCompany[];
}

export function CompanyList({ companies }: CompanyListProps) {
  const { t } = useTranslation();

  const companyFilters = useCompanyFilters(companies);
  const { filteredCompanies } = companyFilters;
  const sortOptions = useSortOptions();

  const transformedCompanies: ListCardProps[] = useTransformCompanyListCard({
    filteredCompanies,
  });
  const allTransformedCompanies = useTransformCompanyListCard({
    filteredCompanies: companies,
  });

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-light text-grey">
          {t("explorePage.companies.noCompaniesFound")}
        </h3>
        <p className="text-grey mt-2">
          {t("explorePage.companies.tryDifferentCriteria")}
        </p>
      </div>
    );
  }

  return (
    <ExploreEntityList
      items={transformedCompanies}
      allItems={allTransformedCompanies}
      filterProps={{
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
      }}
    />
  );
}

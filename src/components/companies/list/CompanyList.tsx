import { useTranslation } from "react-i18next";
import { CardGrid } from "@/components/layout/CardGrid";
import { ListCard } from "@/components/layout/ListCard";
import type { ListCardProps } from "@/components/layout/ListCard";
import type { RankedCompany } from "@/types/company";
import ListFilter from "@/components/explore/ListFilter";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useSortOptions } from "@/hooks/companies/useCompanySorting";
import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";

interface CompanyListProps {
  companies: RankedCompany[];
}

export function CompanyList({ companies }: CompanyListProps) {
  const { t } = useTranslation();

  const companyFilters = useCompanyFilters(companies);
  const filteredCompanies = companyFilters.filteredCompanies;
  const sortOptions = useSortOptions();

  // Transform company data for ListCard components
  const transformedCompanies: ListCardProps[] = useTransformCompanyListCard({
    filteredCompanies,
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
    <>
      <ListFilter
        searchQuery={companyFilters.searchQuery}
        setSearchQuery={companyFilters.setSearchQuery}
        sortBy={companyFilters.sortBy}
        setSortBy={companyFilters.setSortBy}
        sortDirection={companyFilters.sortDirection}
        setSortDirection={companyFilters.setSortDirection}
        filterGroups={companyFilters.filterGroups}
        activeFilters={companyFilters.activeFilters}
        sortOptions={sortOptions}
        searchPlaceholder={t("explorePage.companies.searchPlaceholder")}
      />
      <CardGrid
        items={transformedCompanies}
        itemContent={(transformedData) => (
          <ListCard key={transformedData.linkTo} {...transformedData} />
        )}
      />
    </>
  );
}

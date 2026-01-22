import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { FilterPopover } from "@/components/explore/FilterPopover";
import { SortPopover } from "@/components/explore/SortPopover";
import { cn } from "@/lib/utils";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useSortOptions as useCompanySortOptions } from "@/hooks/companies/useCompanySorting";
import { useSortOptions as useMunicipalitySortOption } from "@/hooks/municipalities/useMunicipalitiesSorting";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useMunicipalitiesFilters } from "@/hooks/municipalities/useMunicipalitiesFilters";
import type { RankedCompany } from "@/types/company";
import type { Municipality } from "@/types/municipality";

interface IListFilter {
  companies?: RankedCompany[];
  municipalities?: Municipality[];
}
// Type guard to check if data is companies
const isCompanies = (
  data: RankedCompany[] | Municipality[],
): data is RankedCompany[] => {
  return data.length > 0 && "industry" in data[0];
};

const selectFiltersAndOptions = (
  isCompanyData: boolean,
  companyFilters: ReturnType<typeof useCompanyFilters>,
  municipalityFilters: ReturnType<typeof useMunicipalitiesFilters>,
  companySortOptions: ReturnType<typeof useCompanySortOptions>,
  municipalitySortOptions: ReturnType<typeof useMunicipalitySortOption>,
) => {
  return {
    filters: isCompanyData ? companyFilters : municipalityFilters,
    sortOptions: isCompanyData ? companySortOptions : municipalitySortOptions,
  };
};

const ListFilter = ({ companies = [], municipalities = [] }: IListFilter) => {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const companySortOptions = useCompanySortOptions();
  const municipalitySortOptions = useMunicipalitySortOption();

  const isCompanyData = companies.length > 0 && isCompanies(companies);
  const companyFilters = useCompanyFilters(companies);
  const municipalityFilters = useMunicipalitiesFilters(municipalities);

  const { filters, sortOptions } = selectFiltersAndOptions(
    isCompanyData,
    companyFilters,
    municipalityFilters,
    companySortOptions,
    municipalitySortOptions,
  );

  if (!filters.activeFilters) {
    return null;
  }

  return (
    <div
      className={cn(
        screenSize.isMobile ? "relative" : "sticky top-0 z-10",
        "bg-black shadow-md",
      )}
    >
      <div className="absolute inset-0 w-full bg-black -z-10" />

      {/* Wrapper for Filters, Search, and Badges */}
      <div className={cn("flex flex-wrap items-center gap-2 mb-2 md:mb-4")}>
        {/* Search Input */}
        <Input
          type="text"
          placeholder={
            isCompanyData
              ? t("explorePage.companies.searchPlaceholder")
              : t("explorePage.municipalities.searchPlaceholder")
          }
          value={filters.searchQuery}
          onChange={(e) => filters.setSearchQuery(e.target.value)}
          className="bg-black-1 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-2 relative w-full md:w-[350px]"
        />

        {/* Filter and Sort Buttons */}
        <FilterPopover
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          groups={filters.filterGroups}
        />

        <SortPopover
          sortOpen={sortOpen}
          setSortOpen={setSortOpen}
          sortOptions={sortOptions}
          sortBy={filters.sortBy}
          setSortBy={filters.setSortBy}
          sortDirection={filters.sortDirection}
          setSortDirection={filters.setSortDirection}
        />

        {/* Badges */}
        {filters.activeFilters.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-2",
              screenSize.isMobile ? "w-full" : "flex-1",
            )}
          >
            <FilterBadges filters={filters.activeFilters} view="list" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ListFilter;

import { useState } from "react";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { FilterPopover } from "@/components/companies/list/FilterPopover";
import { SortPopover } from "@/components/companies/list/SortPopover";
import { CompanyList } from "@/components/companies/list/CompanyList";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { useSortOptions } from "@/hooks/companies/useCompanySorting";

export function CompaniesListPage() {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const { companies, loading, error } = useCompanies();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sectorNames = useSectorNames();
  const sortOptions = useSortOptions();

  const {
    searchQuery,
    setSearchQuery,
    sectors,
    setSectors,
    meetsParisFilter,
    setMeetsParisFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filteredCompanies,
  } = useCompanyFilters(companies);

  // Create active filters for badges
  const activeFilters = [
    ...(sectors.length > 0 && !sectors.includes("all")
      ? sectors.map((sector) => ({
          type: "filter" as const,
          label: sectorNames[sector as keyof typeof sectorNames] || sector,
          onRemove: () =>
            setSectors(sectors.filter((s) => s !== sector)),
        }))
      : []),
    ...(meetsParisFilter !== "all"
      ? [
          {
            type: "filter" as const,
            label: `${t("companiesPage.filteringOptions.meetsParis")}: ${
              meetsParisFilter === "yes"
                ? t("companiesPage.filteringOptions.meetsParisYes")
                : meetsParisFilter === "no"
                  ? t("companiesPage.filteringOptions.meetsParisNo")
                  : t("companiesPage.filteringOptions.meetsParisUnknown")
            }`,
            onRemove: () => setMeetsParisFilter("all"),
          },
        ]
      : []),
    {
      type: "sort" as const,
      label: String(
        sortOptions.find((s) => s.value === sortBy)?.label ?? sortBy,
      ),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-black-2 rounded-level-2" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-light text-red-500">
          {t("companiesPage.errorTitle")}
        </h2>
        <p className="text-grey mt-2">{t("companiesPage.errorDescription")}</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("companiesPage.title")}
        description={t("companiesPage.description")}
        className="-ml-4"
      />

      {/* Filters & Sorting Section */}
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
            placeholder={t("companiesPage.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black-1 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-2 relative w-full md:w-[350px]"
          />

          {/* Filter and Sort Buttons */}
          <FilterPopover
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            sectors={sectors}
            setSectors={setSectors}
            meetsParisFilter={meetsParisFilter}
            setMeetsParisFilter={setMeetsParisFilter}
          />

          <SortPopover
            sortOpen={sortOpen}
            setSortOpen={setSortOpen}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
          />

          {/* Badges */}
          {activeFilters.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                screenSize.isMobile ? "w-full" : "flex-1",
              )}
            >
              <FilterBadges filters={activeFilters} view="list" />
            </div>
          )}
        </div>
      </div>

      <CompanyList companies={filteredCompanies} />
    </>
  );
}

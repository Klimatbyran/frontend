import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { FilterPopover } from "@/components/explore/FilterPopover";
import { SortPopover } from "@/components/explore/SortPopover";
import { cn } from "@/lib/utils";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useSortOptions } from "@/hooks/companies/useCompanySorting";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import type { RankedCompany } from "@/types/company";
import type { Municipality } from "@/types/municipality";

interface IListFilter {
  companies?: RankedCompany[];
  municipalities?: Municipality[];
}

const ListFilter = ({ companies = [], municipalities = [] }: IListFilter) => {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sectorNames = useSectorNames();
  const sortOptions = useSortOptions();
  let activeFilters;

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
    filterGroups,
  } = useCompanyFilters(companies);

  if (companies) {
    activeFilters = generateCompanyActiveFilters(
      sectors,
      sectorNames,
      setSectors,
      t,
      sortOptions,
      meetsParisFilter,
      setMeetsParisFilter,
      sortBy,
    );
  }

  return (
    activeFilters && (
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
              companies.length > 0
                ? t("explorePage.companies.searchPlaceholder")
                : t("explorePage.municipalities.searchPlaceholder")
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black-1 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-2 relative w-full md:w-[350px]"
          />

          {/* Filter and Sort Buttons */}
          <FilterPopover
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            groups={filterGroups}
          />

          <SortPopover
            sortOpen={sortOpen}
            setSortOpen={setSortOpen}
            sortOptions={sortOptions}
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
    )
  );
};

// Create active filters for companies
const generateCompanyActiveFilters = (
  sectors,
  sectorNames,
  setSectors,
  t,
  sortOptions,
  meetsParisFilter,
  setMeetsParisFilter,
  sortBy,
) => {
  const activeFilters = [
    ...(sectors.length > 0 && !sectors.includes("all")
      ? sectors.map((sector) => ({
          type: "filter" as const,
          label: sectorNames[sector as keyof typeof sectorNames] || sector,
          onRemove: () => setSectors(sectors.filter((s) => s !== sector)),
        }))
      : []),
    ...(meetsParisFilter !== "all"
      ? [
          {
            type: "filter" as const,
            label: `${t("explorePage.companies.filteringOptions.meetsParis")}: ${
              meetsParisFilter === "yes"
                ? t("explorePage.companies.filteringOptions.meetsParisYes")
                : meetsParisFilter === "no"
                  ? t("explorePage.companies.filteringOptions.meetsParisNo")
                  : t(
                      "explorePage.companies.filteringOptions.meetsParisUnknown",
                    )
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
  return activeFilters;
};

export default ListFilter;

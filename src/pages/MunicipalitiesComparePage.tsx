import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { MunicipalityList } from "@/components/municipalities/list/MunicipalityList";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  isMeetsParisFilter,
  isMunicipalitySortBy,
  MeetsParisFilter,
  MunicipalitySortBy,
} from "@/types/municipality";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FilterGroup, FilterPopover } from "@/components/explore/FilterPopover";
import { isSortDirection, SortDirection, SortPopover } from "@/components/explore/SortPopover";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useState } from "react";
import { regions } from "@/lib/constants/regions";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { useSortOptions } from "@/hooks/municipalities/useMunicipalitiesSorting";

export function MunicipalitiesComparePage() {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const { municipalities, loading, error } = useMunicipalities();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const sortOptions = useSortOptions();

  const selectedRegion = searchParams.get("selectedRegion") || "all";
  const meetsParisFilter = isMeetsParisFilter(searchParams.get("meetsParisFilter") ?? "") ? searchParams.get("meetsParisFilter") as MeetsParisFilter : "all";
  const searchQuery = searchParams.get("searchQuery") || "";
  const sortBy = isMunicipalitySortBy(searchParams.get("sortBy") ?? "") ? searchParams.get("sortBy") as MunicipalitySortBy : "meets_paris"; 
  const sortDirection = isSortDirection(searchParams.get("sortDirection") ?? "") 
    ? searchParams.get("sortDirection") as SortDirection 
    : sortOptions.find(s => s.value === sortBy)?.defaultDirection ?? "desc"; 

  const setOrDeleteSearchParam = (value: string | null, param: string) => setSearchParams((searchParams) => {
    value ? searchParams.set(param, value) : searchParams.delete(param);
    return searchParams;
  }, { replace: true });

  const setSelectedRegion = (selectedRegion: string) => setOrDeleteSearchParam(selectedRegion, "selectedRegion");
  const setMeetsParisFilter = (meetsParisFilter: string) => setOrDeleteSearchParam(meetsParisFilter, "meetsParisFilter");
  const setSearchQuery = (searchQuery: string) => setOrDeleteSearchParam(searchQuery.trim() || null, "searchQuery");
  const setSortBy = (sortBy: string) => setOrDeleteSearchParam(sortBy, "sortBy");
  const setSortDirection = (sortDirection: string) => setOrDeleteSearchParam(sortDirection, "sortDirection");

  const filterGroups: FilterGroup[] = [
    {
      heading: t("municipalitiesComparePage.filter.selectRegion"),
      options: [{value: "all", label: t("municipalitiesComparePage.filter.allRegions")}, ...Object.keys(regions).map((r) => ({ value: r, label: r}))],
      selectedValues: [selectedRegion],
      onSelect: setSelectedRegion,
      selectMultiple: false
    },
    {
        heading: t("companiesPage.filteringOptions.meetsParis"),
        options: [
          { value: "all", label: t("all") },
          { value: "yes", label: t("companiesPage.filteringOptions.meetsParisYes") },
          { value: "no", label: t("companiesPage.filteringOptions.meetsParisNo") },
        ],
        selectedValues: [meetsParisFilter],
        onSelect: (value: string) => setMeetsParisFilter(value as MeetsParisFilter),
        selectMultiple: false
      }
  ];

  // Create active filters for badges
  const activeFilters = [
    ...(selectedRegion !== "all"
      ? [
          {
            type: "filter" as const,
            label: selectedRegion,
            onRemove: () => setSelectedRegion("all"),
          },
        ]
      : []),
    ...(meetsParisFilter !== "all"
      ? [
          {
            type: "filter" as const,
            label: `${t("companiesPage.filteringOptions.meetsParis")}: ${
              meetsParisFilter === "yes"
                ? t("companiesPage.filteringOptions.meetsParisYes")
                : t("companiesPage.filteringOptions.meetsParisNo")
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
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-black-1 rounded-level-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("municipalitiesComparePage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("municipalitiesComparePage.errorDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("municipalitiesComparePage.title")}
        description={t("municipalitiesComparePage.description")}
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
            placeholder={t("municipalitiesComparePage.filter.searchPlaceholder")}
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
            <div className={cn("flex flex-wrap gap-2", screenSize.isMobile ? "w-full" : "flex-1")}>
              <FilterBadges filters={activeFilters} view="list" />
            </div>
          )}

        </div>
      </div>

      <MunicipalityList
        municipalities={municipalities}
        selectedRegion={selectedRegion}
        meetsParisFilter={meetsParisFilter}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortDirection={sortDirection}
      />
    </>
  );
}

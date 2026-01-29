import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import {
  FilterPopover,
  type FilterGroup,
} from "@/components/explore/FilterPopover";
import {
  SortPopover,
  type SortDirection,
  type SortOption,
} from "@/components/explore/SortPopover";
import { cn } from "@/lib/utils";
import { useScreenSize } from "@/hooks/useScreenSize";

interface IListFilter {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortDirection: string;
  setSortDirection: (direction: string) => void;
  filterGroups: FilterGroup[];
  activeFilters: Array<{
    type: "filter";
    label: string;
    onRemove: () => void;
  }>;
  sortOptions: readonly SortOption[];
  searchPlaceholder: string;
}

const ListFilter = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  filterGroups,
  activeFilters,
  sortOptions,
  searchPlaceholder,
}: IListFilter) => {
  const screenSize = useScreenSize();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

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
          placeholder={searchPlaceholder}
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
          sortDirection={(sortDirection as SortDirection) || "desc"}
          setSortDirection={
            setSortDirection as (direction: SortDirection) => void
          }
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
  );
};

export default ListFilter;

import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyCard } from "@/components/companies/list/CompanyCard";
import { SectionedCompanyList } from "@/components/companies/list/SectionedCompanyList";
import { Filter, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  SECTORS,
  useCompanyFilters,
  useSortOptions,
  type CompanySector,
  type SortOption,
  useSectors,
  useSectorNames,
  SectorCode,
} from "@/hooks/useCompanyFilters";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";

type FilterBadge = {
  type: "filter" | "sort";
  label: string;
  onRemove?: () => void;
};

interface FilterPopoverProps {
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  sectors: CompanySector[];
  setSectors: React.Dispatch<React.SetStateAction<CompanySector[]>>;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

function FilterPopover({
  filterOpen,
  setFilterOpen,
  sectors,
  setSectors,
  sortBy,
  setSortBy,
}: FilterPopoverProps) {
  const { t } = useTranslation();

  return (
    <Popover open={filterOpen} onOpenChange={setFilterOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 bg-black-1 border-none gap-2"
        >
          <Filter className="w-4 h-4" />
          {t("companiesPage.filter")}
          {sectors.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 bg-blue-5/30 text-blue-2"
            >
              {sectors.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <FilterCommands
          sectors={sectors}
          setSectors={setSectors}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </PopoverContent>
    </Popover>
  );
}

interface FilterGroupProps {
  title: string;
  items: typeof SECTORS;
  selected: string[];
  onSelect: (value: string[]) => void;
}

function FilterGroup({ title, items, selected, onSelect }: FilterGroupProps) {
  return (
    <CommandGroup heading={title}>
      {items.map((item) => (
        <CommandItem
          key={item.value}
          onSelect={() => {
            if (item.value === "all") {
              onSelect([]);
            } else if (selected.includes(item.value)) {
              onSelect(selected.filter((s) => s !== item.value));
            } else {
              onSelect([...selected, item.value]);
            }
          }}
          className="flex items-center justify-between"
        >
          <span>{item.label}</span>
          {selected.includes(item.value) && <Check className="w-4 h-4" />}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

interface SortGroupProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

function SortGroup({ sortBy, setSortBy }: SortGroupProps) {
  const { t } = useTranslation();
  return (
    <CommandGroup heading={t("companiesPage.sortBy")}>
      {useSortOptions().map((option) => (
        <CommandItem
          key={option.value}
          onSelect={() => setSortBy(option.value)}
          className="flex items-center justify-between"
        >
          <span>{option.label}</span>
          {sortBy === option.value && <Check className="w-4 h-4" />}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

interface FilterCommandsProps {
  sectors: CompanySector[];
  setSectors: (sectors: CompanySector[]) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

function FilterCommands({
  sectors,
  setSectors,
  sortBy,
  setSortBy,
}: FilterCommandsProps) {
  const { t } = useTranslation();
  const sectorOptions = useSectors();

  return (
    <Command>
      <CommandInput placeholder={t("companiesPage.searchInFilter")} />
      <CommandList>
        <CommandEmpty>{t("companiesPage.noFiltersFound")}</CommandEmpty>
        <FilterGroup
          title={t("companiesPage.sector")}
          items={sectorOptions}
          selected={sectors}
          onSelect={setSectors}
        />
        <CommandSeparator />
        <SortGroup sortBy={sortBy} setSortBy={setSortBy} />
      </CommandList>
    </Command>
  );
}

export function CompaniesPage() {
  const { t } = useTranslation();
  const isMobile = useScreenSize();
  const { companies, loading, error } = useCompanies();
  const [filterOpen, setFilterOpen] = useState(false);
  const sortOptions = useSortOptions();
  const sectorNames = useSectorNames();

  const {
    searchQuery,
    setSearchQuery,
    sectors,
    setSectors,
    sortBy,
    setSortBy,
    filteredCompanies,
  } = useCompanyFilters(companies);

  const activeFilters: FilterBadge[] = [
    ...sectors.map((sec) => ({
      type: "filter" as const,
      label:
        sec === "all"
          ? t("companiesPage.allSectors")
          : sectorNames[sec as SectorCode] || sec,
      onRemove: () => setSectors((prev) => prev.filter((s) => s !== sec)),
    })),
    {
      type: "sort" as const,
      label: String(
        sortOptions.find((s) => s.value === sortBy)?.label ?? sortBy
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
    <div className="space-y-6">
      <PageHeader
        title={t("companiesPage.title")}
        description={t("companiesPage.description")}
        className="-ml-4"
      />
      {/* Filters & Sorting Section */}
      <div
        className={cn(
          isMobile ? "relative" : "sticky top-0 z-10",
          "bg-black px-4 pt-12 md:pt-16 pb-4 shadow-md"
        )}
      >
        <div className="absolute inset-0 w-full bg-black -z-10" />

        {/* Wrapper for Filters, Search, and Badges */}
        <div
          className={cn(
            "flex flex-wrap items-start gap-4",
            isMobile ? "flex-col" : "items-center"
          )}
        >
          {/* Search Input */}
          <Input
            type="text"
            placeholder={t("companiesPage.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black-1 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-2 relative w-full md:w-[350px]"
          />

          {/* Filter Button */}
          <FilterPopover
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            sectors={sectors}
            setSectors={setSectors}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* Badges - Stay inline on desktop, wrap on mobile */}
          {activeFilters.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                isMobile ? "w-full" : "flex-1"
              )}
            >
              <FilterBadges filters={activeFilters} />
            </div>
          )}
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-light text-grey">
            {t("companiesPage.noCompaniesFound")}
          </h3>
          <p className="text-grey mt-2">
            {t("companiesPage.tryDifferentCriteria")}
          </p>
        </div>
      ) : sectors.length === 0 && !searchQuery ? (
        <SectionedCompanyList
          companies={filteredCompanies.map(({ ...rest }) => ({
            ...rest,
            metrics: {
              emissionsReduction: 0,
              displayReduction: "0%",
            },
            reportingPeriods: rest.reportingPeriods.map((period) => ({
              ...period,
              id: period.startDate,
            })),
          }))}
          sortBy={sortBy}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.wikidataId}
              className="block rounded-level-2"
            >
              <div>
                <CompanyCard
                  {...company}
                  metrics={{
                    emissionsReduction: 0,
                    displayReduction: "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBadges({ filters }: { filters: FilterBadge[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="bg-blue-5/30 text-blue-2 pl-2 pr-1 flex items-center gap-1"
        >
          <span className="text-grey text-xs mr-1">
            {filter.type === "sort"
              ? t("companiesPage.sorting")
              : t("companiesPage.filtering")}
          </span>
          {filter.label}
          {filter.type === "filter" && filter.onRemove && (
            <button
              type="button"
              title={t("companiesPage.removeFilter")}
              onClick={(e) => {
                e.preventDefault();
                filter.onRemove?.();
              }}
              className="hover:bg-blue-5/50 p-1 rounded-sm transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
}

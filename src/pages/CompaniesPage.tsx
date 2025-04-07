import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { CompanyCard } from "@/components/companies/list/CompanyCard";
import { SectionedCompanyList } from "@/components/companies/list/SectionedCompanyList";
import { Filter, Check, X, BarChart, List } from "lucide-react";
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
} from "@/hooks/companies/useCompanyFilters";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import SectorGraphs from "@/components/companies/sectors/SectorGraphs";

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
  viewMode: "graphs" | "list";
}

function FilterPopover({
  filterOpen,
  setFilterOpen,
  sectors,
  setSectors,
  sortBy,
  setSortBy,
  viewMode,
}: FilterPopoverProps) {
  const { t } = useTranslation();
  const sectorOptions = useSectors();
  const sortOptions = useSortOptions();

  return (
    <Popover open={filterOpen} onOpenChange={setFilterOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-black-1 border-black-1 text-grey hover:text-white hover:bg-black-1/80 hover:border-black-1"
        >
          <Filter className="mr-2 h-4 w-4" />
          {t("companiesPage.filter")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 bg-black-2 border-black-1"
        align="end"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder={t("companiesPage.filterPlaceholder")}
            className="border-b border-black-1"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{t("companiesPage.noResults")}</CommandEmpty>
            <CommandGroup heading={t("companiesPage.sector")}>
              {sectorOptions.map((sector) => (
                <CommandItem
                  key={sector.value}
                  onSelect={() => {
                    if (sector.value === "all") {
                      setSectors(["all"]);
                    } else if (sectors.includes("all")) {
                      setSectors([sector.value]);
                    } else if (sectors.includes(sector.value)) {
                      setSectors(sectors.filter((s) => s !== sector.value));
                    } else {
                      setSectors([...sectors, sector.value]);
                    }
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{sector.label}</span>
                  {sectors.includes(sector.value) && (
                    <Check className="h-4 w-4 text-blue-2" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            {viewMode === "list" && (
              <>
                <CommandSeparator className="bg-black-1" />
                <CommandGroup heading={t("companiesPage.sortBy")}>
                  {sortOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => setSortBy(option.value)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <Check className="h-4 w-4 text-blue-2" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
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
  const [viewMode, setViewMode] = useState<"graphs" | "list">("list");
  const [isDevEnvironment, setIsDevEnvironment] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    sectors,
    setSectors,
    sortBy,
    setSortBy,
    filteredCompanies,
  } = useCompanyFilters(companies);

  // Detect environment on component mount
  useEffect(() => {
    const hostname = window.location.hostname;
    const isDev = hostname.includes("stage.") || hostname.includes("localhost");

    setIsDevEnvironment(isDev);

    // If in dev environment, we can default to graphs view
    if (isDev) {
      setViewMode("graphs");
    }
  }, []);

  const activeFilters: FilterBadge[] = [
    ...sectors.map((sec) => ({
      type: "filter" as const,
      label:
        sec === "all"
          ? t("companiesPage.allSectors")
          : sectorNames[sec as SectorCode] || sec,
      onRemove: () => setSectors((prev) => prev.filter((s) => s !== sec)),
    })),
    ...(viewMode === "list"
      ? [
          {
            type: "sort" as const,
            label: String(
              sortOptions.find((s) => s.value === sortBy)?.label ?? sortBy,
            ),
          },
        ]
      : []),
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
          "bg-black px-4 pt-12 md:pt-16 pb-4 shadow-md",
        )}
      >
        <div className="absolute inset-0 w-full bg-black -z-10" />

        {/* Wrapper for View Toggle, Filters, Search, and Badges */}
        <div className={cn("flex flex-wrap items-start gap-4", "items-center")}>
          {/* View Toggle - Only show in dev environments */}
          {isDevEnvironment && (
            <div className="flex bg-black-1 rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 rounded-none",
                  viewMode === "graphs"
                    ? "bg-blue-5/30 text-blue-2"
                    : "text-grey",
                )}
                onClick={() => setViewMode("graphs")}
                title={t("companiesPage.viewModes.graphs")}
              >
                <BarChart className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 rounded-none",
                  viewMode === "list"
                    ? "bg-blue-5/30 text-blue-2"
                    : "text-grey",
                )}
                onClick={() => setViewMode("list")}
                title={t("companiesPage.viewModes.list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Search Input - Always show in production, only in list view for dev */}
          {(!isDevEnvironment || viewMode === "list") && (
            <Input
              type="text"
              placeholder={t("companiesPage.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black-1 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-2 relative w-full md:w-[350px]"
            />
          )}

          {/* Filter Button */}
          <FilterPopover
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            sectors={sectors}
            setSectors={setSectors}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={isDevEnvironment ? viewMode : "list"}
          />

          {/* Badges */}
          {activeFilters.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                isMobile ? "w-full" : "flex-1",
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
      ) : isDevEnvironment && viewMode === "graphs" ? (
        <SectorGraphs
          companies={companies}
          selectedSectors={
            sectors.length > 0
              ? sectors
              : Object.keys(sectorNames).filter((key) => key !== "all")
          }
        />
      ) : // Always show list view in production
      sectors.length === 0 && !searchQuery ? (
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
            <CompanyCard
              key={company.wikidataId}
              {...company}
              metrics={{
                emissionsReduction: 0,
                displayReduction: "0%",
              }}
            />
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

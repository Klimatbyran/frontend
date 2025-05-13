import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { CompanyCard } from "@/components/companies/list/CompanyCard";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import SectorGraphs from "@/components/companies/sectors/SectorGraphs";
import { useNavigate, useLocation } from "react-router-dom";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { FilterPopover } from "@/components/companies/list/FilterPopover";
import { ViewToggle } from "@/components/companies/list/ViewToggle";
import {
  useCompanyFilters,
  useSectorNames,
  SectorCode,
  useSortOptions,
} from "@/hooks/companies/useCompanyFilters";
import { CardGrid } from "@/components/CardGrid";

export function CompaniesPage() {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const { companies, loading, error } = useCompanies();
  const [filterOpen, setFilterOpen] = useState(false);
  const sectorNames = useSectorNames();
  const sortOptions = useSortOptions();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const viewParam = params.get("view");
  const [view, setView] = useState<"graphs" | "list">(
    viewParam === "graphs" || viewParam === "list" ? viewParam : "graphs",
  );

  const {
    searchQuery,
    setSearchQuery,
    sectors,
    setSectors,
    sortBy,
    setSortBy,
    filteredCompanies,
  } = useCompanyFilters(companies);

  useEffect(() => {
    if (!viewParam || (viewParam !== "graphs" && viewParam !== "list")) {
      navigate({ search: "view=graphs" });
    }
  }, [location.search, navigate, viewParam]);

  const setQueryParam = (URLparam: "graphs" | "list") => {
    setView(URLparam);
    navigate({ search: `view=${URLparam}` });
  };

  const activeFilters = [
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

        {/* Wrapper for View Toggle, Filters, Search, and Badges */}
        <div className={cn("flex flex-wrap items-center gap-2 mb-2 md:mb-4")}>
          {/* View Toggle */}
          <ViewToggle view={view} onViewChange={setQueryParam} />

          {/* Search Input - Only visible in list view */}
          {view === "list" && (
            <Input
              type="text"
              placeholder={t("companiesPage.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black-1 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-2 relative w-full md:w-[350px]"
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
            viewMode={view}
          />

          {/* Badges */}
          {activeFilters.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                screenSize.isMobile ? "w-full" : "flex-1",
              )}
            >
              <FilterBadges filters={activeFilters} view={view} />
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
      ) : view === "graphs" ? (
        <SectorGraphs
          companies={companies}
          selectedSectors={
            sectors.length > 0
              ? sectors
              : Object.keys(sectorNames).filter((key) => key !== "all")
          }
        />
      ) : (
        <CardGrid
          items={filteredCompanies}
          itemContent={(company) => (
            <CompanyCard
              key={company.wikidataId}
              {...company}
              metrics={{
                emissionsReduction: 0,
                displayReduction: "0%",
              }}
            />
          )}
        />
      )}
    </>
  );
}

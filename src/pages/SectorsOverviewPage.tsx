import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { PageHeader } from "@/components/layout/PageHeader";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import SectorGraphs from "@/components/companies/sectors/SectorGraphs";
import { FilterPopover } from "@/components/explore/FilterPopover";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";

export function SectorsOverviewPage() {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const { companies, companiesLoading, companiesError } = useCompanies();
  const [filterOpen, setFilterOpen] = useState(false);
  const sectorNames = useSectorNames();

  const {
    sectors,
    setSectors,
    meetsParisFilter,
    setMeetsParisFilter,
    filteredCompanies,
    filterGroups,
  } = useCompanyFilters(companies);

  // Create active filters for badges
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
            label: `${t("sectorsOverviewPage.filteringOptions.meetsParis")}: ${
              meetsParisFilter === "yes"
                ? t("sectorsOverviewPage.filteringOptions.meetsParisYes")
                : meetsParisFilter === "no"
                  ? t("sectorsOverviewPage.filteringOptions.meetsParisNo")
                  : t("sectorsOverviewPage.filteringOptions.meetsParisUnknown")
            }`,
            onRemove: () => setMeetsParisFilter("all"),
          },
        ]
      : []),
  ];

  if (companiesLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-black-2 rounded-level-2" />
        ))}
      </div>
    );
  }

  if (companiesError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-light text-red-500">
          {t("sectorsOverviewPage.errorTitle")}
        </h2>
        <p className="text-grey mt-2">
          {t("sectorsOverviewPage.errorDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("sectorsOverviewPage.title")}
        description={t("sectorsOverviewPage.description")}
        className="-ml-4"
      />

      {/* Filters Section */}
      <div
        className={cn(
          screenSize.isMobile ? "relative" : "sticky top-0 z-10",
          "bg-black shadow-md",
        )}
      >
        <div className="absolute inset-0 w-full bg-black -z-10" />

        {/* Wrapper for Filters and Badges */}
        <div className={cn("flex flex-wrap items-center gap-2 mb-2 md:mb-4")}>
          {/* Filter Button */}
          <FilterPopover
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            groups={filterGroups}
          />

          {/* Badges */}
          {activeFilters.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                screenSize.isMobile ? "w-full" : "flex-1",
              )}
            >
              <FilterBadges filters={activeFilters} view="graphs" />
            </div>
          )}
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-light text-grey">
            {t("sectorsOverviewPage.noCompaniesFound")}
          </h3>
          <p className="text-grey mt-2">
            {t("sectorsOverviewPage.tryDifferentCriteria")}
          </p>
        </div>
      ) : (
        <SectorGraphs
          companies={filteredCompanies}
          selectedSectors={
            sectors.length > 0
              ? sectors
              : Object.keys(sectorNames).filter((key) => key !== "all")
          }
        />
      )}
    </>
  );
}

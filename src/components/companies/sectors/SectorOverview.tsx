import React, { useState } from "react";
import { RankedCompany } from "@/types/company";
import SectorEmissionsChart from "@/components/companies/sectors/charts/SectorEmissionsChart";
import { FilterBadge, FilterBadges } from "../list/FilterBadges";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { FilterGroup, FilterPopover } from "@/components/explore/FilterPopover";
import { useLocation } from "react-router-dom";

interface SectorOverviewProps {
  companies: RankedCompany[];
  filterGroups: FilterGroup[];
  activeFilters: FilterBadge[];
  isSectorView: boolean;
}

const SectorOverview: React.FC<SectorOverviewProps> = ({
  companies,
  filterGroups,
  activeFilters,
  isSectorView,
}) => {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const [filterOpen, setFilterOpen] = useState(false);
  const location = useLocation();

  return (
    <>
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
          {isSectorView && (
            <Button
              variant="outline"
              size="sm"
              className="bg-black-2 border-black-1 text-white hover:bg-black-1"
              asChild
            >
              <LocalizedLink to={`/sectors${location.search}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("sectorsOverviewPage.overview")}
              </LocalizedLink>
            </Button>
          )}

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

      {companies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-light text-grey">
            {t("sectorsOverviewPage.noCompaniesFound")}
          </h3>
          <p className="text-grey mt-2">
            {t("sectorsOverviewPage.tryDifferentCriteria")}
          </p>
        </div>
      ) : (
        <div className="bg-black space-y-4">
          <SectorEmissionsChart
            companies={companies}
            isSectorView={isSectorView}
          />
        </div>
      )}
    </>
  );
};

export default SectorOverview;

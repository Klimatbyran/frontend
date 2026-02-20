import { useTranslation } from "react-i18next";
import { CardGrid } from "@/components/layout/CardGrid";
import { ListCard } from "@/components/layout/ListCard";
import ListFilter from "@/components/explore/ListFilter";
import { useRegionsFilters } from "@/hooks/regions/useRegionsFilters";
import { useTransformRegionListCard } from "@/hooks/regions/useTransformRegionListCard";
import type { RegionForExplore } from "@/hooks/regions/useRegionsForExplore";

interface RegionListProps {
  regions: RegionForExplore[];
}

export function RegionList({ regions }: RegionListProps) {
  const { t } = useTranslation();
  const regionFilters = useRegionsFilters(regions);
  const { filteredRegions, sortOptions } = regionFilters;
  const transformedRegions = useTransformRegionListCard({
    filteredRegions,
  });

  if (regions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-light text-grey">
          {t("explorePage.regions.noRegionsFound")}
        </h3>
        <p className="text-grey mt-2">
          {t("explorePage.regions.tryDifferentCriteria")}
        </p>
      </div>
    );
  }

  return (
    <>
      <ListFilter
        searchQuery={regionFilters.searchQuery}
        setSearchQuery={regionFilters.setSearchQuery}
        sortBy={regionFilters.sortBy}
        setSortBy={regionFilters.setSortBy}
        sortDirection={regionFilters.sortDirection}
        setSortDirection={regionFilters.setSortDirection}
        filterGroups={regionFilters.filterGroups}
        activeFilters={regionFilters.activeFilters}
        sortOptions={sortOptions}
        searchPlaceholder={t("explorePage.regions.searchPlaceholder")}
      />
      <CardGrid
        items={transformedRegions}
        itemContent={(transformedData) => (
          <ListCard key={transformedData.linkTo} {...transformedData} />
        )}
      />
    </>
  );
}

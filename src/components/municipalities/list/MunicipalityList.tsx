import { useTranslation } from "react-i18next";
import type { Municipality } from "@/types/municipality";
import useTransformMunicipalityListCard from "@/hooks/municipalities/useTransformMunicipalityListCard";
import { useMunicipalitiesFilters } from "@/hooks/municipalities/useMunicipalitiesFilters";
import { useSortOptions } from "@/hooks/municipalities/useMunicipalitiesSorting";
import { ExploreEntityList } from "@/components/explore/ExploreEntityList";

interface MunicipalityListProps {
  municipalities: Municipality[];
}

export function MunicipalityList({ municipalities }: MunicipalityListProps) {
  const { t } = useTranslation();
  const municipalityFilters = useMunicipalitiesFilters(municipalities);
  const { filteredMunicipalities } = municipalityFilters;
  const municipalitySortOptions = useSortOptions();

  const transformedMunicipalities = useTransformMunicipalityListCard({
    filteredMunicipalities,
  });
  const allTransformedMunicipalities = useTransformMunicipalityListCard({
    filteredMunicipalities: municipalities,
  });

  return (
    <ExploreEntityList
      items={transformedMunicipalities}
      allItems={allTransformedMunicipalities}
      filterProps={{
        searchQuery: municipalityFilters.searchQuery,
        setSearchQuery: municipalityFilters.setSearchQuery,
        sortBy: municipalityFilters.sortBy,
        setSortBy: municipalityFilters.setSortBy,
        sortDirection: municipalityFilters.sortDirection,
        setSortDirection: municipalityFilters.setSortDirection,
        filterGroups: municipalityFilters.filterGroups,
        activeFilters: municipalityFilters.activeFilters,
        sortOptions: municipalitySortOptions,
        searchPlaceholder: t("explorePage.municipalities.searchPlaceholder"),
      }}
    />
  );
}

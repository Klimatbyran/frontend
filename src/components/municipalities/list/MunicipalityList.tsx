import { useTranslation } from "react-i18next";
import { CardGrid } from "@/components/layout/CardGrid";
import { ListCard } from "@/components/layout/ListCard";
import type { Municipality } from "@/types/municipality";
import ListFilter from "@/components/explore/ListFilter";
import useTransformMunicipalityListCard from "@/hooks/municipalities/useTransformMunicipalityListCard";
import { useMunicipalitiesFilters } from "@/hooks/municipalities/useMunicipalitiesFilters";
import { useSortOptions } from "@/hooks/municipalities/useMunicipalitiesSorting";

interface MunicipalityListProps {
  municipalities: Municipality[];
}

export function MunicipalityList({ municipalities }: MunicipalityListProps) {
  const { t } = useTranslation();
  const municipalityFilters = useMunicipalitiesFilters(municipalities);
  const { filteredMunicipalities } = municipalityFilters;
  const municipalitySortOptions = useSortOptions();

  // Transform municipality data for ListCard components
  const transformedMunicipalities = useTransformMunicipalityListCard({
    filteredMunicipalities,
  });

  return (
    <>
      <ListFilter
        searchQuery={municipalityFilters.searchQuery}
        setSearchQuery={municipalityFilters.setSearchQuery}
        sortBy={municipalityFilters.sortBy}
        setSortBy={municipalityFilters.setSortBy}
        sortDirection={municipalityFilters.sortDirection}
        setSortDirection={municipalityFilters.setSortDirection}
        filterGroups={municipalityFilters.filterGroups}
        activeFilters={municipalityFilters.activeFilters}
        sortOptions={municipalitySortOptions}
        searchPlaceholder={t("explorePage.municipalities.searchPlaceholder")}
      />
      <CardGrid
        items={transformedMunicipalities}
        itemContent={(transformedData) => (
          <ListCard key={transformedData.linkTo} {...transformedData} />
        )}
      />
    </>
  );
}

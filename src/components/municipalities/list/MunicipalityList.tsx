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
  const municipalityFilters = useMunicipalitiesFilters(municipalities);
  const filteredMunicipalities = municipalityFilters.filteredMunicipalities;
  const municipalitySortOptions = useSortOptions();

  // Transform municipality data for ListCard components
  const transformedMunicipalities = useTransformMunicipalityListCard({
    filteredMunicipalities,
  });

  return (
    <>
      <ListFilter
        filteredMunicipalities={filteredMunicipalities}
        municipalityFilters={municipalityFilters}
        municipalitySortOptions={municipalitySortOptions}
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

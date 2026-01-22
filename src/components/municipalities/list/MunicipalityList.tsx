import { CardGrid } from "@/components/layout/CardGrid";
import { ListCard } from "@/components/layout/ListCard";
import type { Municipality } from "@/types/municipality";
import ListFilter from "@/components/ListFilter";
import useTransformMunicipalityListCard from "@/hooks/companies/useTransformMunicipalityListCard";
import { useMunicipalitiesFilters } from "@/hooks/municipalities/useMunicipalitiesFilters";

interface MunicipalityListProps {
  municipalities: Municipality[];
}

export function MunicipalityList({ municipalities }: MunicipalityListProps) {
  const { filteredMunicipalities } = useMunicipalitiesFilters(municipalities);

  // Transform municipality data for ListCard components
  const transformedMunicipalities = useTransformMunicipalityListCard({
    sortedMunicipalities: filteredMunicipalities,
  });

  return (
    <>
      <ListFilter municipalities={filteredMunicipalities} />
      <CardGrid
        items={transformedMunicipalities}
        itemContent={(transformedData) => (
          <ListCard key={transformedData.linkTo} {...transformedData} />
        )}
      />
    </>
  );
}

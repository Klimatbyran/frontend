import { useExploreCompanies } from "@/hooks/companies/useExploreCompanies";
import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";
import { useExploreMunicipalities } from "@/hooks/municipalities/useExploreMunicipalities";
import useTransformMunicipalityListCard from "@/hooks/municipalities/useTransformMunicipalityListCard";
import { useRegionsForExplore } from "@/hooks/regions/useRegionsForExplore";
import { useTransformRegionListCard } from "@/hooks/regions/useTransformRegionListCard";

interface UseComparisonSourceCardsOptions {
  loadCompanies: boolean;
  loadMunicipalities: boolean;
  loadRegions: boolean;
}

export function useComparisonSourceCards({
  loadCompanies,
  loadMunicipalities,
  loadRegions,
}: UseComparisonSourceCardsOptions) {
  const { companies, companiesLoading } = useExploreCompanies({
    enabled: loadCompanies,
  });
  const { municipalities, municipalitiesLoading } = useExploreMunicipalities({
    enabled: loadMunicipalities,
  });
  const { regions, loading: regionsLoading } = useRegionsForExplore({
    enabled: loadRegions,
  });

  const allCompanyCards = useTransformCompanyListCard({
    filteredCompanies: loadCompanies ? (companies ?? []) : [],
  });
  const allMunicipalityCards = useTransformMunicipalityListCard({
    filteredMunicipalities: loadMunicipalities ? (municipalities ?? []) : [],
  });
  const allRegionCards = useTransformRegionListCard({
    filteredRegions: loadRegions ? (regions ?? []) : [],
  });

  return {
    allCompanyCards,
    allMunicipalityCards,
    allRegionCards,
    companies,
    municipalities,
    regions,
    companiesLoading,
    municipalitiesLoading,
    regionsLoading,
  };
}

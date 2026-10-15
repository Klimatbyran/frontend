import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import useTransformMunicipalityListCard from "@/hooks/municipalities/useTransformMunicipalityListCard";
import { useRegionsForExplore } from "@/hooks/regions/useRegionsForExplore";
import { useTransformRegionListCard } from "@/hooks/regions/useTransformRegionListCard";
import { useComparisonCompanies } from "./useComparisonCompanies";

interface UseComparisonSourceCardsOptions {
  selectedCompanyLinkTos: string[];
  loadCompanies: boolean;
  loadMunicipalities: boolean;
  loadRegions: boolean;
}

export function useComparisonSourceCards({
  selectedCompanyLinkTos,
  loadCompanies,
  loadMunicipalities,
  loadRegions,
}: UseComparisonSourceCardsOptions) {
  const { companies, companiesLoading, companiesError } =
    useComparisonCompanies(selectedCompanyLinkTos, loadCompanies);
  const { municipalities, municipalitiesLoading, municipalitiesError } =
    useMunicipalities({
      enabled: loadMunicipalities,
    });
  const {
    regions,
    loading: regionsLoading,
    error: regionsError,
  } = useRegionsForExplore({
    enabled: loadRegions,
  });

  const allCompanyCards = useTransformCompanyListCard({
    filteredCompanies: loadCompanies ? companies : [],
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
    companiesError,
    municipalitiesError,
    regionsError,
  };
}

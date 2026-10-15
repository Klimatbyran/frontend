import { useCompanySearch } from "@/hooks/companies/useCompanySearch";
import { useMunicipalityKPIs } from "@/hooks/municipalities/useMunicipalityKPIs";
import { useNationStoryData } from "@/hooks/nation/useNationStoryData";
import { useRegionsKPIs } from "@/hooks/regions/useRegionKPIs";
import { LANDING_DEFAULT_COMPANY_SEARCH } from "@/lib/constants/landingPage";

/** True until every request the landing page renders on first view has settled. */
export function useLandingPageReady() {
  const { loading: municipalitiesLoading } = useMunicipalityKPIs();
  const { loading: regionsLoading } = useRegionsKPIs();
  const { loading: nationLoading } = useNationStoryData();
  const { isSearching, isDebouncing } = useCompanySearch(
    LANDING_DEFAULT_COMPANY_SEARCH,
  );

  return {
    loading:
      municipalitiesLoading ||
      regionsLoading ||
      nationLoading ||
      isSearching ||
      isDebouncing,
  };
}

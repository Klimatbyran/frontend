import { useMemo } from "react";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";

const TOP_LIST_COUNT = 5;
export const SCROLL_FADE_THRESHOLD = 200;

export function useLandingPageData() {
  const { companies } = useCompanies();
  const { getTopMunicipalities } = useMunicipalities();

  // Get top companies by total emissions
  const largestCompanyEmitters = useMemo(() => {
    return companies
      .sort(
        (a, b) =>
          (b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0) -
          (a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0),
      )
      .slice(0, TOP_LIST_COUNT)
      .map((company) => ({
        name: company.name,
        value:
          company.reportingPeriods.at(0)?.emissions?.calculatedTotalEmissions ||
          0,
        link: `/companies/${company.wikidataId}`,
      }));
  }, [companies]);

  // Get top municipalities by emissions reduction
  const topMunicipalities = useMemo(() => {
    return getTopMunicipalities(TOP_LIST_COUNT).map((municipality) => ({
      name: municipality.name,
      value: municipality.historicalEmissionChangePercent,
      link: `/municipalities/${municipality.name}`,
    }));
  }, [getTopMunicipalities]);

  return {
    largestCompanyEmitters,
    topMunicipalities,
  };
}

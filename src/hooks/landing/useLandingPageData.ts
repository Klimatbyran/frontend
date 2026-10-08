import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPageLanding } from "@/lib/pagesApi";
import { getCompanyDetailPath } from "@/utils/companyRouting";

export const SCROLL_FADE_THRESHOLD = 200;

export function useLandingPageData() {
  const { data } = useQuery({
    queryKey: ["pages", "landing"],
    queryFn: getPageLanding,
    staleTime: 1_800_000,
  });

  const largestCompanyEmitters = useMemo(() => {
    return (data?.companies ?? []).map((company) => ({
      name: company.name,
      value: company.latestTotalEmissions,
      link: getCompanyDetailPath(company),
    }));
  }, [data?.companies]);

  const topMunicipalities = useMemo(() => {
    return (data?.municipalities ?? []).map((municipality) => ({
      name: municipality.name,
      value: municipality.historicalEmissionChangePercent,
      link: `/municipalities/${municipality.name}`,
    }));
  }, [data?.municipalities]);

  return {
    largestCompanyEmitters,
    topMunicipalities,
  };
}

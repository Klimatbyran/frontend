import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLandingPageData } from "@/lib/api";
import { getCompanyDetailPath } from "@/utils/companyRouting";
import { getEntityDetailPath } from "@/utils/routing";

export const SCROLL_FADE_THRESHOLD = 200;

export function useLandingPageData() {
  const { data } = useQuery({
    queryKey: ["pages", "landing"],
    queryFn: getLandingPageData,
    staleTime: 1800000,
  });

  const largestCompanyEmitters = useMemo(() => {
    return (data?.companies ?? []).map((company) => ({
      name: company.name,
      value: company.latestTotalEmissions,
      link: getCompanyDetailPath(company),
    }));
  }, [data]);

  const topMunicipalities = useMemo(() => {
    return (data?.municipalities ?? []).map((municipality) => ({
      name: municipality.name,
      value: municipality.historicalEmissionChangePercent,
      link: getEntityDetailPath("municipality", municipality.name),
    }));
  }, [data]);

  return {
    largestCompanyEmitters,
    topMunicipalities,
  };
}

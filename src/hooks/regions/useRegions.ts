import { useQuery } from "@tanstack/react-query";
import { getRegionalKPIs } from "@/lib/api";

type ApiRegionKPI = {
  region: string;
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
};

export type RegionData = {
  name: string;
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
};

const normalizeRegion = (region: ApiRegionKPI): RegionData => {
  return {
    name: region.region,
    historicalEmissionChangePercent: region.historicalEmissionChangePercent,
    meetsParis: region.meetsParis,
  };
};

export function useRegions() {
  const {
    data: regionsKPI = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["regions-kpis"],
    queryFn: getRegionalKPIs,
  });

  const normalizedRegions = (regionsKPI as ApiRegionKPI[]).map((region) =>
    normalizeRegion(region),
  );

  return {
    regions: normalizedRegions.map((region) => region.name),
    regionsData: normalizedRegions,
    loading: isLoading,
    error,
  };
}

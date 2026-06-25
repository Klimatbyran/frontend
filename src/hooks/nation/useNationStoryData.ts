import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNationDetails } from "@/hooks/nation/useNationDetails";
import { useRegionsList } from "@/hooks/regions/useRegionsList";
import { getMunicipalityDetails } from "@/lib/api";
import {
  computeNationStoryMetrics,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";

const GAVLE_MUNICIPALITY = "Gävle";

function getMunicipalityEmissionsForYear(
  emissions: Array<{ year: number; value: number } | null> | undefined,
  year: number,
): number | null {
  const match = emissions?.find((point) => point?.year === year);
  return match?.value ?? null;
}

export function useNationStoryData() {
  const { nation, loading, error } = useNationDetails();
  const { regions } = useRegionsList();
  const sortedRegions = useMemo(() => [...regions].sort(), [regions]);

  const metrics = useMemo<NationStoryMetrics | null>(() => {
    if (!nation) return null;
    return computeNationStoryMetrics(nation);
  }, [nation]);

  const comparisonYear = metrics?.latestYear ?? new Date().getFullYear();

  const {
    data: gavleMunicipality,
    isLoading: gavleLoading,
  } = useQuery({
    queryKey: ["municipality", GAVLE_MUNICIPALITY, comparisonYear],
    queryFn: () => getMunicipalityDetails(GAVLE_MUNICIPALITY),
    enabled: !!metrics,
    staleTime: 1_800_000,
  });

  const gavleEmissionsTonnes = useMemo(() => {
    if (!gavleMunicipality?.emissions) return null;
    const value = getMunicipalityEmissionsForYear(
      gavleMunicipality.emissions,
      comparisonYear,
    );
    if (value == null) return null;
    return value / 1000;
  }, [gavleMunicipality, comparisonYear]);

  return {
    nation,
    metrics,
    sortedRegions,
    gavleEmissionsTonnes,
    gavleLoading,
    loading,
    error,
  };
}

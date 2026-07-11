import { useMemo } from "react";
import { useNationStoryDetails } from "@/hooks/nation/useNationStoryDetails";
import { useRegionsList } from "@/hooks/regions/useRegionsList";
import {
  computeNationStoryMetrics,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";

export function useNationStoryData() {
  const { nation, loading, error } = useNationStoryDetails();
  const { regions } = useRegionsList();
  const sortedRegions = useMemo(() => [...regions].sort(), [regions]);

  const metrics = useMemo<NationStoryMetrics | null>(() => {
    if (!nation) return null;
    return computeNationStoryMetrics(nation);
  }, [nation]);

  return {
    nation,
    metrics,
    sortedRegions,
    loading,
    error,
  };
}

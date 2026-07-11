import { useMemo } from "react";
import { useNationStoryDetails } from "@/hooks/nation/useNationStoryDetails";
import {
  computeNationStoryMetrics,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";

export function useNationStoryData() {
  const { nation, loading, error } = useNationStoryDetails();

  const metrics = useMemo<NationStoryMetrics | null>(() => {
    if (!nation) return null;
    return computeNationStoryMetrics(nation);
  }, [nation]);

  return {
    nation,
    metrics,
    loading,
    error,
  };
}

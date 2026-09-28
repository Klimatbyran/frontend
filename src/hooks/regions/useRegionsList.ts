import { useMemo } from "react";
import { useRegionsForExplore } from "./useRegionsForExplore";

/** Region names for the nation page, from the lightweight explore regions list. */
export function useRegionsList() {
  const { regions, loading, error } = useRegionsForExplore();

  const names = useMemo(() => regions.map((region) => region.name), [regions]);

  return {
    regions: names,
    loading,
    error,
  };
}

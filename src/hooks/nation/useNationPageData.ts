import { useMemo } from "react";
import {
  useNationDetails,
  useNationDetailHeaderStats,
} from "@/hooks/nation/useNationDetails";
import { useRegions } from "@/hooks/useRegions";
import { transformNationEmissionsData } from "@/utils/data/nationTransforms";

export function useNationPageData() {
  const { nation, loading, error } = useNationDetails();
  const { regions } = useRegions();
  const sortedRegions = useMemo(() => [...regions].sort(), [regions]);
  const calendarYear = new Date().getFullYear();
  const emissionsData = useMemo(
    () => (nation ? transformNationEmissionsData(nation, calendarYear) : []),
    [nation, calendarYear],
  );

  const lastYearEmissions = useMemo(() => {
    return emissionsData
      .filter((d) => d.total !== undefined)
      .sort((a, b) => b.year - a.year)[0];
  }, [emissionsData]);
  const lastYear = lastYearEmissions?.year;
  const headerStats = useNationDetailHeaderStats(nation, lastYear);

  return {
    nation,
    loading,
    error,
    sortedRegions,
    emissionsData,
    headerStats,
  };
}

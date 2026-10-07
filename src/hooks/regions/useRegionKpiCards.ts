import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  buildRegionKpiCards,
  type RegionKpiSubject,
} from "@/utils/detail/regionKpiCards";
import type { PlacementStatus } from "@/utils/insights/kpiPlacement";
import { useRegionsForExplore } from "./useRegionsForExplore";

function placementStatus(loading: boolean, error: unknown): PlacementStatus {
  if (loading) return "loading";
  if (error) return "error";
  return "ready";
}

export function useRegionKpiCards(
  region: RegionKpiSubject | null,
  lastYear: number | undefined,
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { regions, loading, error } = useRegionsForExplore();

  const peers = useMemo(
    () =>
      regions.map((peer) => ({
        name: peer.name,
        meetsParis: peer.meetsParis,
        historicalEmissionChangePercent: peer.historicalEmissionChangePercent,
        emissionsByYear: peer.emissions,
      })),
    [regions],
  );

  return useMemo(() => {
    if (!region) return [];
    return buildRegionKpiCards(
      region,
      peers,
      lastYear,
      placementStatus(loading, error),
      t,
      currentLanguage,
    );
  }, [region, peers, lastYear, loading, error, t, currentLanguage]);
}

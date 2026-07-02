import { useMemo } from "react";
import { FeatureCollection } from "geojson";
import { useClimateTraceEmissions } from "@/hooks/europe/useClimateTraceEmissions";
import europeGeoJson from "@/data/europeGeo.json";
import {
  calculateEuropeanKpiAverages,
  EuropeanKpiAverages,
} from "@/utils/europe/europeanKpiAverages";

export function useEuropeanKpiAverages(): EuropeanKpiAverages {
  const { emissionsByIso } = useClimateTraceEmissions();

  return useMemo(
    () =>
      calculateEuropeanKpiAverages(
        europeGeoJson as FeatureCollection,
        emissionsByIso,
      ),
    [emissionsByIso],
  );
}

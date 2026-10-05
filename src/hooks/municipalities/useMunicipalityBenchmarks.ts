import { useMemo } from "react";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import type { Municipality } from "@/types/municipality";
import { buildMunicipalityBenchmarks } from "@/utils/detail/municipalityBenchmarks";

export function useMunicipalityBenchmarks(municipality: Municipality | null) {
  const { municipalities } = useMunicipalities();

  return useMemo(() => {
    if (!municipality) return null;
    return buildMunicipalityBenchmarks(municipality, municipalities);
  }, [municipality, municipalities]);
}

import { useTranslation } from "react-i18next";
import { KPIValue } from "@/types/rankings";
import type { Municipality } from "@/types/municipality";
import { getMunicipalitiesKPIs } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { buildMunicipalityKpiDefinitions } from "./municipalityKpiDefinitions";

export type MunicipalityData = Awaited<
  ReturnType<typeof getMunicipalitiesKPIs>
>[number];

export function useMunicipalities() {
  const {
    data: municipalitiesKPI = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["municipalities-kpis"],
    queryFn: getMunicipalitiesKPIs,
  });

  const municipalitiesData: MunicipalityData[] = municipalitiesKPI;

  return {
    municipalities: municipalitiesData.map((m) => m.name),
    municipalitiesData,
    loading: isLoading,
    error,
  };
}

export const useMunicipalityKPIs = (): KPIValue<Municipality>[] => {
  const { t } = useTranslation();
  return buildMunicipalityKpiDefinitions(t);
};

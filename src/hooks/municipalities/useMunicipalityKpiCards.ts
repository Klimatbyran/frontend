import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import type { Municipality } from "@/types/municipality";
import { buildMunicipalityKpiCards } from "@/utils/detail/municipalityKpiCards";
import type { PlacementStatus } from "@/utils/insights/kpiPlacement";
import { useMunicipalities } from "./useMunicipalities";

function placementStatus(loading: boolean, error: unknown): PlacementStatus {
  if (loading) return "loading";
  if (error) return "error";
  return "ready";
}

export function useMunicipalityKpiCards(municipality: Municipality | null) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { municipalities, municipalitiesLoading, municipalitiesError } =
    useMunicipalities();

  return useMemo(() => {
    if (!municipality) return [];
    return buildMunicipalityKpiCards(
      municipality,
      municipalities,
      placementStatus(municipalitiesLoading, municipalitiesError),
      t,
      currentLanguage,
    );
  }, [
    municipality,
    municipalities,
    municipalitiesLoading,
    municipalitiesError,
    t,
    currentLanguage,
  ]);
}

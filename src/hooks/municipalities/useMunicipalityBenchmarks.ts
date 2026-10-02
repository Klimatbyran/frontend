import { useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import type { Municipality } from "@/types/municipality";
import {
  formatEmissionsAbsoluteCompact,
  formatPercent,
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";
import { buildMunicipalityBenchmarks } from "@/utils/detail/municipalityBenchmarks";

export function useMunicipalityBenchmarks(municipality: Municipality | null) {
  const { municipalities } = useMunicipalities();
  const { currentLanguage } = useLanguage();

  return useMemo(() => {
    if (!municipality) return null;
    return buildMunicipalityBenchmarks(municipality, municipalities, {
      emissions: (value) =>
        formatEmissionsAbsoluteCompact(value, currentLanguage),
      changePercent: (value) => formatPercentChange(value, currentLanguage),
      sharePercent: (value) => formatPercent(value, currentLanguage, true),
      plain: (value) => localizeUnit(value, currentLanguage) ?? "",
    });
  }, [municipality, municipalities, currentLanguage]);
}

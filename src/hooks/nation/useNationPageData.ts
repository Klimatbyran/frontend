import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNationDetails } from "@/hooks/nation/useNationDetails";
import { useTerritoryDetailPageData } from "@/hooks/territories/useTerritoryDetailPageData";
import { useRegionsList } from "@/hooks/regions/useRegionsList";
import { useClimateTraceEmissions } from "@/hooks/europe/useClimateTraceEmissions";
import { SWEDEN_ISO3 } from "@/hooks/europe/useEuropeanCountryDetails";
import { createEmissionsPerCapitaStat } from "@/hooks/territories/useTerritoryDetailHeaderStats";
import { useLanguage } from "@/components/LanguageProvider";

export function useNationPageData() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { nation, loading, error } = useNationDetails();
  const { regions } = useRegionsList();
  const { emissionsByIso } = useClimateTraceEmissions();
  const sortedRegions = useMemo(() => [...regions].sort(), [regions]);

  const territoryPageData = useTerritoryDetailPageData(nation, "nation");

  const headerStats = useMemo(() => {
    const emissionsPerCapita = emissionsByIso[SWEDEN_ISO3]?.emissionsPerCapita;
    if (emissionsPerCapita == null) {
      return territoryPageData.headerStats;
    }

    return [
      ...territoryPageData.headerStats,
      createEmissionsPerCapitaStat(emissionsPerCapita, currentLanguage, t, {
        infoText: t("detailPage.emissionsPerCapitaTooltipClimateTrace"),
      }),
    ];
  }, [territoryPageData.headerStats, emissionsByIso, currentLanguage, t]);

  return {
    nation,
    loading,
    error,
    sortedRegions,
    ...territoryPageData,
    headerStats,
  };
}

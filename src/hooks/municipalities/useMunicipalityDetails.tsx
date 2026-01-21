import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { DetailStat } from "@/components/detail/DetailHeader";
import { getMunicipalityDetails } from "@/lib/api";
import { Municipality } from "@/types/municipality";

export function useMunicipalityDetails(id: string) {
  const {
    data: municipality,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["municipality", id],
    queryFn: () => getMunicipalityDetails(id),
    enabled: !!id,
    staleTime: 1800000,
  });

  return {
    municipality: municipality
      ? ({
          ...municipality,
          meetsParisGoal:
            municipality.totalTrend <= municipality.totalCarbonLaw,
          climatePlan: municipality.climatePlanYear !== null,
        } as Municipality)
      : null,
    loading: isLoading,
    error,
  };
}

export function useMunicipalityDetailHeaderStats(
  municipality: Municipality | null,
  lastYear: number | undefined,
  lastYearEmissionsTon: string,
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const stats: DetailStat[] = municipality
    ? [
        {
          label: t("detailPage.totalEmissions", {
            year: lastYear,
          }),
          value: lastYearEmissionsTon,
          unit: t("emissionsUnit"),
          valueClassName: "text-orange-2",
          info: true,
          infoText: t("municipalityDetailPage.totalEmissionsTooltip"),
        },
        {
          label: t("municipalityDetailPage.annualChangeSince2015"),
          value: formatPercentChange(
            municipality.historicalEmissionChangePercent,
            currentLanguage,
          ),
          valueClassName: cn(
            municipality.historicalEmissionChangePercent > 0
              ? "text-pink-3"
              : "text-orange-2",
          ),
        },
        {
          label: t("municipalityDetailPage.consumptionEmissionsPerCapita"),
          value: localizeUnit(
            municipality.totalConsumptionEmission,
            currentLanguage,
          ),
          valueClassName: "text-orange-2",
          unit: t("emissionsUnit"),
        },
      ]
    : [];

  return stats;
}

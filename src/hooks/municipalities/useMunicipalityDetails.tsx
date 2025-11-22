import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { Municipality } from "@/types/municipality";
import { DetailStat } from "@/components/detail/DetailHeader";

export function useMunicipalityDetailHeaderStats(
  municipality: Municipality,
  lastYear: number | undefined,
  lastYearEmissionsTon: string,
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const stats: DetailStat[] = [
    {
      label: t("municipalityDetailPage.totalEmissions", {
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
  ];

  return stats;
}

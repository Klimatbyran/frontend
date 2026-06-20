import { useTranslation } from "react-i18next";
import { KPIValue } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";

export const useEuropeanKPIs = (): KPIValue<EuropeanCountry>[] => {
  const { t } = useTranslation();

  return [
    {
      label: t("europe.list.kpis.emissionsPerCapita.label"),
      key: "emissionsPerCapita",
      unit: t("europe.list.kpis.emissionsPerCapita.unit"),
      description: t("europe.list.kpis.emissionsPerCapita.description"),
      detailedDescription: t(
        "europe.list.kpis.emissionsPerCapita.detailedDescription",
      ),
      higherIsBetter: false,
      source: "europe.list.kpis.emissionsPerCapita.source",
      sourceUrls: ["https://climatetrace.org/"],
    },
    {
      label: t("europe.list.kpis.emissionsPercentChange.label"),
      key: "emissionsPercentChange",
      unit: "%",
      description: t("europe.list.kpis.emissionsPercentChange.description"),
      detailedDescription: t(
        "europe.list.kpis.emissionsPercentChange.detailedDescription",
      ),
      higherIsBetter: false,
      source: "europe.list.kpis.emissionsPercentChange.source",
      sourceUrls: ["https://climatetrace.org/"],
    },
    {
      label: t("europe.list.kpis.historicalEmissionChangePercent.label"),
      key: "historicalEmissionChangePercent",
      unit: "%",
      description: t(
        "europe.list.kpis.historicalEmissionChangePercent.description",
      ),
      detailedDescription: t(
        "europe.list.kpis.historicalEmissionChangePercent.detailedDescription",
      ),
      higherIsBetter: false,
      source: "europe.list.kpis.historicalEmissionChangePercent.source",
      sourceUrls: ["https://climatetrace.org/"],
    },
    {
      label: t("europe.list.kpis.meetsParis.label"),
      key: "meetsParis",
      unit: "",
      description: t("europe.list.kpis.meetsParis.description"),
      detailedDescription: t("europe.list.kpis.meetsParis.detailedDescription"),
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: {
        true: t("europe.list.kpis.meetsParis.booleanLabels.true"),
        false: t("europe.list.kpis.meetsParis.booleanLabels.false"),
      },
      source: "europe.list.kpis.meetsParis.source",
      sourceUrls: ["https://climatetrace.org/"],
    },
  ];
};

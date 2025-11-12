import { KPIValue } from "@/types/entity-rankings";
import { Region } from "@/types/region";
import { useTranslation } from "react-i18next";

export const useRegionalKPIs = (): KPIValue<Region>[] => {
  const { t } = useTranslation();

  return [
    {
      label: t("regions.list.kpis.historicalEmissionChangePercent.label"),
      key: "historicalEmissionChangePercent",
      unit: "%",
      description: t(
        "regions.list.kpis.historicalEmissionChangePercent.description",
      ),
      detailedDescription: t(
        "regions.list.kpis.historicalEmissionChangePercent.detailedDescription",
      ),
      higherIsBetter: false,
      source: "regions.list.kpis.historicalEmissionChangePercent.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
    {
      label: t("regions.list.kpis.meetsParis.label"),
      key: "meetsParis",
      unit: "",
      description: t("regions.list.kpis.meetsParis.description"),
      detailedDescription: t(
        "regions.list.kpis.meetsParis.detailedDescription",
      ),
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: {
        true: t("regions.list.kpis.meetsParis.booleanLabels.true"),
        false: t("regions.list.kpis.meetsParis.booleanLabels.false"),
      },
      source: "regions.list.kpis.meetsParis.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
  ];
};

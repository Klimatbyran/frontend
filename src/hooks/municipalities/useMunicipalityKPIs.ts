import { KPIValue } from "@/types/municipality";
import { useTranslation } from "react-i18next";

export const useMunicipalityKPIs = (): KPIValue[] => {
  const { t } = useTranslation();

  const KPIs: KPIValue[] = [
    {
      label: t("municipalities.list.kpis.meetsParisGoal.label"),
      key: "meetsParisGoal",
      unit: "",
      source: "municipalities.list.meetsParisGoal.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
      description: t("municipalities.list.kpis.meetsParisGoal.description"),
      detailedDescription: t(
        "municipalities.list.kpis.meetsParisGoal.detailedDescription",
      ),
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: {
        true: t("municipalities.list.kpis.meetsParisGoal.booleanLabels.true"),
        false: t("municipalities.list.kpis.meetsParisGoal.booleanLabels.false"),
      },
      belowString: t("municipalities.list.kpis.meetsParisGoal.belowString"),
      aboveString: t("municipalities.list.kpis.meetsParisGoal.aboveString"),
    },
    {
      label: t(
        "municipalities.list.kpis.historicalEmissionChangePercent.label",
      ),
      key: "historicalEmissionChangePercent",
      unit: "%",
      source: "municipalities.list.historicalEmissionChangePercent.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
      description: t(
        "municipalities.list.kpis.historicalEmissionChangePercent.description",
      ),
      detailedDescription: t(
        "municipalities.list.kpis.historicalEmissionChangePercent.detailedDescription",
      ),
      higherIsBetter: false,
    },
    {
      label: t("municipalities.list.kpis.electricCarChangePercent.label"),
      key: "electricCarChangePercent",
      unit: "%",
      source: "municipalities.list.electricCarChangePercent.source",
      sourceUrls: ["https://www.trafa.se/vagtrafik/fordon/"],
      description: t(
        "municipalities.list.kpis.electricCarChangePercent.description",
      ),
      detailedDescription: t(
        "municipalities.list.kpis.electricCarChangePercent.detailedDescription",
      ),
      nullValues: t(
        "municipalities.list.kpis.electricCarChangePercent.nullValues",
      ),
      higherIsBetter: true,
    },
    {
      label: t("municipalities.list.kpis.totalConsumptionEmission.label"),
      key: "totalConsumptionEmission",
      unit: "t",
      source: "municipalities.list.totalConsumptionEmission.source",
      sourceUrls: ["https://konsumtionskompassen.se/"],
      description: t(
        "municipalities.list.kpis.totalConsumptionEmission.description",
      ),
      detailedDescription: t(
        "municipalities.list.kpis.totalConsumptionEmission.detailedDescription",
      ),
      higherIsBetter: false,
    },
    {
      label: t("municipalities.list.kpis.electricVehiclePerChargePoints.label"),
      key: "electricVehiclePerChargePoints",
      unit: "",
      source: "municipalities.list.electricVehiclePerChargePoints.source",
      sourceUrls: ["https://powercircle.org/elbilsstatistik/"],
      description: t(
        "municipalities.list.kpis.electricVehiclePerChargePoints.description",
      ),
      detailedDescription: t(
        "municipalities.list.kpis.electricVehiclePerChargePoints.detailedDescription",
      ),
      nullValues: t(
        "municipalities.list.kpis.electricVehiclePerChargePoints.nullValues",
      ),
      higherIsBetter: false,
    },
    {
      label: t("municipalities.list.kpis.bicycleMetrePerCapita.label"),
      key: "bicycleMetrePerCapita",
      unit: "m",
      source: "municipalities.list.bicycleMetrePerCapita.source",
      sourceUrls: [
        "https://nvdbpakarta.trafikverket.se/map",
        "https://www.scb.se/hitta-statistik/statistik-efter-amne/befolkning-och-levnadsforhallanden/befolkningens-sammansattning-och-utveckling/befolkningsstatistik/",
      ],
      description: t(
        "municipalities.list.kpis.bicycleMetrePerCapita.description",
      ),
      detailedDescription: t(
        "municipalities.list.kpis.bicycleMetrePerCapita.detailedDescription",
      ),
      higherIsBetter: true,
    },
    {
      label: t("municipalities.list.kpis.climatePlan.label"),
      key: "climatePlan",
      unit: "",
      source: "municipalities.list.climatePlan.source",
      sourceUrls: ["https://docs.google.com/spreadsheets/d/13CMqmfdd6QUD6agKFyVhwZUol4PKzvy253_EwtsFyvw/edit#gid=0"],
      description: t("municipalities.list.kpis.climatePlan.description"),
      detailedDescription: t(
        "municipalities.list.kpis.climatePlan.detailedDescription",
      ),
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: {
        true: t("municipalities.list.kpis.climatePlan.booleanLabels.true"),
        false: t("municipalities.list.kpis.climatePlan.booleanLabels.false"),
      },
      belowString: t("municipalities.list.kpis.climatePlan.belowString"),
      aboveString: t("municipalities.list.kpis.climatePlan.aboveString"),
    },
  ];

  return KPIs;
};

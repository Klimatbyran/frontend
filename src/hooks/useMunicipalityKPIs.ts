import { KPIValue } from "@/types/municipality";
import { useTranslation } from "react-i18next";

export const useMunicipalityKPIs = (): KPIValue[] => {
  const { t } = useTranslation();

  const KPIs: KPIValue[] = [
    {
      label: t(
        "municipalities.list.dataSelector.dataPoints.historicalEmissionChangePercent.label",
      ),
      key: "historicalEmissionChangePercent",
      unit: "%",
      description: t(
        "municipalities.list.dataSelector.dataPoints.historicalEmissionChangePercent.description",
      ),
      detailedDescription: t(
        "municipalities.list.dataSelector.dataPoints.historicalEmissionChangePercent.detailedDescription",
      ),
      higherIsBetter: false,
    },
    {
      label: t(
        "municipalities.list.dataSelector.dataPoints.neededEmissionChangePercent.label",
      ),
      key: "neededEmissionChangePercent",
      unit: "%",
      description: t(
        "municipalities.list.dataSelector.dataPoints.neededEmissionChangePercent.description",
      ),
      detailedDescription: t(
        "municipalities.list.dataSelector.dataPoints.neededEmissionChangePercent.detailedDescription",
      ),
      higherIsBetter: false,
    },
    {
      label: t(
        "municipalities.list.dataSelector.dataPoints.electricCarChangePercent.label",
      ),
      key: "electricCarChangePercent",
      unit: "%",
      description: t(
        "municipalities.list.dataSelector.dataPoints.electricCarChangePercent.description",
      ),
      detailedDescription: t(
        "municipalities.list.dataSelector.dataPoints.electricCarChangePercent.detailedDescription",
      ),
      higherIsBetter: true,
    },
    {
      label: t(
        "municipalities.list.dataSelector.dataPoints.totalConsumptionEmission.label",
      ),
      key: "totalConsumptionEmission",
      unit: "t",
      description: t(
        "municipalities.list.dataSelector.dataPoints.totalConsumptionEmission.description",
      ),
      detailedDescription: t(
        "municipalities.list.dataSelector.dataPoints.totalConsumptionEmission.detailedDescription",
      ),
      higherIsBetter: false,
    },
    {
      label: t(
        "municipalities.list.dataSelector.dataPoints.electricVehiclePerChargePoints.label",
      ),
      key: "electricVehiclePerChargePoints",
      unit: "",
      description: t(
        "municipalities.list.dataSelector.dataPoints.electricVehiclePerChargePoints.description",
      ),
      detailedDescription: t(
        "municipalities.list.dataSelector.dataPoints.electricVehiclePerChargePoints.detailedDescription",
      ),
      higherIsBetter: false,
    },
    {
      label: t(
        "municipalities.list.dataSelector.dataPoints.bicycleMetrePerCapita.label",
      ),
      key: "bicycleMetrePerCapita",
      unit: "m",
      description: t(
        "municipalities.list.dataSelector.dataPoints.bicycleMetrePerCapita.description",
      ),
      detailedDescription: t(
        "municipalities.list.dataSelector.dataPoints.bicycleMetrePerCapita.detailedDescription",
      ),
      higherIsBetter: true,
    },
  ];

  return KPIs;
};

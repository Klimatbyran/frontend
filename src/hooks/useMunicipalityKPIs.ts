import { KPIValue } from "@/types/municipality";
import { t } from "i18next";
import { useMemo } from "react";

export const useDataPoints = (): KPIValue[] => {
  return useMemo(
    () => [
      {
        label: t(
          "municipalities.list.dataSelector.dataPoints.historicalEmissionChange.label",
        ),
        key: "historicalEmissionChangePercent",
        unit: "%",
        description: t(
          "municipalities.list.dataSelector.dataPoints.historicalEmissionChange.description",
        ),
        detailedDescription: t(
          "municipalities.list.dataSelector.dataPoints.historicalEmissionChange.detailedDescription",
        ),
        higherIsBetter: false,
      },
      {
        label: t(
          "municipalities.list.dataSelector.dataPoints.requiredEmissionChange.label",
        ),
        key: "neededEmissionChangePercent",
        unit: "%",
        description: t(
          "municipalities.list.dataSelector.dataPoints.requiredEmissionChange.description",
        ),
        detailedDescription: t(
          "municipalities.list.dataSelector.dataPoints.requiredEmissionChange.detailedDescription",
        ),
        higherIsBetter: false,
      },
      {
        label: t(
          "municipalities.list.dataSelector.dataPoints.electricCarGrowth.label",
        ),
        key: "electricCarChangePercent",
        unit: "%",
        description: t(
          "municipalities.list.dataSelector.dataPoints.electricCarGrowth.description",
        ),
        detailedDescription: t(
          "municipalities.list.dataSelector.dataPoints.electricCarGrowth.detailedDescription",
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
          "municipalities.list.dataSelector.dataPoints.evsPerChargePoint.label",
        ),
        key: "electricVehiclePerChargePoints",
        unit: "",
        description: t(
          "municipalities.list.dataSelector.dataPoints.evsPerChargePoint.description",
        ),
        detailedDescription: t(
          "municipalities.list.dataSelector.dataPoints.evsPerChargePoint.detailedDescription",
        ),
        higherIsBetter: false,
      },
      {
        label: t(
          "municipalities.list.dataSelector.dataPoints.bicycleInfrastructure.label",
        ),
        key: "bicycleMetrePerCapita",
        unit: "m",
        description: t(
          "municipalities.list.dataSelector.dataPoints.bicycleInfrastructure.description",
        ),
        detailedDescription: t(
          "municipalities.list.dataSelector.dataPoints.bicycleInfrastructure.detailedDescription",
        ),
        higherIsBetter: true,
      },
    ],
    [],
  );
};

import { t } from "i18next";
import { Municipality } from "@/types/municipality";

export interface DataPoint {
  label: string;
  key: keyof Municipality;
  unit: string;
  description?: string;
  higherIsBetter: boolean;
}

export const dataPoints: DataPoint[] = [
  {
    label: t(
      "municipalities.list.dataSelector.dataPoints.historicalEmissionChange.label",
    ),
    key: "historicalEmissionChangePercent",
    unit: "%",
    description: t(
      "municipalities.list.dataSelector.dataPoints.historicalEmissionChange.description",
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
    higherIsBetter: true,
  },
];

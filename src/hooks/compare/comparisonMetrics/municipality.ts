import type { TFunction } from "i18next";
import type { ComparisonSection } from "./types";
import {
  createClimateTargetSection,
  createEmissionsSection,
  getClimatePlanAdopted,
  getClimatePlanStatus,
  getDetailValue,
} from "./shared";

export function getMunicipalitySections(t: TFunction): ComparisonSection[] {
  return [
    createClimateTargetSection(t, "municipalities.card.meetsParis"),
    createEmissionsSection(t, "municipalityDetailPage.annualChangeSince2015", [
      {
        id: "consumptionEmissions",
        label: t("municipalityDetailPage.consumptionEmissionsPerCapita"),
        getValue: (item, translate) =>
          getDetailValue(
            item,
            "consumptionEmissionsPerCapita",
            translate("companies.card.noData"),
            {
              colorClass: "text-orange-2",
              unit: item.comparisonDetails?.consumptionEmissionsUnit,
            },
          ),
      },
    ]),
    {
      id: "sustainableTransport",
      label: t("explorePage.comparison.sections.sustainableTransport"),
      metrics: [
        {
          id: "electricCarChange",
          label: t("municipalityDetailPage.electricCarChange"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "electricCarChangePercent",
              translate("companies.card.noData"),
              { colorClass: "text-orange-2" },
            ),
        },
        {
          id: "electricCarsPerChargePoint",
          label: t("municipalityDetailPage.electricCarsPerChargePoint"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "electricCarsPerChargePoint",
              translate("companies.card.noData"),
              {
                colorClass:
                  item.comparisonDetails
                    ?.electricCarsPerChargePointColorClass ?? "text-white",
              },
            ),
        },
        {
          id: "bicycleMetrePerCapita",
          label: t("municipalityDetailPage.bicycleMetrePerCapita"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "bicycleMetrePerCapita",
              translate("companies.card.noData"),
              { colorClass: "text-orange-2" },
            ),
        },
      ],
    },
    {
      id: "procurement",
      label: t("explorePage.comparison.sections.procurement"),
      metrics: [
        {
          id: "procurementRequirements",
          label: t("municipalityDetailPage.procurementRequirements"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "procurementRequirements",
              translate("companies.card.noData"),
              {
                colorClass:
                  item.comparisonDetails?.procurementColorClass ?? "text-white",
              },
            ),
        },
      ],
    },
    {
      id: "politics",
      label: t("explorePage.comparison.sections.politics"),
      metrics: [
        {
          id: "politicalRule",
          label: t("municipalityDetailPage.politicalRule"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "politicalRule",
              translate("companies.card.noData"),
            ),
        },
        {
          id: "politicalKSO",
          label: t("municipalityDetailPage.politicalKSO"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "politicalKSO",
              translate("companies.card.noData"),
            ),
        },
      ],
    },
    {
      id: "climatePlan",
      label: t("explorePage.comparison.sections.climatePlan"),
      metrics: [
        {
          id: "hasClimatePlan",
          label: t("municipalities.card.climatePlan"),
          getValue: getClimatePlanStatus,
        },
        {
          id: "climatePlanAdopted",
          label: t("municipalities.card.climatePlanAdopted"),
          getValue: getClimatePlanAdopted,
        },
      ],
    },
  ];
}

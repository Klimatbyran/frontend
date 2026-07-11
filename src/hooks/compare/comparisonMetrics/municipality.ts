import type { TFunction } from "i18next";
import type { ComparisonSection } from "./types";
import {
  createClimatePlanSection,
  createClimateTargetSection,
  createEmissionsSection,
  createPoliticsSection,
  createProcurementSection,
  createSustainableTransportSection,
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
    createSustainableTransportSection(t),
    createProcurementSection(t),
    createPoliticsSection(t),
    createClimatePlanSection(t),
  ];
}

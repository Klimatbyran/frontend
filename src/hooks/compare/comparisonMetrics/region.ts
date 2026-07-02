import type { TFunction } from "i18next";
import type { ComparisonSection } from "./types";
import {
  createClimateTargetSection,
  createEmissionsSection,
  getDetailValue,
} from "./shared";

export function getRegionSections(t: TFunction): ComparisonSection[] {
  return [
    createClimateTargetSection(t, "municipalities.card.meetsParis"),
    createEmissionsSection(t, "explorePage.regions.changeRateLabel"),
    {
      id: "overview",
      label: t("explorePage.comparison.sections.overview"),
      metrics: [
        {
          id: "municipalityCount",
          label: t("explorePage.comparison.metrics.municipalityCount"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "municipalityCount",
              translate("companies.card.noData"),
            ),
        },
      ],
    },
  ];
}

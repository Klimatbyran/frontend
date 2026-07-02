import type { TFunction } from "i18next";
import type { ComparisonSection } from "./types";
import {
  createClimateTargetSection,
  createEmissionsSection,
  getDetailValue,
} from "./shared";

export function getNationSections(t: TFunction): ComparisonSection[] {
  return [
    createClimateTargetSection(t, "detailPage.meetsParisGoal"),
    createEmissionsSection(t, "detailPage.changeSince2015", [
      {
        id: "emissionsPerCapita",
        label: t("europe.list.kpis.emissionsPerCapita.label"),
        getValue: (item, translate) =>
          getDetailValue(
            item,
            "emissionsPerCapita",
            translate("companies.card.noData"),
            {
              colorClass: "text-orange-2",
              unit: item.comparisonDetails?.emissionsPerCapitaUnit,
            },
          ),
      },
    ]),
  ];
}

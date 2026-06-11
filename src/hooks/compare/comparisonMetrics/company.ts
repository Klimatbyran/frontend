import type { TFunction } from "i18next";
import type { ComparisonSection } from "./types";
import {
  createClimateTargetSection,
  createEmissionsSection,
  createScopeEmissionsMetric,
  getDetailValue,
} from "./shared";

export function getCompanySections(t: TFunction): ComparisonSection[] {
  return [
    createClimateTargetSection(t, "companies.card.meetsParis"),
    createEmissionsSection(t, "companies.card.emissionsChangeRate", [
      createScopeEmissionsMetric(
        t,
        "scope1",
        "emissionsBreakdown.scope1",
        "scope1Emissions",
      ),
      createScopeEmissionsMetric(
        t,
        "scope2",
        "emissionsBreakdown.scope2",
        "scope2Emissions",
      ),
      createScopeEmissionsMetric(
        t,
        "scope3",
        "emissionsBreakdown.scope3",
        "scope3Emissions",
      ),
    ]),
    {
      id: "companyOverview",
      label: t("explorePage.comparison.sections.companyOverview"),
      metrics: [
        {
          id: "turnover",
          label: t("companies.overview.turnover"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "turnover",
              translate("companies.overview.notReported"),
              {
                isAIGenerated: item.comparisonDetails?.turnoverIsAIGenerated,
              },
            ),
        },
        {
          id: "employees",
          label: t("companies.overview.employees"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "employees",
              translate("companies.overview.notReported"),
              {
                isAIGenerated: item.comparisonDetails?.employeesIsAIGenerated,
              },
            ),
        },
      ],
    },
    {
      id: "reporting",
      label: t("explorePage.comparison.sections.reporting"),
      metrics: [
        {
          id: "reportingSince",
          label: t("companies.card.reportingSince"),
          getValue: (item, translate) => ({
            text:
              item.baseYear != null
                ? String(item.baseYear)
                : translate("unknown"),
            colorClass: "text-white",
          }),
        },
        {
          id: "scope3Coverage",
          label: t("companies.card.scope3Coverage"),
          getValue: (item, translate) => ({
            text: item.hasScope3Coverage ? translate("yes") : translate("no"),
            colorClass: item.hasScope3Coverage ? "text-green-3" : "text-pink-3",
            displayAsBadge: true,
          }),
        },
      ],
    },
  ];
}

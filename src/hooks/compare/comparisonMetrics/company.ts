import type { TFunction } from "i18next";
import type { ComparisonSection } from "./types";
import {
  createClimateTargetSection,
  createCompanyOverviewSection,
  createCompanyReportingSection,
  createEmissionsSection,
  createScopeEmissionsMetric,
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
    createCompanyOverviewSection(t),
    createCompanyReportingSection(t),
  ];
}

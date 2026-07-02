import type { TFunction } from "i18next";
import { getComparisonSections } from "../index";

const t = ((key: string) => key) as TFunction;

function sectionIds(variant: "company" | "municipality" | "region" | "nation") {
  return getComparisonSections(variant, t).map((section) => section.id);
}

function metricIds(variant: "company" | "municipality" | "region" | "nation") {
  return getComparisonSections(variant, t).flatMap((section) =>
    section.metrics.map((metric) => metric.id),
  );
}

describe("getComparisonSections", () => {
  it("returns company-specific sections and metrics", () => {
    expect(sectionIds("company")).toEqual([
      "climateTarget",
      "emissions",
      "companyOverview",
      "reporting",
    ]);
    expect(metricIds("company")).toEqual(
      expect.arrayContaining([
        "meetsParis",
        "totalEmissions",
        "changeRate",
        "scope1",
        "scope2",
        "scope3",
        "turnover",
        "employees",
        "reportingSince",
        "scope3Coverage",
      ]),
    );
  });

  it("returns municipality-specific sections and metrics", () => {
    expect(sectionIds("municipality")).toEqual([
      "climateTarget",
      "emissions",
      "sustainableTransport",
      "procurement",
      "politics",
      "climatePlan",
    ]);
    expect(metricIds("municipality")).toEqual(
      expect.arrayContaining([
        "consumptionEmissions",
        "electricCarChange",
        "procurementRequirements",
        "hasClimatePlan",
      ]),
    );
  });

  it("returns region-specific sections and metrics", () => {
    expect(sectionIds("region")).toEqual([
      "climateTarget",
      "emissions",
      "overview",
    ]);
    expect(metricIds("region")).toEqual(
      expect.arrayContaining([
        "meetsParis",
        "totalEmissions",
        "changeRate",
        "municipalityCount",
      ]),
    );
  });

  it("returns nation-specific sections and metrics", () => {
    expect(sectionIds("nation")).toEqual(["climateTarget", "emissions"]);
    expect(metricIds("nation")).toEqual(
      expect.arrayContaining([
        "meetsParis",
        "totalEmissions",
        "changeRate",
        "emissionsPerCapita",
      ]),
    );
  });
});

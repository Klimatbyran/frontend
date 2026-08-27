import { describe, expect, it } from "vitest";
import {
  getTopParisEmissionsCompanies,
  getParisEmissionsBreakdown,
  getParisEmissionsDistributionStats,
  getParisEmitterListsBarMax,
} from "@/utils/insights/meetsParisChartData";
import type { CompanyWithKPIs } from "@/types/company";

function createCompany(
  id: string,
  name: string,
  meetsParis: boolean | null,
  emissions: number,
): CompanyWithKPIs {
  return {
    id,
    name,
    wikidataId: `Q${id}`,
    meetsParis,
    reportingPeriods: [
      {
        endDate: "2024-12-31",
        emissions: { calculatedTotalEmissions: emissions },
      },
    ],
    metrics: { emissionsReduction: 0, displayReduction: "0" },
  } as CompanyWithKPIs;
}

describe("getTopParisEmissionsCompanies", () => {
  const companies = [
    createCompany("1", "Big Yes", true, 3000),
    createCompany("2", "Small Yes", true, 1000),
    createCompany("3", "Big No", false, 5000),
    createCompany("4", "Small No", false, 2000),
  ];

  it("returns largest emitters meeting Paris sorted by emissions", () => {
    const { entities } = getTopParisEmissionsCompanies(companies, true);

    expect(entities.map((company) => company.name)).toEqual([
      "Big Yes",
      "Small Yes",
    ]);
    expect(entities[0].rankedEmissions).toBeGreaterThan(
      entities[1].rankedEmissions,
    );
  });

  it("returns largest emitters missing Paris sorted by emissions", () => {
    const { entities } = getTopParisEmissionsCompanies(companies, false);

    expect(entities.map((company) => company.name)).toEqual([
      "Big No",
      "Small No",
    ]);
  });
});

describe("getParisEmitterListsBarMax", () => {
  it("uses the largest ranked value across both Paris lists", () => {
    const companies = [
      createCompany("1", "Big Yes", true, 1000),
      createCompany("2", "Small Yes", true, 500),
      createCompany("3", "Big No", false, 5000),
      createCompany("4", "Small No", false, 2000),
    ];

    const { entities: missingEntities } = getTopParisEmissionsCompanies(
      companies,
      false,
    );
    const { entities: meetingEntities } = getTopParisEmissionsCompanies(
      companies,
      true,
    );

    expect(getParisEmitterListsBarMax(companies)).toBe(
      Math.max(
        ...missingEntities.map((entity) => entity.rankedEmissions),
        ...meetingEntities.map((entity) => entity.rankedEmissions),
      ),
    );
  });
});

describe("getParisEmissionsBreakdown", () => {
  it("groups emissions by Paris status including unknown", () => {
    const companies = [
      createCompany("1", "Yes Co", true, 3000),
      createCompany("2", "No Co", false, 5000),
      createCompany("3", "Unknown Co", null, 2000),
      createCompany("4", "No Emissions", true, 0),
    ];

    const { segments, totalEmissions, unitScale } =
      getParisEmissionsBreakdown(companies);

    expect(segments).toEqual([
      { status: "no", emissions: 5000, companyCount: 1 },
      { status: "yes", emissions: 3000, companyCount: 1 },
      { status: "unknown", emissions: 2000, companyCount: 1 },
    ]);
    expect(totalEmissions).toBe(10000);
    expect(unitScale.divisor).toBeLessThanOrEqual(1_000_000);
  });

  it("omits empty status groups", () => {
    const companies = [createCompany("1", "Yes Co", true, 3000)];

    const { segments } = getParisEmissionsBreakdown(companies);

    expect(segments).toEqual([
      { status: "yes", emissions: 3000, companyCount: 1 },
    ]);
  });

  it("can exclude unknown Paris status", () => {
    const companies = [
      createCompany("1", "Yes Co", true, 3000),
      createCompany("2", "No Co", false, 5000),
      createCompany("3", "Unknown Co", null, 2000),
    ];

    const { segments, totalEmissions } = getParisEmissionsBreakdown(companies, {
      excludeUnknown: true,
    });

    expect(segments).toEqual([
      { status: "no", emissions: 5000, companyCount: 1 },
      { status: "yes", emissions: 3000, companyCount: 1 },
    ]);
    expect(totalEmissions).toBe(8000);
  });
});

describe("getParisEmissionsDistributionStats", () => {
  it("returns yes/no emissions with company counts", () => {
    const companies = [
      createCompany("1", "Yes Co", true, 3000),
      createCompany("2", "Yes Co 2", true, 1000),
      createCompany("3", "No Co", false, 5000),
      createCompany("4", "Unknown Co", null, 2000),
    ];

    const stats = getParisEmissionsDistributionStats(companies, (key) =>
      key === "header.companies" ? "companies" : key,
    );

    expect(stats).toHaveLength(2);
    expect(stats.map((stat) => stat.count)).toEqual([5000, 4000]);
    expect(stats[0].secondaryDisplayValue).toBe("1 companies");
    expect(stats[1].secondaryDisplayValue).toBe("2 companies");
    expect(stats.every((stat) => stat.displayValue.length > 0)).toBe(true);
    expect(stats.some((stat) => stat.label.includes("unknown"))).toBe(false);
  });
});

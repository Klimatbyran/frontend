import { describe, expect, it } from "vitest";
import {
  getTopParisEmissionsCompanies,
  getParisEmissionsBreakdown,
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
      { status: "yes", emissions: 3000 },
      { status: "no", emissions: 5000 },
      { status: "unknown", emissions: 2000 },
    ]);
    expect(totalEmissions).toBe(10000);
    expect(unitScale.divisor).toBeLessThanOrEqual(1_000_000);
  });

  it("omits empty status groups", () => {
    const companies = [createCompany("1", "Yes Co", true, 3000)];

    const { segments } = getParisEmissionsBreakdown(companies);

    expect(segments).toEqual([{ status: "yes", emissions: 3000 }]);
  });
});

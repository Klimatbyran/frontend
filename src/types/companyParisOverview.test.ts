import { describe, expect, it } from "vitest";
import { mapParisOverviewToCompanyWithKPIs } from "@/types/companyParisOverview";

describe("mapParisOverviewToCompanyWithKPIs", () => {
  it("maps overview fields into a company shape used by the chart", () => {
    const company = mapParisOverviewToCompanyWithKPIs({
      id: "company-id",
      wikidataId: "Q123",
      name: "Example AB",
      meetsParis: true,
      emissions: 1000,
      emissionsYear: 2024,
      sectorCode: "15",
      tags: ["sweden"],
    });

    expect(company).toMatchObject({
      id: "company-id",
      wikidataId: "Q123",
      name: "Example AB",
      meetsParis: true,
      tags: ["sweden"],
      industry: { industryGics: { sectorCode: "15" } },
      reportingPeriods: [
        {
          endDate: "2024-12-31",
          emissions: { calculatedTotalEmissions: 1000 },
        },
      ],
    });
  });
});

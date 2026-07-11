import { describe, expect, it } from "vitest";
import {
  mapCompanyListItemToParisOverview,
  mapParisOverviewToCompanyWithKPIs,
} from "@/types/companyParisOverview";
import type { CompanyListItem } from "@/types/company";

describe("mapCompanyListItemToParisOverview", () => {
  it("derives Paris overview fields from a full company list item", () => {
    const company = {
      id: "company-id",
      name: "Example AB",
      wikidataId: "Q123",
      tags: ["sweden"],
      futureEmissionsTrendSlope: -20,
      industry: { industryGics: { sectorCode: "15" } },
      reportingPeriods: [
        {
          endDate: "2024-12-31",
          emissions: { calculatedTotalEmissions: 1000 },
        },
      ],
    } as CompanyListItem;

    expect(mapCompanyListItemToParisOverview(company)).toMatchObject({
      id: "company-id",
      wikidataId: "Q123",
      meetsParis: expect.any(Boolean),
      emissions: 1000,
      emissionsYear: 2024,
      sectorCode: "15",
      tags: ["sweden"],
    });
  });
});

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

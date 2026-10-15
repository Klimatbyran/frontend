import { describe, expect, it } from "vitest";
import { exploreCompanyFromPageDetail } from "./exploreCompanyFromPageDetail";
import type {
  PageCompanyEmissionsHistory,
  PageCompanyHeader,
  PageCompanyOverview,
} from "@/types/pages";

const header: PageCompanyHeader = {
  id: "uuid-1",
  wikidataId: "Q1",
  name: "Acme",
  logoUrl: null,
  descriptions: [],
  sectorCode: "20",
  industryGroupCode: "2010",
  baseYear: 2019,
  availableYears: [2024, 2023],
};

const overview: PageCompanyOverview = {
  year: 2024,
  meetsParis: true,
  totalEmissions: 1000,
  emissionsChangeLastTwoYears: -10,
  emissionsChangeAbsolute: -100,
  emissionsChangeStatus: "decreased",
  emissionsIsAIGenerated: false,
  changeRateIsAIGenerated: false,
  turnover: 2_000_000,
  turnoverCurrency: "SEK",
  turnoverIsAIGenerated: false,
  employees: 50,
  employeesIsAIGenerated: false,
  reportURL: null,
  sectorCode: "20",
  industryGroupCode: "2010",
  previousYear: 2023,
};

const history: PageCompanyEmissionsHistory = {
  baseYear: 2019,
  futureEmissionsTrendSlope: null,
  sectorCode: "20",
  periods: [
    {
      year: 2023,
      total: 1100,
      isAIGenerated: false,
      scope1: { value: 10, isAIGenerated: false },
      scope2: { value: 20, isAIGenerated: false },
      scope3: { value: 1070, isAIGenerated: false },
      scope3Categories: [],
    },
    {
      year: 2024,
      total: 1000,
      isAIGenerated: false,
      scope1: { value: 11, isAIGenerated: false },
      scope2: { value: 22, isAIGenerated: false },
      scope3: { value: 967, isAIGenerated: false },
      scope3Categories: [{ category: 1, value: 100, isAIGenerated: false }],
    },
  ],
  trend: null,
  projections: [],
};

describe("exploreCompanyFromPageDetail", () => {
  it("maps header, overview, and latest history scopes", () => {
    expect(
      exploreCompanyFromPageDetail(header, overview, history),
    ).toMatchObject({
      id: "uuid-1",
      wikidataId: "Q1",
      name: "Acme",
      latestYear: 2024,
      latestTotalEmissions: 1000,
      emissionsChangeLastTwoYears: -10,
      meetsParis: true,
      hasScope3Coverage: true,
      isFinancialsSector: false,
      scope1Emissions: 11,
      scope2Emissions: 22,
      scope3Emissions: 967,
      turnover: 2_000_000,
      employees: 50,
    });
  });

  it("marks financials from sector code 40", () => {
    expect(
      exploreCompanyFromPageDetail(
        { ...header, sectorCode: "40" },
        { ...overview, sectorCode: "40" },
        null,
      ).isFinancialsSector,
    ).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import type { PageExploreCompany } from "@/types/pages";
import { filterAndSortCompanies } from "./companyFilterUtils";

function company(
  name: string,
  options: {
    sectorCode?: string | null;
    industryGroupCode?: string | null;
    emissions?: number | null;
    change?: number | null;
  } = {},
): PageExploreCompany {
  return {
    id: name,
    name,
    tags: [],
    sectorCode: options.sectorCode ?? null,
    industryGroupCode: options.industryGroupCode ?? null,
    baseYear: null,
    meetsParis: null,
    emissionsChangeFromBaseYear: null,
    latestYear: options.emissions == null ? null : 2024,
    latestTotalEmissions: options.emissions ?? null,
    emissionsChangeLastTwoYears: options.change ?? null,
    emissionsIsAIGenerated: false,
    changeRateIsAIGenerated: false,
    hasScope3Coverage: false,
    isFinancialsSector: false,
    scope1Emissions: null,
    scope2Emissions: null,
    scope3Emissions: null,
    turnover: null,
    turnoverCurrency: null,
    turnoverIsAIGenerated: false,
    employees: null,
    employeesIsAIGenerated: false,
  };
}

const sectorNames = {
  "30": "Consumer Staples",
  "20": "Industrials",
};

const industryGroupNames = {
  "3020": "Food, Beverage & Tobacco",
  "2010": "Capital Goods",
};

function run(
  companies: PageExploreCompany[],
  overrides: Partial<Parameters<typeof filterAndSortCompanies>[1]> = {},
) {
  return filterAndSortCompanies(companies, {
    sectors: ["all"],
    industryGroups: ["all"],
    searchQuery: "",
    meetsParisFilter: "all",
    sortBy: "name",
    sortDirection: "asc",
    sectorNames,
    industryGroupNames,
    currentLanguage: "en",
    ...overrides,
  }).map((item) => item.name);
}

describe("filterAndSortCompanies", () => {
  const companies = [
    company("Naturgy Energy Group, S.A.", {
      sectorCode: "20",
      industryGroupCode: "2010",
      emissions: 10,
    }),
    company("Kroger", {
      sectorCode: "30",
      industryGroupCode: "3020",
      emissions: 50,
    }),
    company("Series *A", {
      sectorCode: "20",
      industryGroupCode: "2010",
      emissions: 5,
    }),
    company("Enity Holding AB (publ)", {
      sectorCode: "20",
      industryGroupCode: "2010",
      emissions: 1,
    }),
    company("Volvo", {
      sectorCode: "20",
      industryGroupCode: "2010",
      emissions: 20,
    }),
  ];

  it("keeps sorting and filtering working when the search has regex characters", () => {
    expect(() => run(companies, { searchQuery: "*" })).not.toThrow();
    expect(run(companies, { searchQuery: "*" })).toEqual(["Series *A"]);

    expect(() => run(companies, { searchQuery: "AB (" })).not.toThrow();
    expect(run(companies, { searchQuery: "(publ)" })).toEqual([
      "Enity Holding AB (publ)",
    ]);

    expect(run(companies, { searchQuery: "S.A." })).toEqual([
      "Naturgy Energy Group, S.A.",
    ]);
  });

  it("filters by industry group", () => {
    expect(run(companies, { industryGroups: ["3020"] })).toEqual(["Kroger"]);
  });

  it("sorts missing total emissions last, and keeps a reported zero", () => {
    const ranked = [
      company("No data"),
      company("Zero", { emissions: 0 }),
      company("Small", { emissions: 1 }),
      company("Large", { emissions: 40 }),
    ];

    expect(
      run(ranked, { sortBy: "total_emissions", sortDirection: "desc" }),
    ).toEqual(["Large", "Small", "Zero", "No data"]);
    expect(
      run(ranked, { sortBy: "total_emissions", sortDirection: "asc" }),
    ).toEqual(["Zero", "Small", "Large", "No data"]);
  });

  it("sorts total emissions from high to low", () => {
    expect(
      run(companies, { sortBy: "total_emissions", sortDirection: "desc" }),
    ).toEqual([
      "Kroger",
      "Volvo",
      "Naturgy Energy Group, S.A.",
      "Series *A",
      "Enity Holding AB (publ)",
    ]);
  });

  it("sorts names with the Swedish alphabet", () => {
    const swedish = [
      company("Öresund"),
      company("Volvo"),
      company("Åhléns"),
      company("Arla"),
      company("Zet"),
    ];

    expect(
      run(swedish, {
        sortBy: "name",
        sortDirection: "asc",
        currentLanguage: "sv",
      }),
    ).toEqual(["Arla", "Volvo", "Zet", "Åhléns", "Öresund"]);

    expect(
      run(swedish, {
        sortBy: "name",
        sortDirection: "desc",
        currentLanguage: "sv",
      }),
    ).toEqual(["Öresund", "Åhléns", "Zet", "Volvo", "Arla"]);
  });

  it("sorts the emissions change shown on the card, with missing values last", () => {
    const ranked = [
      company("No data"),
      company("Api increase", { emissions: 100, change: 25 }),
      company("Flat", { emissions: 80, change: 0 }),
      company("Cut", { emissions: 80, change: -20 }),
    ];

    expect(
      run(ranked, {
        sortBy: "emissions_reduction",
        sortDirection: "asc",
      }),
    ).toEqual(["Cut", "Flat", "Api increase", "No data"]);
  });
});

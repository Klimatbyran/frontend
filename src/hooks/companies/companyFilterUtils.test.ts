import { describe, expect, it } from "vitest";
import type { RankedCompany } from "@/types/company";
import { filterAndSortCompanies } from "./companyFilterUtils";

function company(
  name: string,
  options: {
    sectorCode?: string;
    groupCode?: string;
    emissions?: number | null;
    previousEmissions?: number | null;
    change?: number | null;
  } = {},
): RankedCompany {
  const reportingPeriods = [];
  if (options.emissions !== undefined || options.change !== undefined) {
    reportingPeriods.push({
      endDate: "2024-12-31",
      emissions:
        options.emissions === undefined
          ? null
          : { calculatedTotalEmissions: options.emissions },
      emissionsChangeLastTwoYears:
        options.change === undefined
          ? undefined
          : { absolute: options.change, adjusted: options.change },
    });
  }
  if (options.previousEmissions !== undefined) {
    reportingPeriods.push({
      endDate: "2023-12-31",
      emissions: { calculatedTotalEmissions: options.previousEmissions },
    });
  }

  return {
    id: name,
    name,
    tags: [],
    industry:
      options.sectorCode || options.groupCode
        ? {
            industryGics: {
              sectorCode: options.sectorCode ?? "",
              groupCode: options.groupCode ?? "",
            },
          }
        : null,
    reportingPeriods,
  } as unknown as RankedCompany;
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
  companies: RankedCompany[],
  overrides: Partial<Parameters<typeof filterAndSortCompanies>[1]> = {},
) {
  return filterAndSortCompanies(companies, {
    sectors: ["all"],
    industryGroups: ["all"],
    selectedCountries: [],
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
      groupCode: "2010",
      emissions: 10,
    }),
    company("Kroger", {
      sectorCode: "30",
      groupCode: "3020",
      emissions: 50,
    }),
    company("Series *A", { sectorCode: "20", groupCode: "2010", emissions: 5 }),
    company("Enity Holding AB (publ)", {
      sectorCode: "20",
      groupCode: "2010",
      emissions: 1,
    }),
    company("Volvo", { sectorCode: "20", groupCode: "2010", emissions: 20 }),
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

  it("sorts emissions change from the same periods shown on the card, with missing values last", () => {
    const ranked = [
      company("No data"),
      company("Api increase", { emissions: 100, change: 25 }),
      company("Calculated cut", {
        emissions: 80,
        previousEmissions: 100,
        change: null,
      }),
    ];

    expect(
      run(ranked, {
        sortBy: "emissions_reduction",
        sortDirection: "asc",
      }),
    ).toEqual(["Calculated cut", "Api increase", "No data"]);
  });
});

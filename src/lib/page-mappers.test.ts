import { describe, expect, it } from "vitest";
import { filterAndSortCompanies } from "@/hooks/companies/companyFilterUtils";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import {
  mapCompaniesOverviewItem,
  mapExploreCompany,
  mapExploreMunicipality,
  mapExploreRegion,
  mapSectorCompany,
  getPageFields,
} from "@/lib/page-mappers";
import type { RankedCompany } from "@/types/company";
import type {
  CompanySector,
  IndustryGroupOption,
} from "@/lib/constants/sectors";

const filterParams = {
  sectors: ["all"] as CompanySector[],
  industryGroups: ["all"] as IndustryGroupOption[],
  selectedCountries: [],
  searchQuery: "",
  sortBy: "name" as const,
  sortDirection: "asc" as const,
  sectorNames: {},
  industryGroupNames: {},
  currentLanguage: "sv" as const,
};

describe("page mappers", () => {
  it("leaves industry unset when sector and group codes are missing", () => {
    const company = mapExploreCompany({
      id: "22222222-2222-2222-2222-222222222222",
      name: "No sector",
      tags: [],
      sectorCode: null,
      industryGroupCode: null,
      baseYear: null,
      meetsParis: null,
      emissionsChangeFromBaseYear: null,
      latestYear: null,
      latestTotalEmissions: null,
      emissionsChangeLastTwoYears: null,
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
    });

    expect(company.industry).toBeNull();
  });

  it("keeps overview KPI fields from the lightweight payload", () => {
    const company = mapCompaniesOverviewItem({
      id: "11111111-1111-1111-1111-111111111111",
      wikidataId: "Q1",
      name: "Example AB",
      logoUrl: null,
      tags: ["sweden"],
      sectorCode: "15",
      industryGroupCode: "1510",
      baseYear: 2015,
      meetsParis: true,
      emissionsChangeFromBaseYear: -12.5,
      latestYear: 2024,
      latestTotalEmissions: 1000,
    });

    const enriched = enrichCompanyWithKPIs(company);
    expect(enriched.meetsParis).toBe(true);
    expect(enriched.emissionsChangeFromBaseYear).toBe(-12.5);
    expect(enriched.industry?.industryGics?.sectorCode).toBe("15");
    expect(enriched.baseYear?.year).toBe(2015);
  });

  it("sorts and filters explore companies with precomputed fields", () => {
    const aligned = mapExploreCompany({
      id: "11111111-1111-1111-1111-111111111111",
      name: "Aligned",
      tags: ["sweden"],
      sectorCode: "15",
      industryGroupCode: "1510",
      baseYear: 2015,
      meetsParis: true,
      emissionsChangeFromBaseYear: -10,
      latestYear: 2024,
      latestTotalEmissions: 50,
      emissionsChangeLastTwoYears: -4,
      emissionsIsAIGenerated: false,
      changeRateIsAIGenerated: true,
      hasScope3Coverage: true,
      isFinancialsSector: false,
      scope1Emissions: 10,
      scope2Emissions: 20,
      scope3Emissions: 20,
      turnover: 1_000_000,
      turnoverCurrency: "SEK",
      turnoverIsAIGenerated: false,
      employees: 12,
      employeesIsAIGenerated: false,
    });
    const missing = mapExploreCompany({
      id: "22222222-2222-2222-2222-222222222222",
      name: "Missing",
      tags: [],
      sectorCode: null,
      industryGroupCode: null,
      baseYear: null,
      meetsParis: null,
      emissionsChangeFromBaseYear: null,
      latestYear: null,
      latestTotalEmissions: null,
      emissionsChangeLastTwoYears: null,
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
    });

    const filtered = filterAndSortCompanies([missing, aligned], {
      ...filterParams,
      sectors: ["15"] as CompanySector[],
      meetsParisFilter: "yes",
      sortBy: "total_emissions",
      sortDirection: "desc",
    });

    expect(filtered.map((company) => company.name)).toEqual(["Aligned"]);
    expect(getPageFields(aligned)?.emissionsChangeLastTwoYears).toBe(-4);
  });

  it("builds sector chart periods from yearly scope totals", () => {
    const company = mapSectorCompany({
      id: "11111111-1111-1111-1111-111111111111",
      wikidataId: "Q9",
      name: "Sector Co",
      tags: ["sweden"],
      sectorCode: "10",
      industryGroupCode: "1010",
      periods: [
        { year: 2022, scope1: 1, scope2: 2, scope3: 3, total: 6 },
        { year: 2024, scope1: 4, scope2: null, scope3: 1, total: 5 },
      ],
    });

    expect(company.reportingPeriods[0]?.endDate).toBe("2024-12-31");
    expect(
      company.reportingPeriods[0]?.emissions?.calculatedTotalEmissions,
    ).toBe(5);
    expect(company.reportingPeriods[1]?.endDate).toBe("2022-12-31");
    expect(getPageFields(company)).toBeUndefined();
  });

  it("keeps the latest municipality and region figures without a time series", () => {
    const municipality = mapExploreMunicipality({
      name: "Ale",
      region: "Västra Götaland",
      logoUrl: null,
      lastYear: 2023,
      lastYearEmissions: 42,
      historicalEmissionChangePercent: -8,
      meetsParis: true,
      climatePlan: true,
      climatePlanYear: 2020,
      totalConsumptionEmission: 3,
      electricCarChangePercent: 1,
      electricVehiclePerChargePoints: 4,
      bicycleMetrePerCapita: 2,
      procurementScore: 2,
      politicalRule: ["S"],
      politicalKSO: "S",
    });
    const region = mapExploreRegion({
      name: "Stockholms län",
      logoUrl: null,
      lastYear: 2023,
      lastYearEmissions: 99,
      historicalEmissionChangePercent: -1,
      meetsParis: false,
      municipalityCount: 1,
      municipalities: ["Stockholm"],
    });

    expect(municipality.emissions).toEqual([{ year: 2023, value: 42 }]);
    expect(municipality.meetsParisGoal).toBe(true);
    expect(region.municipalities).toEqual(["Stockholm"]);
    expect(region.lastYearEmissions).toBe(99);
  });

  it("still calculates Paris status for companies that are not page-backed", () => {
    const company = {
      name: "Full",
      reportingPeriods: [],
      metrics: { emissionsReduction: 0, displayReduction: "0.0" },
    } as RankedCompany;

    expect(enrichCompanyWithKPIs(company).meetsParis).toBeNull();
  });
});

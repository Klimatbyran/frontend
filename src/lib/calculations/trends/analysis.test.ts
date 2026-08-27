import { describe, expect, it } from "vitest";
import { calculateTrendline } from "./analysis";
import { calculateMeetsParis } from "./meetsParis";
import type { CompanyForTrendAnalysis } from "./types";

function createCompany(
  overrides: Partial<CompanyForTrendAnalysis> = {},
): CompanyForTrendAnalysis {
  return {
    id: "1",
    name: "Test Co",
    wikidataId: "Q1",
    futureEmissionsTrendSlope: -100,
    reportingPeriods: [
      {
        endDate: "2024-12-31",
        emissions: { calculatedTotalEmissions: 1000 },
      },
    ],
    ...overrides,
  } as CompanyForTrendAnalysis;
}

describe("calculateTrendline", () => {
  it("returns null when the API slope is missing", () => {
    expect(
      calculateTrendline(createCompany({ futureEmissionsTrendSlope: null })),
    ).toBeNull();
    expect(
      calculateTrendline(
        createCompany({ futureEmissionsTrendSlope: undefined }),
      ),
    ).toBeNull();
  });

  it("returns analysis when slope and emissions data exist", () => {
    const result = calculateTrendline(createCompany());

    expect(result).toMatchObject({
      method: "api-provided",
      cleanDataPoints: 1,
      trendDirection: "decreasing",
      yearlyPercentageChange: -10,
      coefficients: { slope: -100, intercept: 1000 + 100 * 2024 },
    });
  });

  it.each([
    {
      name: "empty reporting periods",
      company: createCompany({ reportingPeriods: [] }),
    },
    {
      name: "all emissions null",
      company: createCompany({
        reportingPeriods: [
          { endDate: "2024-12-31", emissions: null },
          {
            endDate: "2023-12-31",
            emissions: { calculatedTotalEmissions: null },
          },
        ],
      }),
    },
    {
      name: "all periods before baseYear",
      company: createCompany({
        baseYear: { year: 2025 },
        reportingPeriods: [
          {
            endDate: "2024-12-31",
            emissions: { calculatedTotalEmissions: 1000 },
          },
          {
            endDate: "2023-12-31",
            emissions: { calculatedTotalEmissions: 1100 },
          },
        ],
      }),
    },
  ])("returns null when slope is stored but $name", ({ company }) => {
    expect(calculateTrendline(company)).toBeNull();
  });

  it("does not throw when mapping a list that includes a company with no usable emissions", () => {
    const companies = [
      createCompany({ id: "ok" }),
      createCompany({
        id: "broken",
        reportingPeriods: [],
      }),
      createCompany({
        id: "before-base",
        baseYear: { year: 2030 },
        reportingPeriods: [
          {
            endDate: "2020-12-31",
            emissions: { calculatedTotalEmissions: 500 },
          },
        ],
      }),
    ];

    expect(() =>
      companies.map((company) => {
        const trendAnalysis = calculateTrendline(company);
        return trendAnalysis
          ? calculateMeetsParis(company, trendAnalysis)
          : null;
      }),
    ).not.toThrow();
  });
});

import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import {
  buildCompanyKpiCards,
  type CompanyKpiSubject,
} from "./companyKpiCards";

const t = ((key: string) => key) as TFunction;

function subject(
  overrides: Partial<CompanyKpiSubject> = {},
): CompanyKpiSubject {
  return {
    wikidataId: "Q1",
    meetsParis: true,
    yearOverYearChange: -10,
    totalEmissions: 100,
    periodYear: "2023",
    totalEmissionsAi: false,
    yearOverYearAi: false,
    ...overrides,
  };
}

function peer(
  wikidataId: string,
  periods: Array<{
    endDate: string;
    emissions: number | null;
  }>,
  meetsParis: boolean | null = false,
) {
  return {
    wikidataId,
    meetsParis,
    reportingPeriods: periods.map((period) => ({
      endDate: period.endDate,
      emissions: { calculatedTotalEmissions: period.emissions },
    })),
  };
}

describe("buildCompanyKpiCards", () => {
  const peers = [
    peer(
      "Q1",
      [
        { endDate: "2023-12-31", emissions: 100 },
        { endDate: "2022-12-31", emissions: 200 },
      ],
      true,
    ),
    peer("Q2", [
      { endDate: "2023-12-31", emissions: 50 },
      { endDate: "2022-12-31", emissions: 40 },
    ]),
    peer("Q3", [{ endDate: "2021-12-31", emissions: 10 }]),
  ];

  it("ranks the shown year against companies that reported that year", () => {
    const cards = buildCompanyKpiCards(
      subject(),
      peers,
      "2023",
      "ready",
      t,
      "en",
    );
    const emissions = cards.find((card) => card.id === "totalEmissions");
    const change = cards.find((card) => card.id === "yearOverYear");

    expect(emissions?.scopes[0].placement).toMatchObject({
      rank: 2,
      total: 2,
    });
    expect(change?.scopes[0].placement).toMatchObject({ rank: 1, total: 2 });
    expect(cards[0].scopes[0].label).toBe(
      "detailPage.kpiPlacement.allCompanies",
    );
  });

  it("uses each company's own latest report when the page is on latest", () => {
    const cards = buildCompanyKpiCards(
      subject({ totalEmissions: 100, yearOverYearChange: -50 }),
      peers,
      "latest",
      "ready",
      t,
      "en",
    );
    const emissions = cards.find((card) => card.id === "totalEmissions");

    expect(emissions?.scopes[0].placement).toMatchObject({
      rank: 3,
      total: 3,
    });
  });
});

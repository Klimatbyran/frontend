import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import type { Municipality } from "@/types/municipality";
import { buildMunicipalityKpiCards } from "./municipalityKpiCards";

const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as TFunction;

function municipality(
  overrides: Partial<Municipality> & Pick<Municipality, "name" | "region">,
): Municipality {
  return {
    logoUrl: null,
    meetsParisGoal: false,
    totalTrend: 1,
    totalCarbonLaw: 1,
    historicalEmissionChangePercent: 0,
    climatePlan: false,
    climatePlanYear: null,
    climatePlanComment: null,
    climatePlanLink: null,
    electricVehiclePerChargePoints: 5,
    bicycleMetrePerCapita: 1,
    procurementScore: 0,
    procurementLink: null,
    totalConsumptionEmission: 5,
    electricCarChangePercent: 1,
    politicalRule: [],
    politicalKSO: "",
    emissions: [{ year: 2023, value: 100 }],
    approximatedHistoricalEmission: [],
    trend: [],
    ...overrides,
  };
}

describe("buildMunicipalityKpiCards", () => {
  const stockholm = municipality({
    name: "Stockholm",
    region: "Stockholm",
    historicalEmissionChangePercent: -20,
    meetsParisGoal: true,
    // Detail payloads keep the API's string years; the list hook stores numbers.
    emissions: [{ year: "2023" as unknown as number, value: 400 }],
  });
  const peers = [
    stockholm,
    municipality({
      name: "Solna",
      region: "Stockholm",
      historicalEmissionChangePercent: -5,
      emissions: [{ year: 2023, value: 80 }],
    }),
    municipality({
      name: "Malmö",
      region: "Skåne",
      historicalEmissionChangePercent: -30,
      meetsParisGoal: true,
      emissions: [{ year: 2023, value: 200 }],
    }),
    municipality({
      name: "Lund",
      region: "Skåne",
      historicalEmissionChangePercent: 4,
      emissions: [{ year: 2022, value: 50 }],
    }),
  ];

  const cards = buildMunicipalityKpiCards(stockholm, peers, "ready", t, "en");
  const change = cards.find((card) => card.id === "changeSince2015");
  const emissions = cards.find((card) => card.id === "totalEmissions");

  it("places a municipality nationally and inside its own region", () => {
    expect(change?.scopes.map((scope) => scope.label)).toEqual([
      "detailPage.kpiPlacement.nationally",
      'detailPage.kpiPlacement.inRegion:{"region":"Stockholm"}',
    ]);
    expect(change?.scopes[0].placement).toMatchObject({ rank: 2, total: 4 });
    expect(change?.scopes[1].placement).toMatchObject({ rank: 1, total: 2 });
  });

  it("shows how yes, no, and stepped scores are split instead of a rank", () => {
    const paris = cards.find((card) => card.id === "meetsParis");
    const procurement = cards.find((card) => card.id === "procurement");

    expect(paris?.comparison).toBe("distribution");
    expect(paris?.distributionChart).toBe("pie");
    expect(
      cards.find((card) => card.id === "climatePlan")?.distributionChart,
    ).toBe("pie");
    expect(procurement?.distributionChart).toBeUndefined();
    expect(paris?.scopes[0].placement).toBeNull();
    expect(paris?.scopes[0].distribution).toMatchObject({
      total: 4,
      buckets: [
        { id: "yes", count: 2, active: true },
        { id: "no", count: 2, active: false },
      ],
    });
    expect(paris?.scopes[1].distribution?.buckets).toEqual([
      expect.objectContaining({ id: "yes", count: 1, active: true }),
      expect.objectContaining({ id: "no", count: 1, active: false }),
    ]);
    expect(procurement?.scopes[0].distribution?.buckets).toEqual([
      expect.objectContaining({ id: "low", count: 4, active: true }),
    ]);
  });

  it("compares total emissions for the same reported year", () => {
    expect(emissions?.scopes[0].placement).toMatchObject({
      rank: 3,
      total: 3,
    });
    expect(emissions?.scopes[1].placement).toMatchObject({
      rank: 2,
      total: 2,
    });
  });
});

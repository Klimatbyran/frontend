import { buildMunicipalityBenchmarks } from "./municipalityBenchmarks";
import type { Municipality } from "@/types/municipality";

function municipality(
  name: string,
  emissions: Municipality["emissions"],
): Municipality {
  return {
    name,
    region: "Same county",
    logoUrl: null,
    meetsParisGoal: false,
    totalTrend: 1,
    totalCarbonLaw: 1,
    historicalEmissionChangePercent: 0,
    climatePlan: false,
    climatePlanYear: null,
    climatePlanComment: null,
    climatePlanLink: null,
    electricVehiclePerChargePoints: null,
    bicycleMetrePerCapita: 0,
    procurementScore: 0,
    procurementLink: null,
    totalConsumptionEmission: 1,
    electricCarChangePercent: 0,
    politicalRule: [],
    politicalKSO: "",
    emissions,
    approximatedHistoricalEmission: [],
    trend: [],
  };
}

describe("municipality total emissions benchmark", () => {
  it("compares the year shown in the header and skips peers from another year", () => {
    const view = buildMunicipalityBenchmarks(
      municipality("Here", [{ year: 2024, value: 10 }]),
      [
        municipality("Here", [{ year: 2024, value: 10 }]),
        municipality("North", [{ year: 2024, value: 20 }]),
        municipality("South", [{ year: 2024, value: 30 }]),
        municipality("East", [{ year: 2024, value: 40 }]),
        municipality("Old", [{ year: 2023, value: 1 }]),
      ],
    );

    // Peers for 2024 are 20, 30 and 40. The median is 30.
    // Bar: 10, 20, 30, 40. This municipality is first, the median is third.
    expect(view.totalEmissions?.position).toBeCloseTo(0);
    expect(view.totalEmissions?.averagePosition).toBeCloseTo(2 / 3);
  });

  it("shows no total-emissions bar when the latest slot is empty", () => {
    const view = buildMunicipalityBenchmarks(
      municipality("Here", [{ year: 2023, value: 50 }, null]),
      [
        municipality("Here", [{ year: 2023, value: 50 }, null]),
        municipality("North", [{ year: 2024, value: 20 }]),
        municipality("South", [{ year: 2024, value: 30 }]),
        municipality("East", [{ year: 2024, value: 40 }]),
      ],
    );

    expect(view.totalEmissions).toBeNull();
  });
});

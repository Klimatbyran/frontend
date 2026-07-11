import { describe, expect, it } from "vitest";
import type { CompanyWithKPIs } from "@/types/company";
import {
  assignValueToBin,
  buildEmissionsChangeHistogram,
  buildSymmetricBins,
  chooseEmissionsChangeBinWidth,
  formatBinLabel,
} from "@/utils/visualizations/emissionsChangeHistogram";

function createCompany(
  id: string,
  name: string,
  baseYear: number,
  baselineEmissions: number,
  latestEmissions: number,
): CompanyWithKPIs {
  const changePercent =
    ((latestEmissions - baselineEmissions) / baselineEmissions) * 100;

  return {
    id,
    name,
    wikidataId: `Q${id}`,
    baseYear: { year: baseYear },
    reportingPeriods: [
      {
        startDate: `${baseYear + 5}-01-01`,
        endDate: `${baseYear + 5}-12-31`,
        emissions: { calculatedTotalEmissions: latestEmissions },
      },
      {
        startDate: `${baseYear}-01-01`,
        endDate: `${baseYear}-12-31`,
        emissions: { calculatedTotalEmissions: baselineEmissions },
      },
    ],
    emissionsChangeFromBaseYear: changePercent,
  } as CompanyWithKPIs;
}

describe("emissionsChangeHistogram", () => {
  it("chooses a readable fixed bin width for the data range", () => {
    expect(chooseEmissionsChangeBinWidth(4)).toBe(0.5);
    expect(chooseEmissionsChangeBinWidth(40)).toBe(5);
    expect(chooseEmissionsChangeBinWidth(120)).toBe(20);
  });

  it("formats evenly sized percent labels", () => {
    expect(formatBinLabel(-2, -1)).toBe("-2–-1%");
    expect(formatBinLabel(0, 0.5)).toBe("0–0.5%");
  });

  it("assigns values to evenly sized bins", () => {
    const bins = buildSymmetricBins(5, 1);
    expect(assignValueToBin(-2.4, bins).min).toBe(-3);
    expect(assignValueToBin(0, bins).min).toBe(0);
    expect(assignValueToBin(4.8, bins).max).toBe(5);
  });

  it("aggregates latest reported emissions per change bin", () => {
    const companies = [
      createCompany("1", "Alpha", 2019, 1000, 900),
      createCompany("2", "Beta", 2019, 1000, 1100),
      createCompany("3", "Gamma", 2019, 1000, 800),
    ];

    const histogram = buildEmissionsChangeHistogram(companies);

    expect(histogram).not.toBeNull();
    expect(histogram?.bins.length).toBeGreaterThan(0);

    const totalEmissions = histogram?.bins.reduce(
      (sum, bin) => sum + bin.totalEmissions,
      0,
    );
    expect(totalEmissions).toBe(900 + 1100 + 800);

    const allCompanyIds = histogram?.bins.flatMap((bin) =>
      bin.companies.map((company) => company.id),
    );
    expect(allCompanyIds).toEqual(
      expect.arrayContaining(["1", "2", "3"]),
    );
  });

  it("sizes company segments by their latest reported emissions", () => {
    const companies = [
      createCompany("1", "Large", 2019, 1000, 1100),
      {
        ...createCompany("2", "Small", 2019, 2000, 2200),
        emissionsChangeFromBaseYear: 10,
      },
    ];

    const histogram = buildEmissionsChangeHistogram(companies);
    const sharedBin = histogram?.bins.find((bin) => bin.companies.length === 2);

    expect(sharedBin).toBeDefined();
    expect(sharedBin?.companies[0].emissions).toBe(2200);
    expect(sharedBin?.companies[1].emissions).toBe(1100);
    expect(sharedBin?.totalEmissions).toBe(3300);
  });
});

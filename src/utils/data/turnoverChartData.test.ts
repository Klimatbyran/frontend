import { describe, expect, it } from "vitest";
import {
  buildDecouplingComparison,
  getBaseYearChartSettings,
  getDecouplingVerdict,
  getDisplayData,
  getTurnoverEmissionsSection,
} from "./turnoverChartData";

const completeSeries = [
  { year: 2018, total: 1000, turnover: 1_000_000 },
  { year: 2019, total: 900, turnover: 1_200_000 },
  { year: 2020, total: 800, turnover: 1_500_000 },
];

describe("turnoverChartData", () => {
  it("keeps only years with both emissions and turnover", () => {
    expect(
      getDisplayData([
        { year: 2019, total: 1000, turnover: 1_000_000 },
        { year: 2020, total: 900 },
        { year: 2021, turnover: 2_000_000 },
        { year: 2022, total: 800, turnover: 2_500_000 },
      ]),
    ).toEqual([
      { year: 2019, total: 1000, turnover: 1_000_000 },
      { year: 2022, total: 800, turnover: 2_500_000 },
    ]);
  });

  it("returns green yes when emissions intensity falls meaningfully", () => {
    expect(getDecouplingVerdict(-10)).toBe("yes");
  });

  it("returns red no when emissions intensity rises meaningfully", () => {
    expect(getDecouplingVerdict(10)).toBe("no-red");
  });

  it("returns orange no when emissions intensity is nearly unchanged", () => {
    expect(getDecouplingVerdict(2)).toBe("no-yellow");
    expect(getDecouplingVerdict(-2)).toBe("no-yellow");
    expect(getDecouplingVerdict(3)).toBe("no-yellow");
    expect(getDecouplingVerdict(-3)).toBe("no-yellow");
  });

  it("compares from base year when complete data exists there", () => {
    expect(
      buildDecouplingComparison(getDisplayData(completeSeries, 2019), 2019),
    ).toMatchObject({
      startYear: 2019,
      endYear: 2020,
      verdict: "yes",
      usedBaseYear: true,
    });
  });

  it("compares from first complete year when base year predates complete data", () => {
    expect(
      buildDecouplingComparison(
        getDisplayData(
          [
            { year: 2019, total: 1000, turnover: 1_000_000 },
            { year: 2020, total: 800, turnover: 1_500_000 },
          ],
          2018,
        ),
        2018,
      ),
    ).toMatchObject({
      startYear: 2019,
      endYear: 2020,
      verdict: "yes",
      usedBaseYear: false,
    });
  });

  it("shows all complete data when base year predates complete data", () => {
    expect(getDisplayData(completeSeries, 2017)).toEqual(completeSeries);
  });

  it("excludes complete data before base year", () => {
    expect(getDisplayData(completeSeries, 2019)).toEqual([
      { year: 2019, total: 900, turnover: 1_200_000 },
      { year: 2020, total: 800, turnover: 1_500_000 },
    ]);
  });

  it("returns null section data when fewer than two complete points", () => {
    expect(
      getTurnoverEmissionsSection([
        { year: 2018, total: 1000, turnover: 1_000_000 },
      ]),
    ).toBeNull();
  });

  it("returns chart data and comparison together", () => {
    const section = getTurnoverEmissionsSection(completeSeries, 2019);

    expect(section).toMatchObject({
      displayData: [
        { year: 2019, total: 900, turnover: 1_200_000 },
        { year: 2020, total: 800, turnover: 1_500_000 },
      ],
      comparison: {
        startYear: 2019,
        endYear: 2020,
        verdict: "yes",
      },
    });
  });

  it("hides base year reference when base year lacks complete data", () => {
    expect(
      getBaseYearChartSettings(
        [
          { year: 2019, total: 1000, turnover: 1_000_000 },
          { year: 2020, total: 800, turnover: 1_500_000 },
        ],
        2018,
      ),
    ).toEqual({
      showBaseYear: false,
      baseYear: undefined,
      isFirstYear: false,
    });
  });

  it("shows base year reference when that year has complete data", () => {
    expect(getBaseYearChartSettings(completeSeries, 2019)).toEqual({
      showBaseYear: true,
      baseYear: 2019,
      isFirstYear: false,
    });
  });
});

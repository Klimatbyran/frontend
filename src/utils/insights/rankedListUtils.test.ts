import { describe, expect, it, vi } from "vitest";
import type { KPIValue } from "@/types/rankings";
import { calculateEntityStatistics, percentShares } from "./rankedListUtils";

vi.mock("i18next", () => ({
  t: (key: string) => key,
}));

type Row = { name: string; change: number | null; meets?: boolean | null };

const numericKpi: KPIValue<Row> = {
  label: "Change",
  key: "change",
  unit: "%",
  source: "source",
  sourceUrls: [],
  description: "change",
  detailedDescription: "change",
  higherIsBetter: false,
};

const booleanKpi: KPIValue<Row> = {
  ...numericKpi,
  key: "meets",
  unit: "",
  isBoolean: true,
  higherIsBetter: true,
};

describe("calculateEntityStatistics", () => {
  it("averages numeric KPI values and leaves missing values out", () => {
    const statistics = calculateEntityStatistics(
      [
        { name: "A", change: 10 },
        { name: "B", change: null },
        { name: "C", change: 30 },
      ],
      numericKpi,
      (row) => row.change,
    );

    expect(statistics.average).toBe(20);
    expect(statistics.formattedAverage).toBe("20.0%");
    expect(statistics.nullCount).toBe(1);
    expect(statistics.aboveAverageCount).toBe(1);
    expect(statistics.belowAverageCount).toBe(1);
    expect(statistics.validData).toHaveLength(2);
  });

  it("does not treat a value exactly on the average as above or below", () => {
    const statistics = calculateEntityStatistics(
      [
        { name: "A", change: 1 },
        { name: "B", change: 2 },
        { name: "C", change: 3 },
      ],
      numericKpi,
      (row) => row.change,
    );

    expect(statistics.average).toBe(2);
    expect(statistics.aboveAverageCount).toBe(1);
    expect(statistics.belowAverageCount).toBe(1);
  });

  it("counts boolean KPIs instead of formatting a mean", () => {
    const statistics = calculateEntityStatistics(
      [
        { name: "A", change: null, meets: true },
        { name: "B", change: null, meets: false },
        { name: "C", change: null, meets: null },
      ],
      booleanKpi,
      (row) => row.meets,
    );

    expect(statistics.average).toBe(0.5);
    expect(statistics.formattedAverage).toBeUndefined();
    expect(statistics.aboveAverageCount).toBe(1);
    expect(statistics.belowAverageCount).toBe(1);
    expect(statistics.nullCount).toBe(1);
  });

  it("returns a zero average when every value is missing", () => {
    const statistics = calculateEntityStatistics(
      [{ name: "A", change: null }],
      numericKpi,
      (row) => row.change,
    );

    expect(statistics.average).toBe(0);
    expect(statistics.formattedAverage).toBe("0.0%");
    expect(statistics.validData).toHaveLength(0);
  });
});

describe("percentShares", () => {
  it("gives half-point shares to one side so the pair adds up to 100", () => {
    expect(percentShares([5, 3])).toEqual([63, 37]);
    expect(percentShares([5, 3]).reduce((sum, share) => sum + share, 0)).toBe(
      100,
    );
  });

  it("spreads a three-way split so the shares add up to 100", () => {
    const shares = percentShares([1, 1, 1]);
    expect(shares.reduce((sum, share) => sum + share, 0)).toBe(100);
    expect(shares).toEqual([34, 33, 33]);
  });

  it("keeps an empty group at 0 percent", () => {
    expect(percentShares([0, 4])).toEqual([0, 100]);
    expect(percentShares([0, 0])).toEqual([0, 0]);
  });
});

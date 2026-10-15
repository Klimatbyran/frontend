import { describe, expect, it } from "vitest";
import { buildTwoFuturesRows } from "@/components/territories/emissionsGraph/twoFuturesChartData";
import {
  isReportedEmissionsAIGenerated,
  toEmissionsHistoryDataPoint,
} from "./reportedEmissionsAI";

const currentYear = 2026;

describe("isReportedEmissionsAIGenerated", () => {
  it("is true when the total or any scope or category is AI-generated", () => {
    expect(isReportedEmissionsAIGenerated({ isAIGenerated: true })).toBe(true);
    expect(
      isReportedEmissionsAIGenerated({
        isAIGenerated: false,
        scope1: { isAIGenerated: true },
      }),
    ).toBe(true);
    expect(
      isReportedEmissionsAIGenerated({
        scope2: { isAIGenerated: true },
      }),
    ).toBe(true);
    expect(
      isReportedEmissionsAIGenerated({
        scope3: { isAIGenerated: true },
      }),
    ).toBe(true);
    expect(
      isReportedEmissionsAIGenerated({
        isAIGenerated: false,
        scope3Categories: [{ isAIGenerated: false }, { isAIGenerated: true }],
      }),
    ).toBe(true);
  });

  it("is false when no reported flag is set", () => {
    expect(isReportedEmissionsAIGenerated(undefined)).toBe(false);
    expect(isReportedEmissionsAIGenerated({ isAIGenerated: false })).toBe(
      false,
    );
    expect(
      isReportedEmissionsAIGenerated({
        isAIGenerated: false,
        scope1: { isAIGenerated: false },
        scope2: { isAIGenerated: false },
        scope3: { isAIGenerated: false },
        scope3Categories: [{ isAIGenerated: false }],
      }),
    ).toBe(false);
  });
});

describe("toEmissionsHistoryDataPoint", () => {
  it("sets the AI flag from scope data and leaves modelled years unmarked", () => {
    const rows = buildTwoFuturesRows(
      [
        toEmissionsHistoryDataPoint({
          year: 2024,
          total: 100,
          isAIGenerated: false,
          scope3Categories: [{ category: 1, value: 100, isAIGenerated: true }],
        }),
        toEmissionsHistoryDataPoint({
          year: currentYear,
          total: undefined,
          approximated: 80,
          trend: 80,
          carbonLaw: 60,
          isAIGenerated: false,
        }),
        toEmissionsHistoryDataPoint({
          year: 2027,
          total: undefined,
          trend: 70,
          carbonLaw: 50,
          isAIGenerated: false,
        }),
      ],
      currentYear,
    );
    const row = (year: number) => rows.find((item) => item.year === year);

    expect(row(2024)?.history).toBe(100);
    expect(row(2024)?.historyIsAIGenerated).toBe(true);
    expect(row(currentYear)?.history).toBeUndefined();
    expect(row(currentYear)?.historyIsAIGenerated).toBe(false);
    expect(row(2027)?.historyIsAIGenerated).toBe(false);
    expect(row(2027)?.trend).toBe(70);
    expect(row(2027)?.paris).toBe(50);
  });
});

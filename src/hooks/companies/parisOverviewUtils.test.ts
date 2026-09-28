import { describe, expect, it } from "vitest";
import type { CompanyWithKPIs } from "@/types/company";
import {
  buildIndustryBreakdown,
  fastestCutters,
  furthestBehind,
  isSwedishCompany,
  shareRampColor,
  summariseParis,
} from "./parisOverviewUtils";

function company(
  name: string,
  sectorCode: string,
  meetsParis: boolean | null,
  change: number | null,
  emissions: number,
  tags: string[] = ["sweden"],
): CompanyWithKPIs {
  return {
    id: name,
    name,
    tags,
    industry: { industryGics: { sectorCode } },
    reportingPeriods: [{ emissions: { calculatedTotalEmissions: emissions } }],
    meetsParis,
    emissionsChangeFromBaseYear: change,
  } as unknown as CompanyWithKPIs;
}

describe("isSwedishCompany", () => {
  it("matches on the sweden tag", () => {
    expect(isSwedishCompany({ tags: ["sweden", "large"] })).toBe(true);
    expect(isSwedishCompany({ tags: ["norway"] })).toBe(false);
    expect(isSwedishCompany({})).toBe(false);
  });
});

describe("summariseParis", () => {
  const companies = [
    company("On A", "15", true, -40, 100),
    company("On B", "15", true, -30, 100),
    company("Off A", "35", false, -5, 100),
    company("Off B", "35", false, 12, 100),
    company("Unknown", "35", null, null, 100),
  ];

  it("splits the selection into on track, off track and unjudged", () => {
    const summary = summariseParis(companies);

    expect(summary.total).toBe(5);
    expect(summary.onTrack).toBe(2);
    expect(summary.offTrack).toBe(2);
    expect(summary.unknown).toBe(1);
  });

  it("counts every company that is cutting at all, not just the on-track ones", () => {
    // Three have a negative change; only two of those are on track.
    expect(summariseParis(companies).reducing).toBe(3);
  });

  it("takes the on-track share of everyone in view, including the unjudged", () => {
    expect(summariseParis(companies).onTrackPercent).toBe(40);
  });

  it("reports zeroes for an empty selection rather than dividing by zero", () => {
    expect(summariseParis([])).toMatchObject({ total: 0, onTrackPercent: 0 });
  });
});

describe("buildIndustryBreakdown", () => {
  const companies = [
    company("Small on track", "15", true, -40, 10),
    company("Big off track", "35", false, -5, 500),
    company("Also big", "35", true, -50, 300),
  ];

  it("orders industries by emissions, not by performance", () => {
    expect(buildIndustryBreakdown(companies).map((row) => row.code)).toEqual([
      "35",
      "15",
    ]);
  });

  it("totals emissions and scores the on-track share per industry", () => {
    const [healthcare, materials] = buildIndustryBreakdown(companies);

    expect(healthcare).toMatchObject({
      companyCount: 2,
      emissions: 800,
      onTrackShare: 50,
    });
    expect(materials).toMatchObject({ companyCount: 1, onTrackShare: 100 });
  });

  it("drops industries with no companies and marks unjudgeable ones null", () => {
    const rows = buildIndustryBreakdown([company("X", "15", null, null, 5)]);

    expect(rows).toHaveLength(1);
    expect(rows[0].onTrackShare).toBeNull();
  });
});

describe("shareRampColor", () => {
  it("runs pink for low shares through to blue for high ones", () => {
    expect(shareRampColor(0)).toBe("var(--pink-5)");
    expect(shareRampColor(45)).toBe("var(--pink-3)");
    expect(shareRampColor(100)).toBe("var(--blue-3)");
  });

  it("falls back to a neutral colour when nothing can be judged", () => {
    expect(shareRampColor(null)).toBe("var(--black-1)");
  });
});

describe("fastestCutters and furthestBehind", () => {
  const companies = [
    company("Deep cut, off track", "15", false, -60, 100),
    company("Deep cut, on track", "15", true, -50, 100),
    company("Small cut, on track", "15", true, -28, 100),
    company("Growing", "35", false, 20, 100),
  ];

  it("only celebrates companies that are actually on track", () => {
    // A big cut by a company still overshooting its budget is not a success.
    expect(fastestCutters(companies).map((c) => c.name)).toEqual([
      "Deep cut, on track",
      "Small cut, on track",
    ]);
  });

  it("lists the off-track companies worst first", () => {
    expect(furthestBehind(companies).map((c) => c.name)).toEqual([
      "Growing",
      "Deep cut, off track",
    ]);
  });

  it("respects the limit", () => {
    expect(fastestCutters(companies, 1)).toHaveLength(1);
  });
});

import { describe, expect, it } from "vitest";
import type { IndustryGroupCode } from "@/lib/constants/sectors";
import { buildAvailableIndustryGroupOptionGroups } from "./companiesOverviewPageUtils";

describe("buildAvailableIndustryGroupOptionGroups", () => {
  it("nests available industry groups under their parent sector", () => {
    const groups = buildAvailableIndustryGroupOptionGroups(
      ["2510", "3510"],
      {
        "25": "Sällanköpsvaror",
        "35": "Hälsovård",
      },
      {
        "2510": "Bilar och komponenter",
        "3510": "Medicinteknisk utrustning och vårdtjänster",
      } as Record<IndustryGroupCode, string>,
      "Alla branschgrupper",
    );

    expect(groups[0]).toEqual({
      options: [{ value: "all", label: "Alla branschgrupper" }],
    });
    expect(groups).toEqual(
      expect.arrayContaining([
        {
          title: "Sällanköpsvaror",
          options: [{ value: "2510", label: "Bilar och komponenter" }],
        },
        {
          title: "Hälsovård",
          options: [
            {
              value: "3510",
              label: "Medicinteknisk utrustning och vårdtjänster",
            },
          ],
        },
      ]),
    );
  });
});

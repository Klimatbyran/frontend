import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { RankedCompany } from "@/types/company";
import type { IndustryGroupCode } from "@/lib/constants/sectors";
import { transformCompanyToListCard } from "./transformCompanyListCard";

const sectorNames = {
  "25": "Sällanköpsvaror",
};

const industryGroupNames = {
  "2510": "Bilar och komponenter",
} as Record<IndustryGroupCode, string>;

function createCompany(): RankedCompany {
  return {
    id: "volvo",
    name: "Volvo",
    wikidataId: "Q123",
    industry: {
      industryGics: {
        sectorCode: "25",
        groupCode: "2510",
      },
    },
    reportingPeriods: [],
    metrics: {
      emissionsReduction: 0,
      displayReduction: "0.0",
    },
  } as RankedCompany;
}

describe("transformCompanyToListCard", () => {
  it("uses the industry group as the primary company category", () => {
    const card = transformCompanyToListCard(createCompany(), {
      sectorNames,
      industryGroupNames,
      isEmissionsAIGenerated: () => false,
      currentLanguage: "sv",
      t: ((key: string) => key) as never,
    });

    const description = renderToStaticMarkup(card.description as never);

    expect(description).toContain("Bilar och komponenter");
    expect(description).toContain("Sällanköpsvaror");
    expect(description.indexOf("Bilar och komponenter")).toBeLessThan(
      description.indexOf("Sällanköpsvaror"),
    );
  });
});

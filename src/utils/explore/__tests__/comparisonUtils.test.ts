import type { ListCardProps } from "@/components/explore/ListCard";
import {
  buildComparisonLinkTo,
  buildComparisonReturnTo,
  categoryToVariant,
  combinedDataToComparison,
  entityMatchesSelection,
  getExplorePath,
  isComparableSearchResult,
  isComparisonDetailReturnPath,
  isCompareRoute,
  isSameComparisonLink,
  orderSelectedCards,
  variantToCategory,
} from "../comparisonUtils";

describe("buildComparisonLinkTo", () => {
  it("builds company links", () => {
    expect(buildComparisonLinkTo("company", "Q123")).toBe("/companies/Q123");
  });

  it("builds municipality links", () => {
    expect(buildComparisonLinkTo("municipality", "Stockholm")).toBe(
      "/municipalities/Stockholm",
    );
  });

  it("lowercases region links", () => {
    expect(buildComparisonLinkTo("region", "Stockholms län")).toBe(
      "/regions/stockholms län",
    );
  });
});

describe("variant and category mapping", () => {
  it("maps categories to variants", () => {
    expect(categoryToVariant("companies")).toBe("company");
    expect(categoryToVariant("municipalities")).toBe("municipality");
    expect(categoryToVariant("regions")).toBe("region");
    expect(categoryToVariant("nations")).toBeNull();
  });

  it("maps variants to categories", () => {
    expect(variantToCategory("company")).toBe("companies");
    expect(variantToCategory("municipality")).toBe("municipalities");
    expect(variantToCategory("region")).toBe("regions");
  });

  it("maps combined search data to comparison entities", () => {
    expect(
      combinedDataToComparison({
        id: "Q1",
        name: "Acme",
        category: "companies",
      }),
    ).toEqual({
      linkTo: "/companies/Q1",
      variant: "company",
    });

    expect(
      isComparableSearchResult({ id: "x", name: "x", category: "nations" }),
    ).toBe(false);
  });
});

describe("comparison route helpers", () => {
  it("detects compare routes", () => {
    expect(isCompareRoute("/en/explore/compare")).toBe(true);
    expect(isCompareRoute("/en/explore/companies")).toBe(false);
  });

  it("builds return paths with search and hash", () => {
    expect(
      buildComparisonReturnTo({
        pathname: "/en/companies/Q1",
        search: "?tab=overview",
        hash: "#emissions",
      }),
    ).toBe("/en/companies/Q1?tab=overview#emissions");
  });

  it("detects detail return paths", () => {
    expect(isComparisonDetailReturnPath("/en/companies/Q1")).toBe(true);
    expect(isComparisonDetailReturnPath("/en/explore/companies")).toBe(false);
  });

  it("returns explore paths by variant", () => {
    expect(getExplorePath("company")).toBe("/explore/companies");
    expect(getExplorePath("municipality")).toBe("/explore/municipalities");
    expect(getExplorePath("region")).toBe("/explore/regions");
  });
});

describe("selection helpers", () => {
  it("matches links case-insensitively", () => {
    expect(
      isSameComparisonLink("/regions/stockholm", "/regions/Stockholm"),
    ).toBe(true);
    expect(isSameComparisonLink("/companies/A", "/companies/B")).toBe(false);
  });

  it("checks whether a link is selected", () => {
    expect(
      entityMatchesSelection("/companies/A", ["/companies/A", "/companies/B"]),
    ).toBe(true);
    expect(entityMatchesSelection("/companies/C", ["/companies/A"])).toBe(
      false,
    );
  });

  it("orders cards by selection order", () => {
    const cards = [
      { linkTo: "/companies/A", variant: "company" },
      { linkTo: "/companies/B", variant: "company" },
      { linkTo: "/companies/C", variant: "company" },
    ] as ListCardProps[];

    expect(orderSelectedCards(cards, ["/companies/C", "/companies/A"])).toEqual(
      [cards[2], cards[0]],
    );
  });
});

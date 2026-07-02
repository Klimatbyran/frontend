import { vi } from "vitest";
import type { ListCardProps } from "@/components/explore/ListCard";
import {
  buildComparisonLinkTo,
  buildComparisonReturnTo,
  categoryToVariant,
  clearComparisonViewSnapshot,
  clearComparisonViewed,
  clearNavigatingToComparison,
  combinedDataToComparison,
  getComparisonViewSnapshot,
  entityMatchesSelection,
  getExplorePath,
  isComparableSearchResult,
  isComparisonDetailReturnPath,
  isCompareRoute,
  isComparisonViewed,
  isNavigatingToComparison,
  isSameComparisonLink,
  markComparisonViewed,
  markNavigatingToComparison,
  resetComparisonAfterView,
  resetComparisonPickerAfterLeavingCompare,
  orderSelectedCards,
  setComparisonViewSnapshot,
  shouldResetComparisonAfterLeavingRoute,
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

  it("builds nation links with Sweden routed to /nation", () => {
    expect(buildComparisonLinkTo("nation", "SWE")).toBe("/nation");
    expect(buildComparisonLinkTo("nation", "DEU")).toBe("/europe/deu");
  });
});

describe("variant and category mapping", () => {
  it("maps categories to variants", () => {
    expect(categoryToVariant("companies")).toBe("company");
    expect(categoryToVariant("municipalities")).toBe("municipality");
    expect(categoryToVariant("regions")).toBe("region");
    expect(categoryToVariant("nations")).toBe("nation");
  });

  it("maps variants to categories", () => {
    expect(variantToCategory("company")).toBe("companies");
    expect(variantToCategory("municipality")).toBe("municipalities");
    expect(variantToCategory("region")).toBe("regions");
    expect(variantToCategory("nation")).toBe("nations");
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
      combinedDataToComparison({
        id: "DEU",
        name: "Germany",
        category: "nations",
      }),
    ).toEqual({
      linkTo: "/europe/deu",
      variant: "nation",
    });

    expect(
      isComparableSearchResult({
        id: "DEU",
        name: "Germany",
        category: "nations",
      }),
    ).toBe(true);
  });
});

describe("comparison route helpers", () => {
  it("detects compare routes", () => {
    expect(isCompareRoute("/en/explore/compare")).toBe(true);
    expect(isCompareRoute("/sv/explore/compare")).toBe(true);
    expect(isCompareRoute("/en/explore/companies")).toBe(false);
  });

  it("detects when compare state should reset after leaving compare", () => {
    clearComparisonViewed();
    clearComparisonViewSnapshot();

    expect(
      shouldResetComparisonAfterLeavingRoute(
        "/en/municipalities/Stockholm",
        "/en/municipalities/Göteborg",
      ),
    ).toBe(false);

    expect(
      shouldResetComparisonAfterLeavingRoute(
        "/en/municipalities/Stockholm",
        "/en/explore/compare",
      ),
    ).toBe(true);

    markComparisonViewed();
    expect(
      shouldResetComparisonAfterLeavingRoute(
        "/en/municipalities/Stockholm",
        "/en/municipalities/Göteborg",
      ),
    ).toBe(true);

    setComparisonViewSnapshot({
      selectedIds: ["/municipalities/A", "/municipalities/B"],
      variant: "municipality",
    });
    clearComparisonViewed();
    expect(
      shouldResetComparisonAfterLeavingRoute(
        "/en/explore/municipalities",
        "/en/explore/municipalities",
      ),
    ).toBe(true);

    expect(
      shouldResetComparisonAfterLeavingRoute(
        "/en/explore/compare",
        "/en/explore/compare",
      ),
    ).toBe(false);

    clearComparisonViewSnapshot();
    clearComparisonViewed();
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
    expect(isComparisonDetailReturnPath("/en/europe/deu")).toBe(true);
    expect(isComparisonDetailReturnPath("/en/nation")).toBe(true);
    expect(isComparisonDetailReturnPath("/en/explore/companies")).toBe(false);
  });

  it("returns explore paths by variant", () => {
    expect(getExplorePath("company")).toBe("/explore/companies");
    expect(getExplorePath("municipality")).toBe("/explore/municipalities");
    expect(getExplorePath("region")).toBe("/explore/regions");
    expect(getExplorePath("nation")).toBe("/europe");
  });

  it("stores a one-off snapshot for the compare view page", () => {
    clearComparisonViewSnapshot();
    expect(getComparisonViewSnapshot()).toBeNull();

    setComparisonViewSnapshot({
      selectedIds: ["/municipalities/Luleå", "/municipalities/Göteborg"],
      variant: "municipality",
    });
    expect(getComparisonViewSnapshot()).toEqual({
      selectedIds: ["/municipalities/Luleå", "/municipalities/Göteborg"],
      variant: "municipality",
    });

    clearComparisonViewSnapshot();
    expect(getComparisonViewSnapshot()).toBeNull();
  });

  it("tracks navigation into the compare view", () => {
    clearNavigatingToComparison();
    expect(isNavigatingToComparison()).toBe(false);

    markNavigatingToComparison();
    expect(isNavigatingToComparison()).toBe(true);

    clearNavigatingToComparison();
    expect(isNavigatingToComparison()).toBe(false);
  });

  it("tracks when the compare view page has been opened", () => {
    clearComparisonViewed();
    expect(isComparisonViewed()).toBe(false);

    markComparisonViewed();
    expect(isComparisonViewed()).toBe(true);

    clearComparisonViewed();
    expect(isComparisonViewed()).toBe(false);
  });

  it("clears all compare state after the view page was opened", () => {
    markComparisonViewed();
    setComparisonViewSnapshot({
      selectedIds: ["/municipalities/A", "/municipalities/B"],
      variant: "municipality",
    });
    markNavigatingToComparison();

    const clearSelection = vi.fn();
    resetComparisonAfterView(clearSelection);

    expect(clearSelection).toHaveBeenCalledOnce();
    expect(isComparisonViewed()).toBe(false);
    expect(getComparisonViewSnapshot()).toBeNull();
    expect(isNavigatingToComparison()).toBe(false);
  });

  it("keeps the view snapshot when leaving compare for another page", () => {
    markComparisonViewed();
    setComparisonViewSnapshot({
      selectedIds: ["/municipalities/A", "/municipalities/B"],
      variant: "municipality",
    });
    markNavigatingToComparison();

    const clearSelection = vi.fn();
    resetComparisonPickerAfterLeavingCompare(clearSelection);

    expect(clearSelection).toHaveBeenCalledOnce();
    expect(isComparisonViewed()).toBe(false);
    expect(getComparisonViewSnapshot()).toEqual({
      selectedIds: ["/municipalities/A", "/municipalities/B"],
      variant: "municipality",
    });
    expect(isNavigatingToComparison()).toBe(false);
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

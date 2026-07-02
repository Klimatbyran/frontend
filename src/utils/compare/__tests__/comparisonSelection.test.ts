import { COMPARISON_MAX, COMPARISON_MIN } from "../comparisonUtils";
import {
  canViewComparisonSelection,
  EMPTY_COMPARISON_SELECTION,
  getTryToggleComparisonFailure,
  isComparisonSelectionDisabled,
  tryToggleComparisonSelection,
  toggleComparisonSelection,
} from "../comparisonSelection";

const companyA = "/companies/A";
const companyB = "/companies/B";
const companyC = "/companies/C";
const companyD = "/companies/D";
const municipalityA = "/municipalities/stockholm";

describe("toggleComparisonSelection", () => {
  it("adds entities in order and locks the variant", () => {
    const first = toggleComparisonSelection(
      EMPTY_COMPARISON_SELECTION,
      companyA,
      "company",
    );
    expect(first).toEqual({
      selectedIds: [companyA],
      variant: "company",
    });

    const second = toggleComparisonSelection(first!, companyB, "company");
    expect(second).toEqual({
      selectedIds: [companyA, companyB],
      variant: "company",
    });
  });

  it("removes entities and clears variant when the last one is removed", () => {
    const state = {
      selectedIds: [companyA, companyB],
      variant: "company" as const,
    };

    expect(toggleComparisonSelection(state, companyA, "company")).toEqual({
      selectedIds: [companyB],
      variant: "company",
    });

    expect(
      toggleComparisonSelection(
        { selectedIds: [companyB], variant: "company" },
        companyB,
        "company",
      ),
    ).toEqual(EMPTY_COMPARISON_SELECTION);
  });

  it("rejects mixed variants", () => {
    const companies = {
      selectedIds: [companyA],
      variant: "company" as const,
    };

    expect(
      toggleComparisonSelection(companies, municipalityA, "municipality"),
    ).toBeNull();
  });

  it("rejects additions beyond the max", () => {
    const full = {
      selectedIds: [companyA, companyB, companyC, companyD],
      variant: "company" as const,
    };

    expect(
      toggleComparisonSelection(full, "/companies/E", "company"),
    ).toBeNull();
    expect(isComparisonSelectionDisabled(full, "/companies/E")).toBe(true);
    expect(isComparisonSelectionDisabled(full, companyA)).toBe(false);
  });
});

describe("comparison min and max rules", () => {
  it("requires at least two entities to view comparison", () => {
    expect(canViewComparisonSelection(EMPTY_COMPARISON_SELECTION)).toBe(false);
    expect(
      canViewComparisonSelection({
        selectedIds: [companyA],
        variant: "company",
      }),
    ).toBe(false);
    expect(
      canViewComparisonSelection({
        selectedIds: [companyA, companyB],
        variant: "company",
      }),
    ).toBe(true);
    expect(COMPARISON_MIN).toBe(2);
    expect(COMPARISON_MAX).toBe(4);
  });
});

describe("tryToggleComparisonSelection", () => {
  it("returns variant mismatch before adding a different entity type", () => {
    expect(
      getTryToggleComparisonFailure(
        { selectedIds: [companyA], variant: "company" },
        municipalityA,
        "municipality",
      ),
    ).toBe("variant_mismatch");

    expect(
      tryToggleComparisonSelection(
        { selectedIds: [companyA], variant: "company" },
        municipalityA,
        "municipality",
      ),
    ).toEqual({ ok: false, reason: "variant_mismatch" });
  });

  it("returns max reached when selection is full", () => {
    const full = {
      selectedIds: [companyA, companyB, companyC, companyD],
      variant: "company" as const,
    };

    expect(getTryToggleComparisonFailure(full, "/companies/E", "company")).toBe(
      "max_reached",
    );
  });

  it("still allows removing entities when selection is full", () => {
    const full = {
      selectedIds: [companyA, companyB, companyC, companyD],
      variant: "company" as const,
    };

    expect(getTryToggleComparisonFailure(full, companyD, "company")).toBeNull();
    expect(tryToggleComparisonSelection(full, companyD, "company")).toEqual({
      ok: true,
      state: {
        selectedIds: [companyA, companyB, companyC],
        variant: "company",
      },
    });
  });
});

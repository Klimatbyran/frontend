import { describe, expect, it } from "vitest";
import { getCompanySegmentFromComparisonLink } from "./useComparisonCompanies";

describe("getCompanySegmentFromComparisonLink", () => {
  it("reads the company segment from a detail path", () => {
    expect(getCompanySegmentFromComparisonLink("/companies/Q757164")).toBe(
      "Q757164",
    );
    expect(getCompanySegmentFromComparisonLink("/en/companies/b9e9493e")).toBe(
      "b9e9493e",
    );
  });

  it("returns null for non-company links", () => {
    expect(
      getCompanySegmentFromComparisonLink("/municipalities/Stockholm"),
    ).toBeNull();
  });
});

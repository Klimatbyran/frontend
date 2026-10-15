import { describe, expect, it } from "vitest";
import {
  getCompanySegmentFromComparisonLink,
  getComparisonCompaniesFetchError,
} from "./useComparisonCompanies";

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

describe("getComparisonCompaniesFetchError", () => {
  it("returns null while fetches are in progress", () => {
    expect(
      getComparisonCompaniesFetchError(true, 2, 1, [
        { isError: false, error: null, isPending: false, isFetching: false },
        { isError: false, error: null, isPending: true, isFetching: true },
      ]),
    ).toBeNull();
  });

  it("returns the query error when a company fetch fails", () => {
    const networkError = new Error("Network error");
    expect(
      getComparisonCompaniesFetchError(true, 2, 1, [
        {
          isError: true,
          error: networkError,
          isPending: false,
          isFetching: false,
        },
        { isError: false, error: null, isPending: false, isFetching: false },
      ]),
    ).toBe(networkError);
  });

  it("returns an error when fewer companies loaded than requested", () => {
    const error = getComparisonCompaniesFetchError(true, 3, 2, [
      { isError: false, error: null, isPending: false, isFetching: false },
      { isError: false, error: null, isPending: false, isFetching: false },
      { isError: false, error: null, isPending: false, isFetching: false },
    ]);
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toMatch(/failed to load/i);
  });
});

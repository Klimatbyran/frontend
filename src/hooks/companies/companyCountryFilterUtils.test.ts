import { describe, expect, it } from "vitest";
import {
  filterSwedishCompanies,
  isSwedishCompany,
} from "./companyCountryFilterUtils";

describe("isSwedishCompany", () => {
  it("treats companies without country tags as Swedish", () => {
    expect(isSwedishCompany({})).toBe(true);
    expect(isSwedishCompany({ tags: [] })).toBe(true);
    expect(isSwedishCompany({ tags: ["some-other-tag"] })).toBe(true);
  });

  it("includes companies tagged sweden", () => {
    expect(isSwedishCompany({ tags: ["sweden"] })).toBe(true);
  });

  it("excludes companies tagged with other Nordic country slugs", () => {
    expect(isSwedishCompany({ tags: ["norway"] })).toBe(false);
    expect(isSwedishCompany({ tags: ["finland"] })).toBe(false);
    expect(isSwedishCompany({ tags: ["denmark"] })).toBe(false);
    expect(isSwedishCompany({ tags: ["iceland"] })).toBe(false);
  });

  it("excludes companies tagged with both sweden and another country", () => {
    expect(isSwedishCompany({ tags: ["sweden", "norway"] })).toBe(false);
  });
});

describe("filterSwedishCompanies", () => {
  it("returns only Swedish companies", () => {
    const companies = [
      { id: "1", tags: ["sweden"] },
      { id: "2", tags: ["norway"] },
      { id: "3" },
    ];

    expect(filterSwedishCompanies(companies).map((c) => c.id)).toEqual([
      "1",
      "3",
    ]);
  });
});

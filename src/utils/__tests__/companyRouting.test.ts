import { describe, expect, it } from "vitest";
import {
  getCompanyDetailPath,
  getCompanyUrlSegment,
  isFullCompanyUuid,
  isWikidataId,
} from "../companyRouting";

describe("companyRouting", () => {
  it("detects wikidata ids", () => {
    expect(isWikidataId("Q188326")).toBe(true);
    expect(isWikidataId("a1b2c3d4")).toBe(false);
  });

  it("detects full company uuids", () => {
    expect(
      isFullCompanyUuid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
    ).toBe(true);
    expect(isFullCompanyUuid("a1b2c3d4")).toBe(false);
  });

  it("prefers wikidataId for public url segment", () => {
    expect(
      getCompanyUrlSegment({
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        wikidataId: "Q1",
      }),
    ).toBe("Q1");
  });

  it("uses 8-char uuid prefix when wikidataId is missing", () => {
    expect(
      getCompanyUrlSegment({
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      }),
    ).toBe("a1b2c3d4");
  });

  it("builds company detail paths", () => {
    expect(
      getCompanyDetailPath(
        { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", wikidataId: "Q99" },
        "/sv",
      ),
    ).toBe("/sv/companies/Q99");
  });
});

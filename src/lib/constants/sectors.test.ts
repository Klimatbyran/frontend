import { describe, expect, it } from "vitest";
import {
  getSectorCodeFromIndustryGroup,
  isIndustryGroupCode,
  isSectorCode,
} from "./sectors";
import { getIndustryGroupColor } from "./companyColors";

describe("GICS industry group helpers", () => {
  it("identifies sector and industry group codes", () => {
    expect(isSectorCode("25")).toBe(true);
    expect(isSectorCode("2510")).toBe(false);
    expect(isIndustryGroupCode("2510")).toBe(true);
    expect(isIndustryGroupCode("25")).toBe(false);
  });

  it("maps industry groups back to their parent sector", () => {
    expect(getSectorCodeFromIndustryGroup("2510")).toBe("25");
    expect(getSectorCodeFromIndustryGroup("4010")).toBe("40");
    expect(getSectorCodeFromIndustryGroup("99")).toBeUndefined();
  });

  it("uses distinct shades for sibling industry groups", () => {
    expect(getIndustryGroupColor("2510")).not.toBe(
      getIndustryGroupColor("2520"),
    );
    expect(getIndustryGroupColor("2510")).toMatch(/^var\(--/);
  });
});

import { describe, expect, it } from "vitest";
import { getCountryFlagUrl } from "@/utils/europe/countryFlag";

describe("getCountryFlagUrl", () => {
  it("builds a flagcdn URL from ISO2 code", () => {
    expect(getCountryFlagUrl("SE")).toBe("https://flagcdn.com/w160/se.png");
    expect(getCountryFlagUrl("de", 80)).toBe("https://flagcdn.com/w80/de.png");
  });
});

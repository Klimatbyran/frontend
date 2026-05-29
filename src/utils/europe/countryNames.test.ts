import { describe, expect, it } from "vitest";
import {
  buildCountryGeoIndex,
  getLocalizedCountryName,
  resolveCountryIso3,
} from "./countryNames";

describe("countryNames", () => {
  it("localizes ISO2 country codes", () => {
    expect(getLocalizedCountryName("SE", "sv", "Sweden")).toBe("Sverige");
    expect(getLocalizedCountryName("SE", "en", "Sweden")).toBe("Sweden");
    expect(getLocalizedCountryName("DE", "sv", "Germany")).toBe("Tyskland");
  });

  it("resolves country names from geo index in multiple languages", () => {
    const { nameToIso3 } = buildCountryGeoIndex({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { NAME: "Sweden", ISO2: "SE", ISO3: "SWE" },
          geometry: { type: "Point", coordinates: [0, 0] },
        },
      ],
    });

    expect(resolveCountryIso3("Sweden", nameToIso3)).toBe("SWE");
    expect(resolveCountryIso3("Sverige", nameToIso3)).toBe("SWE");
  });
});

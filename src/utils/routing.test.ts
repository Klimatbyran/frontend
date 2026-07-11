import { describe, expect, it } from "vitest";
import {
  getEntityDetailPath,
  getNationDetailPath,
  getNationUrlSlug,
  isNationDetailPath,
  isNationUrlSlug,
  resolveNavPath,
  SWEDEN_ISO3,
} from "./routing";

describe("nation routing", () => {
  it("uses localized country name slugs", () => {
    expect(getNationUrlSlug("sv")).toBe("sverige");
    expect(getNationUrlSlug("en")).toBe("sweden");
    expect(getNationDetailPath("sv")).toBe("/sverige");
    expect(getNationDetailPath("en")).toBe("/sweden");
  });

  it("recognizes nation detail paths", () => {
    expect(isNationDetailPath("/sv/sverige")).toBe(true);
    expect(isNationDetailPath("/en/sweden")).toBe(true);
    expect(isNationDetailPath("/sv/nation")).toBe(true);
    expect(isNationDetailPath("/en/regions")).toBe(false);
  });

  it("recognizes nation URL slugs", () => {
    expect(isNationUrlSlug("sverige")).toBe(true);
    expect(isNationUrlSlug("sweden")).toBe(true);
    expect(isNationUrlSlug("nation")).toBe(false);
  });

  it("resolves legacy /nation nav path", () => {
    expect(resolveNavPath("/nation", "sv")).toBe("/sverige");
    expect(resolveNavPath("/nation", "en")).toBe("/sweden");
    expect(resolveNavPath("/regions", "sv")).toBe("/regions");
  });
});

describe("getEntityDetailPath", () => {
  it("routes Sweden to the localized nation detail page", () => {
    expect(
      getEntityDetailPath(
        "europe",
        { id: SWEDEN_ISO3, name: "Sweden" },
        undefined,
        "sv",
      ),
    ).toBe("/sverige");
    expect(getEntityDetailPath("europe", "swe", undefined, "en")).toBe(
      "/sweden",
    );
  });

  it("defaults Sweden nation routing to Swedish slug", () => {
    expect(
      getEntityDetailPath("europe", { id: SWEDEN_ISO3, name: "Sweden" }),
    ).toBe("/sverige");
  });

  it("routes other European countries by ISO3 code", () => {
    expect(getEntityDetailPath("europe", { id: "DEU", name: "Germany" })).toBe(
      "/europe/deu",
    );
  });
});

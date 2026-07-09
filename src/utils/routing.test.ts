import { describe, expect, it } from "vitest";
import { getEntityDetailPath, SWEDEN_ISO3 } from "./routing";

describe("getEntityDetailPath", () => {
  it("routes Sweden to the nation detail page", () => {
    expect(
      getEntityDetailPath("europe", { id: SWEDEN_ISO3, name: "Sweden" }),
    ).toBe("/nation");
    expect(getEntityDetailPath("europe", "swe")).toBe("/nation");
  });

  it("routes other European countries by ISO3 code", () => {
    expect(getEntityDetailPath("europe", { id: "DEU", name: "Germany" })).toBe(
      "/europe/deu",
    );
  });
});

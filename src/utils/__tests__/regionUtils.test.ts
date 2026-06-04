import { resolveRegionFromMapName, toMapRegionName } from "../regionUtils";

describe("resolveRegionFromMapName", () => {
  const regions = [{ name: "Stockholms län" }, { name: "Västra Götalands län" }];

  it("resolves by map name from geo json", () => {
    expect(
      resolveRegionFromMapName("Stockholm", regions)?.name,
    ).toBe("Stockholms län");
  });

  it("resolves by display name", () => {
    expect(
      resolveRegionFromMapName("Stockholms län", regions)?.name,
    ).toBe("Stockholms län");
  });

  it("returns undefined when no region matches", () => {
    expect(resolveRegionFromMapName("Unknown", regions)).toBeUndefined();
  });
});

describe("toMapRegionName", () => {
  it("strips län suffix for map identity", () => {
    expect(toMapRegionName("Stockholms län")).toBe("Stockholm");
  });
});

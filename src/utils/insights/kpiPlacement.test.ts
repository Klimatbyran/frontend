import { describe, expect, it } from "vitest";
import {
  placeInSet,
  placementMarker,
  placementTone,
  resolvePlacement,
  valuesForPlacement,
} from "./kpiPlacement";

describe("placeInSet", () => {
  it("ranks the lowest value first when lower is better", () => {
    expect(placeInSet([10, 4, 7, 4], 4, false)).toEqual({
      rank: 1,
      tiedWith: 2,
      total: 4,
    });
  });

  it("ranks the highest value first when higher is better", () => {
    expect(placeInSet([10, 4, 7], 7, true)).toEqual({
      rank: 2,
      tiedWith: 1,
      total: 3,
    });
  });

  it("treats true as better than false when higher is better", () => {
    expect(placeInSet([true, false, false, true], false, true)).toEqual({
      rank: 3,
      tiedWith: 2,
      total: 4,
    });
  });

  it("leaves missing values out of the set", () => {
    expect(placeInSet([null, undefined, Number.NaN, 5, 8], 5, false)).toEqual({
      rank: 1,
      tiedWith: 1,
      total: 2,
    });
  });

  it("returns null when the subject has no comparable value", () => {
    expect(placeInSet([1, 2, 3], null, true)).toBeNull();
  });
});

describe("valuesForPlacement", () => {
  it("replaces the subject's row with the value shown on the page", () => {
    const entities = [
      { id: "a", value: 1 },
      { id: "b", value: 9 },
    ];

    expect(
      valuesForPlacement(
        entities,
        (entity) => entity.id === "b",
        4,
        (entity) => entity.value,
      ),
    ).toEqual([1, 4]);
  });
});

describe("resolvePlacement", () => {
  it("stays pending while peers are loading", () => {
    expect(resolvePlacement("loading", [1], [1], 1, true)).toEqual({
      placement: null,
      pending: true,
    });
  });

  it("does not award a solo rank when the peer set failed to load", () => {
    expect(resolvePlacement("error", [], [3], 3, false)).toEqual({
      placement: null,
      pending: false,
    });
  });
});

describe("placementMarker", () => {
  it("puts the best rank at the start and a tie in the middle of its group", () => {
    expect(placementMarker({ rank: 1, tiedWith: 1, total: 5 })).toBe(0);
    expect(placementMarker({ rank: 2, tiedWith: 2, total: 5 })).toBe(0.375);
  });

  it("colors first place as good and the back of the pack as poor", () => {
    expect(placementTone({ rank: 1, tiedWith: 40, total: 100 })).toBe("good");
    expect(placementTone({ rank: 80, tiedWith: 1, total: 100 })).toBe("poor");
  });
});

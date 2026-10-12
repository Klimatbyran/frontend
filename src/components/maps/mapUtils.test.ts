import { describe, expect, it } from "vitest";
import { toFitBoundsOptions } from "./mapUtils";

describe("toFitBoundsOptions", () => {
  it("turns a four-sided inset into leaflet corners", () => {
    expect(toFitBoundsOptions([20, 20, 96, 20])).toEqual({
      paddingTopLeft: [20, 20],
      paddingBottomRight: [20, 96],
    });
  });

  it("keeps a two-value padding", () => {
    expect(toFitBoundsOptions([12, 8])).toEqual({ padding: [12, 8] });
  });

  it("passes corner padding through", () => {
    const padding = {
      paddingTopLeft: [16, 12] as [number, number],
      paddingBottomRight: [16, 92] as [number, number],
    };
    expect(toFitBoundsOptions(padding)).toBe(padding);
  });
});

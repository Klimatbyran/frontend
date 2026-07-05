import {
  getVisualViewportBottomInset,
  getVisualViewportHeight,
} from "../visualViewport";

describe("getVisualViewportBottomInset", () => {
  it("returns 0 when viewport is unavailable", () => {
    expect(getVisualViewportBottomInset(800, null)).toBe(0);
    expect(getVisualViewportBottomInset(800, undefined)).toBe(0);
  });

  it("returns 0 when the keyboard is closed", () => {
    expect(
      getVisualViewportBottomInset(800, { height: 800, offsetTop: 0 }),
    ).toBe(0);
  });

  it("returns the keyboard height when the visual viewport shrinks", () => {
    expect(
      getVisualViewportBottomInset(800, { height: 500, offsetTop: 0 }),
    ).toBe(300);
  });

  it("accounts for visual viewport offset on iOS", () => {
    expect(
      getVisualViewportBottomInset(800, { height: 500, offsetTop: 50 }),
    ).toBe(250);
  });
});

describe("getVisualViewportHeight", () => {
  it("falls back to window inner height when viewport is unavailable", () => {
    expect(getVisualViewportHeight(800, null)).toBe(800);
  });

  it("returns the visual viewport height when available", () => {
    expect(getVisualViewportHeight(800, { height: 500 })).toBe(500);
  });
});

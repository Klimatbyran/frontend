import { describe, expect, it } from "vitest";
import { getResponsiveChartMargin, getYAxisProps } from "./chartUtils";
import {
  getTwoFuturesChartMargin,
  getTwoFuturesYAxisProps,
} from "@/components/charts/twoFutures/twoFuturesChartAxis";

describe("detail chart layout", () => {
  it("uses matching left and right margins so the plot stays centered", () => {
    for (const margin of [
      getResponsiveChartMargin(true),
      getResponsiveChartMargin(false),
      getTwoFuturesChartMargin(true),
      getTwoFuturesChartMargin(false),
    ]) {
      expect(margin.left).toBe(margin.right);
      expect(margin.left).toBeGreaterThan(0);
    }
  });

  it("leaves the default axis id alone so labels bind to the series", () => {
    expect(getYAxisProps("sv")).not.toHaveProperty("yAxisId");
    expect(getYAxisProps("sv", [0, "auto"], { yAxisId: "left" }).yAxisId).toBe(
      "left",
    );
  });

  it("draws the two-futures axis inside the plot on narrow screens", () => {
    const mobile = getTwoFuturesYAxisProps("sv", true);
    expect(mobile.mirror).toBe(true);
    expect(mobile).not.toHaveProperty("yAxisId");
    expect(mobile.orientation).toBe("right");

    const desktop = getTwoFuturesYAxisProps("en", false);
    expect(desktop).not.toHaveProperty("mirror");
    expect(desktop.width).toBe(72);
  });
});

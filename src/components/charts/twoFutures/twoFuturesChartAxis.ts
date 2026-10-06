import { getYAxisProps } from "@/components/charts/historicEmissions/utils/chartUtils";

export function getTwoFuturesChartMargin(isMobile: boolean) {
  return {
    top: 16,
    right: isMobile ? 6 : 8,
    left: isMobile ? 6 : 8,
    bottom: 8,
  };
}

export function getTwoFuturesYAxisProps(
  currentLanguage: "sv" | "en",
  isMobile: boolean,
) {
  return {
    ...getYAxisProps(currentLanguage, [0, "auto"], {
      orientation: "right",
      // Inside the plot on small screens so the line stays centered.
      // An outside axis reserved a blank gutter (its id didn't match the series).
      mirror: isMobile,
    }),
    // Mirrored width paints the label band but is not taken from the plot.
    width: isMobile ? 48 : 72,
  };
}

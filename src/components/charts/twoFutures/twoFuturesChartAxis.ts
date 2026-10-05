import { getYAxisProps } from "@/components/charts/historicEmissions/utils/chartUtils";

export function getTwoFuturesChartMargin(isMobile: boolean) {
  return {
    top: 20,
    right: isMobile ? 2 : 4,
    left: isMobile ? 0 : 4,
    bottom: 8,
  };
}

export function getTwoFuturesYAxisProps(
  currentLanguage: "sv" | "en",
  isMobile: boolean,
) {
  return {
    ...getYAxisProps(currentLanguage, [0, "auto"], { orientation: "right" }),
    width: isMobile ? 56 : 72,
  };
}

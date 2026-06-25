import type { DecouplingVerdict } from "@/utils/data/turnoverChartData";

export const VERDICT_COLOR_CLASS: Record<DecouplingVerdict, string> = {
  yes: "text-green-3",
  "no-red": "text-pink-3",
  "no-yellow": "text-orange-2",
};

export const VERDICT_EXPLANATION_KEY: Record<DecouplingVerdict, string> = {
  yes: "companies.turnoverEmissionsHistory.intensityPanel.verdictYes",
  "no-red": "companies.turnoverEmissionsHistory.intensityPanel.verdictNoRed",
  "no-yellow":
    "companies.turnoverEmissionsHistory.intensityPanel.verdictNoYellow",
};

export function getEmissionsChangeColorClass(changePercent: number): string {
  if (changePercent < 0) return "text-green-3";
  if (changePercent > 0) return "text-pink-3";
  return "text-orange-2";
}

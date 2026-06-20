import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { DecouplingComparison } from "@/utils/data/turnoverChartData";

interface TurnoverEmissionsIntensityPanelProps {
  comparison: DecouplingComparison;
}

export function TurnoverEmissionsIntensityPanel({
  comparison,
}: TurnoverEmissionsIntensityPanelProps) {
  const { t } = useTranslation();

  const verdictColorClass = {
    yes: "text-green-3",
    "no-red": "text-pink-3",
    "no-yellow": "text-yellow-400",
  }[comparison.verdict];

  const verdictExplanationKey = (() => {
    if (comparison.verdict === "yes") {
      return "companies.turnoverEmissionsHistory.intensityPanel.verdictYes";
    }

    if (comparison.verdict === "no-red") {
      if (
        comparison.turnoverChangePercent < -5 &&
        comparison.emissionsChangePercent > 5
      ) {
        return "companies.turnoverEmissionsHistory.intensityPanel.verdictNoRedOpposite";
      }
      return "companies.turnoverEmissionsHistory.intensityPanel.verdictNoRed";
    }

    if (
      Math.abs(comparison.turnoverChangePercent) <= 5 &&
      Math.abs(comparison.emissionsChangePercent) <= 5
    ) {
      return "companies.turnoverEmissionsHistory.intensityPanel.verdictNoYellow";
    }

    return "companies.turnoverEmissionsHistory.intensityPanel.verdictNoYellowMixed";
  })();

  const periodKey = comparison.usedBaseYear
    ? "companies.turnoverEmissionsHistory.intensityPanel.periodBaseYear"
    : "companies.turnoverEmissionsHistory.intensityPanel.periodFirstYear";

  return (
    <div className="flex h-full flex-col justify-center rounded-level-2 bg-black-1 p-4 md:p-5 lg:min-h-[500px]">
      <Text className="text-sm leading-relaxed text-grey">
        {t("companies.turnoverEmissionsHistory.intensityPanel.description")}
      </Text>

      <Text className="mt-4 text-xs text-grey">
        {t(periodKey, {
          startYear: comparison.startYear,
          endYear: comparison.endYear,
        })}
      </Text>

      <Text className="mt-6 text-sm">
        {t("companies.turnoverEmissionsHistory.intensityPanel.question")}
      </Text>

      <Text variant="h3" className={cn("mt-2 font-medium", verdictColorClass)}>
        {comparison.verdict === "yes" ? t("yes") : t("no")}
      </Text>

      <Text className="mt-2 text-xs leading-relaxed text-grey">
        {t(verdictExplanationKey)}
      </Text>
    </div>
  );
}

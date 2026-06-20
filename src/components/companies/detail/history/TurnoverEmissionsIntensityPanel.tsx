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
    "no-yellow": "text-orange-2",
  }[comparison.verdict];

  const verdictExplanationKey = {
    yes: "companies.turnoverEmissionsHistory.intensityPanel.verdictYes",
    "no-red": "companies.turnoverEmissionsHistory.intensityPanel.verdictNoRed",
    "no-yellow":
      "companies.turnoverEmissionsHistory.intensityPanel.verdictNoYellow",
  }[comparison.verdict];

  const periodKey = comparison.usedBaseYear
    ? "companies.turnoverEmissionsHistory.intensityPanel.periodBaseYear"
    : "companies.turnoverEmissionsHistory.intensityPanel.periodFirstYear";

  return (
    <div className="flex h-full flex-col justify-center rounded-level-2 bg-black-1 p-4 md:p-6 lg:min-h-[500px]">
      <Text className="text-base leading-relaxed text-white md:text-lg">
        {t("companies.turnoverEmissionsHistory.intensityPanel.description")}
      </Text>

      <Text className="mt-4 text-sm text-white md:text-base">
        {t(periodKey, {
          startYear: comparison.startYear,
          endYear: comparison.endYear,
        })}
      </Text>

      <Text className="mt-8 text-xl leading-snug text-white md:text-2xl lg:text-3xl">
        {t("companies.turnoverEmissionsHistory.intensityPanel.question")}
      </Text>

      <Text
        className={cn(
          "mt-4 text-4xl font-light leading-none tracking-tighter md:text-6xl",
          verdictColorClass,
        )}
      >
        {comparison.verdict === "yes" ? t("yes") : t("no")}
      </Text>

      <Text className="mt-3 text-sm leading-relaxed text-white md:text-base">
        {t(verdictExplanationKey)}
      </Text>
    </div>
  );
}

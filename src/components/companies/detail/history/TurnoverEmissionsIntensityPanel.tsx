import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeUnit } from "@/utils/formatting/localization";
import type { DecouplingComparison } from "@/utils/data/turnoverChartData";

interface TurnoverEmissionsIntensityPanelProps {
  comparison: DecouplingComparison;
}

function formatIntensity(intensity: number, language: "sv" | "en"): string {
  return localizeUnit(intensity, language);
}

const END_INTENSITY_COLOR_CLASS: Record<
  DecouplingComparison["verdict"],
  string
> = {
  yes: "text-green-3",
  "no-red": "text-pink-3",
  "no-yellow": "text-orange-2",
};

function IntensityStat({
  year,
  intensity,
  colorClass,
  language,
  unitLabel,
}: {
  year: number;
  intensity: number;
  colorClass: string;
  language: "sv" | "en";
  unitLabel: string;
}) {
  return (
    <div>
      <Text className="mb-1 text-sm text-grey md:text-base">{year}</Text>
      <Text className={`text-2xl font-light md:text-3xl ${colorClass}`}>
        {formatIntensity(intensity, language)}
      </Text>
      <Text variant="small" className="mt-1 text-grey">
        {unitLabel}
      </Text>
    </div>
  );
}

export function TurnoverEmissionsIntensityPanel({
  comparison,
}: TurnoverEmissionsIntensityPanelProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const verdictColorClass = END_INTENSITY_COLOR_CLASS[comparison.verdict];

  const verdictExplanationKey = {
    yes: "companies.turnoverEmissionsHistory.intensityPanel.verdictYes",
    "no-red": "companies.turnoverEmissionsHistory.intensityPanel.verdictNoRed",
    "no-yellow":
      "companies.turnoverEmissionsHistory.intensityPanel.verdictNoYellow",
  }[comparison.verdict];

  const periodKey = comparison.usedBaseYear
    ? "companies.turnoverEmissionsHistory.intensityPanel.periodBaseYear"
    : "companies.turnoverEmissionsHistory.intensityPanel.periodFirstYear";

  const intensityUnit = t(
    "companies.turnoverEmissionsHistory.intensityPanel.intensityUnit",
  );

  const startIntensityStat = (
    <IntensityStat
      year={comparison.startYear}
      intensity={comparison.startIntensity}
      colorClass="text-orange-2"
      language={currentLanguage}
      unitLabel={intensityUnit}
    />
  );

  const endIntensityStat = (
    <IntensityStat
      year={comparison.endYear}
      intensity={comparison.endIntensity}
      colorClass={END_INTENSITY_COLOR_CLASS[comparison.verdict]}
      language={currentLanguage}
      unitLabel={intensityUnit}
    />
  );

  return (
    <div className="flex h-full w-full flex-col rounded-level-2 bg-black-1 p-6 md:p-8">
      <Text variant="h6" className="md:text-xl">
        {t("companies.turnoverEmissionsHistory.intensityPanel.title")}
      </Text>

      <Text variant="body" className="mt-4 leading-relaxed text-grey">
        {t("companies.turnoverEmissionsHistory.intensityPanel.description")}
      </Text>

      <div className="my-6 border-t border-white/50 md:my-8" />

      <div className="flex flex-1 flex-col justify-center">
        <OverviewStat
          label={t(
            "companies.turnoverEmissionsHistory.intensityPanel.question",
          )}
          value={comparison.verdict === "yes" ? t("yes") : t("no")}
          valueClassName={verdictColorClass}
          useFlex1={false}
        />

        <Text variant="body" className="mt-4 leading-relaxed text-white">
          {t(verdictExplanationKey)}
        </Text>

        <Text variant="small" className="mt-4 text-grey">
          {t(periodKey, {
            startYear: comparison.startYear,
            endYear: comparison.endYear,
          })}
        </Text>
      </div>

      <div className="mt-6 border-t border-white/50 pt-6 md:mt-8 md:pt-8">
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {startIntensityStat}
          {endIntensityStat}
        </div>
      </div>
    </div>
  );
}

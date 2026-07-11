import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";
import type { DecouplingComparison } from "@/utils/data/turnoverChartData";
import {
  getEmissionsChangeColorClass,
  VERDICT_COLOR_CLASS,
  VERDICT_EXPLANATION_KEY,
  VERDICT_LABEL_KEY,
} from "./turnoverEmissionsPanelUtils";

interface TurnoverEmissionsIntensityPanelProps {
  comparison: DecouplingComparison;
}

function FooterMetric({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div>
      <Text className="text-sm text-grey md:text-sm lg:text-base">{label}</Text>
      <Text
        className={`mt-0.5 text-xl font-light md:mt-1 md:text-2xl lg:text-3xl ${colorClass}`}
      >
        {value}
      </Text>
    </div>
  );
}

export function TurnoverEmissionsIntensityPanel({
  comparison,
}: TurnoverEmissionsIntensityPanelProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const verdictColorClass = VERDICT_COLOR_CLASS[comparison.verdict];
  const periodNoteKey = comparison.usedBaseYear
    ? "companies.turnoverEmissionsHistory.intensityPanel.periodBaseYearNote"
    : "companies.turnoverEmissionsHistory.intensityPanel.periodFirstYearNote";
  const intensityUnit = t(
    "companies.turnoverEmissionsHistory.intensityPanel.intensityUnit",
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 rounded-level-2 bg-black-1 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:justify-between lg:gap-5 lg:px-6 lg:py-5">
      <div>
        <Text className="text-base text-grey md:text-lg">
          {t("companies.turnoverEmissionsHistory.intensityPanel.question")}
        </Text>
        <Text
          className={`mt-1.5 text-5xl font-light md:mt-2 lg:text-6xl ${verdictColorClass}`}
          aria-label={t(VERDICT_EXPLANATION_KEY[comparison.verdict])}
        >
          {t(VERDICT_LABEL_KEY[comparison.verdict])}
        </Text>
        <Text className="mt-2 text-base leading-snug text-white md:mt-2 md:text-base md:leading-relaxed lg:text-lg">
          {t(VERDICT_EXPLANATION_KEY[comparison.verdict])}
        </Text>
      </div>

      <div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 md:gap-4">
          <div>
            <Text className="text-sm text-grey md:text-base">
              {comparison.startYear}
            </Text>
            <Text className="text-3xl font-light text-orange-2 md:text-3xl lg:text-4xl">
              {localizeUnit(comparison.startIntensity, currentLanguage)}
            </Text>
          </div>
          <ArrowRight
            className="mb-1 size-6 shrink-0 text-grey md:mb-1.5 md:size-6 lg:size-7"
            aria-hidden
          />
          <div>
            <Text className="text-sm text-grey md:text-base">
              {comparison.endYear}
            </Text>
            <Text
              className={`text-3xl font-light md:text-3xl lg:text-4xl ${verdictColorClass}`}
            >
              {localizeUnit(comparison.endIntensity, currentLanguage)}
            </Text>
          </div>
        </div>

        <Text className="mt-1.5 text-sm text-grey md:mt-1.5 md:text-sm lg:text-base">
          {intensityUnit}
        </Text>

        <Text className="mt-2 text-sm leading-snug text-grey md:mt-3 md:text-sm lg:text-base">
          {t(periodNoteKey)}
        </Text>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-white/20 pt-4 md:gap-4 md:pt-4">
        <FooterMetric
          label={t(
            "companies.turnoverEmissionsHistory.intensityPanel.intensityChange",
          )}
          value={formatPercentChange(
            comparison.intensityChangePercent,
            currentLanguage,
            false,
          )}
          colorClass={verdictColorClass}
        />
        <FooterMetric
          label={t(
            "companies.turnoverEmissionsHistory.intensityPanel.emissionsLabel",
          )}
          value={formatPercentChange(
            comparison.emissionsChangePercent,
            currentLanguage,
            false,
          )}
          colorClass={getEmissionsChangeColorClass(
            comparison.emissionsChangePercent,
          )}
        />
        <FooterMetric
          label={t(
            "companies.turnoverEmissionsHistory.intensityPanel.turnoverLabel",
          )}
          value={formatPercentChange(
            comparison.turnoverChangePercent,
            currentLanguage,
            false,
          )}
          colorClass="text-orange-2"
        />
      </div>
    </div>
  );
}

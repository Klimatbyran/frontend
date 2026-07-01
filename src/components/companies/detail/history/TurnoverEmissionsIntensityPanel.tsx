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
      <Text className="text-sm text-grey md:text-base">{label}</Text>
      <Text className={`mt-1 text-2xl font-light md:text-3xl ${colorClass}`}>
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
    <div className="flex h-full min-h-[500px] flex-col justify-evenly rounded-level-2 bg-black-1 px-6 py-6 md:px-8 md:py-8 lg:min-h-0">
      <div>
        <Text className="text-base text-grey md:text-lg">
          {t("companies.turnoverEmissionsHistory.intensityPanel.question")}
        </Text>
        <Text
          className={`mt-2 text-5xl font-light md:text-6xl ${verdictColorClass}`}
          aria-label={t(VERDICT_EXPLANATION_KEY[comparison.verdict])}
        >
          {t(VERDICT_LABEL_KEY[comparison.verdict])}
        </Text>
        <Text className="mt-3 text-base leading-relaxed text-white md:text-lg">
          {t(VERDICT_EXPLANATION_KEY[comparison.verdict])}
        </Text>
      </div>

      <div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 md:gap-6">
          <div>
            <Text className="text-sm text-grey md:text-base">
              {comparison.startYear}
            </Text>
            <Text className="text-3xl font-light text-orange-2 md:text-4xl">
              {localizeUnit(comparison.startIntensity, currentLanguage)}
            </Text>
          </div>
          <ArrowRight
            className="mb-2 size-6 shrink-0 text-grey md:size-7"
            aria-hidden
          />
          <div>
            <Text className="text-sm text-grey md:text-base">
              {comparison.endYear}
            </Text>
            <Text
              className={`text-3xl font-light md:text-4xl ${verdictColorClass}`}
            >
              {localizeUnit(comparison.endIntensity, currentLanguage)}
            </Text>
          </div>
        </div>

        <Text className="mt-2 text-sm text-grey md:text-base">
          {intensityUnit}
        </Text>

        <Text className="mt-4 text-sm leading-snug text-grey md:mt-5 md:text-base">
          {t(periodNoteKey)}
        </Text>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-5 md:gap-6 md:pt-6">
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

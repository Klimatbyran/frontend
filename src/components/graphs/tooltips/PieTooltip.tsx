import React from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { ChartTooltipContainer } from "@/components/charts/ChartTooltipContainer";
import { ChartTooltipHeader } from "@/components/charts/ChartTooltipHeader";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";
import { useScreenSize } from "@/hooks/useScreenSize";
import type { SupportedLanguage } from "@/lib/languageDetection";

interface PieTooltipEntry {
  name?: string;
  value?: number | null;
  payload?: {
    key?: string | null;
    total?: number | null;
  } | null;
}

interface PieTooltipProps {
  active?: boolean;
  payload?: PieTooltipEntry[];
  label?: string;
  customActionLabel?: string;
  showActionLabelForNull?: boolean;
  showActionHint?: boolean;
  showPercentage?: boolean;
  percentageLabel?: string;
}

function computePercent(
  value: number,
  total: number | null | undefined,
  language: SupportedLanguage,
): string | null {
  if (total == null || total === 0) return null;
  return formatPercent(value / total, language);
}

function getActionHint(
  customActionLabel: string | undefined,
  isMobile: boolean,
  t: (key: string) => string,
): string {
  if (customActionLabel) return customActionLabel;
  return isMobile
    ? t("graphs.pieChart.doubleClickToFilter")
    : t("graphs.pieChart.clickToFilter");
}

const PieTooltip: React.FC<PieTooltipProps> = ({
  active,
  payload,
  customActionLabel,
  showActionLabelForNull = true,
  showActionHint = true,
  showPercentage = true,
  percentageLabel,
}) => {
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const name = payload?.[0]?.name;

  if (!active || !payload || !payload.length) {
    return null;
  }

  const { value, payload: data } = payload[0];
  const safeValue = value != null ? value : 0;
  const percentage = computePercent(safeValue, data?.total, currentLanguage);
  const actionHint =
    showActionHint &&
    (data?.key !== null || showActionLabelForNull) &&
    getActionHint(customActionLabel, isMobile, t);

  return (
    <ChartTooltipContainer className="pointer-events-none">
      <ChartTooltipHeader>{name}</ChartTooltipHeader>
      <div className="">
        <div>
          {formatEmissionsAbsolute(Math.round(safeValue), currentLanguage)}{" "}
          {t("emissionsUnit")}
        </div>
        {showPercentage && percentage && (
          <div>
            {percentage} {percentageLabel || t("graphs.pieChart.ofTotal")}
          </div>
        )}
        {actionHint && (
          <p className="text-xs italic text-blue-2 mt-2">{actionHint}</p>
        )}
      </div>
    </ChartTooltipContainer>
  );
};

export default PieTooltip;

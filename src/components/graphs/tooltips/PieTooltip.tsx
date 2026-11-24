import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { ChartTooltipContainer } from "@/components/charts/ChartTooltipContainer";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";
import { useScreenSize } from "@/hooks/useScreenSize";
import { ChartTooltipList } from "@/components/charts/ChartTooltipList";
import { ChartTooltipHeader } from "@/components/charts/ChartTooltipHeader";
import { X } from "lucide-react";

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
  const [closed, setClosed] = useState(false);
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const name = payload?.[0]?.name;

  // Reset closed state when tooltip is re-activated or payload changes
  useEffect(() => {
    if (active) setClosed(false);
  }, [active, name]);

  if (!active || !payload || !payload.length || closed) {
    return null;
  }

  const { value, payload: data } = payload[0];
  const safeValue = value != null ? value : 0;
  const actionHint =
    showActionHint &&
    (data?.key !== null || showActionLabelForNull) &&
    getActionHint(customActionLabel, isMobile, t);

  return (
    <ChartTooltipContainer className="pointer-events-none">
      <div className="flex justify-between gap-2">
        <ChartTooltipHeader>{name}</ChartTooltipHeader>
        {isMobile && (
          <button
            type="button"
            title={t("graphs.pieChart.close")}
            className="flex pointer-events-auto"
            onClick={() => setClosed(true)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <ChartTooltipList
        entries={[
          {
            dataKey: "val",
            name: t("graphs.pieChart.emissions"),
            value: safeValue,
          },
          ...(data?.total && showPercentage
            ? [
                {
                  dataKey: "pct",
                  name: percentageLabel || t("graphs.pieChart.ofTotal"),
                  value: safeValue / data.total,
                },
              ]
            : []),
        ]}
        currentLanguage={currentLanguage}
        formatValue={(entry) =>
          entry.dataKey === "val"
            ? `${formatEmissionsAbsolute(Math.round(safeValue), currentLanguage)} ${t("emissionsUnit")}`
            : formatPercent(entry.value ?? 0, currentLanguage)
        }
      />

      {actionHint && <p className="italic text-blue-2 mt-2">{actionHint}</p>}
    </ChartTooltipContainer>
  );
};

export default PieTooltip;

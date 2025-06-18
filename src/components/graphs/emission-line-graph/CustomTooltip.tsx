import { FC } from "react";
import { TooltipProps } from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute } from "@/utils/localizeUnit";
import { DataView } from "./EmissionsLineGraph";

interface CustomTooltipProps extends TooltipProps<number, string> {
  dataView: DataView;
  hiddenItems: Set<string>;
  tooltipProps?: {
    showApproximated?: boolean;
    showGap?: boolean;
  };
}

export const CustomTooltip: FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  dataView,
  hiddenItems,
  tooltipProps = {},
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Sectors view
  if (dataView === "sectors") {
    return (
      <div className="bg-black-1 px-4 py-3 rounded-level-2">
        <div className="text-sm font-medium mb-2">{label}</div>
        {payload.map((entry) => {
          if (hiddenItems.has(entry.dataKey as string)) {
            return null;
          }

          return (
            <div key={entry.dataKey} className="text-sm">
              <span className="text-grey mr-2">{entry.dataKey}:</span>
              <span style={{ color: entry.color }}>
                {formatEmissionsAbsolute(
                  entry.value as number,
                  currentLanguage,
                )}{" "}
                {t("emissionsUnitCO2")}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Overview view
  if (dataView === "overview") {
    const hasActual = payload.some(
      (entry) => entry.dataKey === "total" && entry.value != null,
    );

    const filteredPayload = hasActual
      ? payload.filter((entry) => entry.dataKey !== "approximated")
      : payload;

    const isApproximated = filteredPayload.some(
      (entry) => entry.dataKey === "approximated" && entry.value != null,
    );

    const displayPayload = isApproximated
      ? filteredPayload.filter((entry) => entry.dataKey === "approximated")
      : filteredPayload;

    return (
      <div className="bg-black-1 px-4 py-3 rounded-level-2">
        <div className="text-sm font-medium mb-2">{label}</div>
        {displayPayload.map((entry) => {
          if (entry.dataKey === "gap") {
            return null;
          }
          return (
            <div key={entry.dataKey} className="text-sm">
              <span className="text-grey mr-2">
                {t(`municipalities.graph.${entry.dataKey}`)}:
              </span>
              <span style={{ color: entry.color }}>
                {formatEmissionsAbsolute(
                  entry.value as number,
                  currentLanguage,
                )}{" "}
                {t("emissionsUnitCO2")}
              </span>
            </div>
          );
        })}
        {isApproximated && (
          <div className="text-xs text-blue-2 mt-2">
            {t("municipalities.graph.estimatedValue")}
          </div>
        )}
      </div>
    );
  }

  // Scopes and Categories view
  return (
    <div className="bg-black-1 px-4 py-3 rounded-level-2">
      <div className="text-sm font-medium mb-2">{label}</div>
      {payload.map((entry) => {
        if (entry.dataKey === "gap") {
          return null;
        }
        return (
          <div key={entry.dataKey} className="text-sm">
            <span className="text-grey mr-2">{entry.name}:</span>
            <span style={{ color: entry.color }}>
              {formatEmissionsAbsolute(entry.value as number, currentLanguage)}{" "}
              {t("emissionsUnitCO2")}
            </span>
          </div>
        );
      })}
    </div>
  );
};

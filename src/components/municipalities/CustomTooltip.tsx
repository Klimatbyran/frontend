import { FC } from "react";
import { TooltipProps } from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute } from "@/utils/localizeUnit";
import { useMunicipalitySectors } from "@/hooks/useMunicipalitySectors";

interface CustomTooltipProps extends TooltipProps<number, string> {
  dataView: "overview" | "sectors";
  hiddenSectors: Set<string>;
}

export const CustomTooltip: FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  dataView,
  hiddenSectors,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { getSectorInfo } = useMunicipalitySectors();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  if (dataView === "sectors") {
    return (
      <div className="bg-black-1 px-4 py-3 rounded-level-2">
        <div className="text-sm font-medium mb-2">{label}</div>
        {payload.map((entry) => {
          if (hiddenSectors.has(entry.dataKey as string)) {
            return null;
          }

          const sectorName = entry.dataKey as string;
          const sectorInfo = getSectorInfo
            ? getSectorInfo(sectorName)
            : { translatedName: sectorName };

          return (
            <div key={entry.dataKey} className="text-sm">
              <span className="text-grey mr-2">
                {sectorInfo.translatedName}:
              </span>
              <span style={{ color: entry.color }}>
                {formatEmissionsAbsolute(
                  entry.value as number,
                  currentLanguage,
                )}{" "}
                {t("emissionsUnit")}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

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
              {formatEmissionsAbsolute(entry.value as number, currentLanguage)}{" "}
              {t("emissionsUnit")}
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
};

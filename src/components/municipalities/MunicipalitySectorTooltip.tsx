import React, { useEffect, useState } from "react";
import { TooltipProps } from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute, formatPercent } from "@/utils/localizeUnit";
import { useScreenSize } from "@/hooks/useScreenSize";
import { X } from "lucide-react";

interface MunicipalitySectorTooltipProps extends TooltipProps<number, string> {
  filteredSectors: Set<string>;
}

export const MunicipalitySectorTooltip: React.FC<
  MunicipalitySectorTooltipProps
> = ({ active, payload, filteredSectors }) => {
  const [closed, setClosed] = useState(false);
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Reset closed state when tooltip is re-activated or payload changes
  useEffect(() => {
    if (active) {
      setClosed(false);
    }
  }, [active]);

  if (!active || !payload || !payload.length || closed) {
    return null;
  }

  const data = payload[0].payload;

  const safeValue = data.value != null ? data.value : 0;
  const safeTotal = data.total != null ? data.total : 1;
  const percentage = formatPercent(safeValue / safeTotal, currentLanguage);
  
  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-4 text-white">
      <div className="flex justify-end items-center relative z-30">
        {isMobile && (
          <button
            title="Close"
            className="flex"
            style={{ pointerEvents: "auto" }}
            onClick={() => setClosed(true)}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <p className="text-sm font-medium mb-1">{data.translatedName}</p>
      <div className="text-sm text-grey">
        {formatEmissionsAbsolute(data.value, currentLanguage)}{" "}
        {t("emissionsUnit")}
      </div>
        {safeTotal && (
          <div>
            {percentage} {t("municipalities.graph.ofTotal")}
          </div>
        )}
      <div className="text-xs italic text-blue-2 mt-2">
        {t(
          `municipalityDetailPage.sectorChart.${
            filteredSectors.has(data.name) ? "clickToShow" : "clickToFilter"
          }`,
        )}
      </div>
    </div>
  );
};

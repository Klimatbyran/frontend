import React, { useState, useEffect } from "react";
import { TooltipProps } from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";
import { useScreenSize } from "@/hooks/useScreenSize";
import { X } from "lucide-react";

interface CompanyPieTooltipProps extends TooltipProps<number, string> {
  customActionLabel?: string;
  showPercentage?: boolean;
  percentageLabel?: string;
}

const CompanyPieTooltip: React.FC<CompanyPieTooltipProps> = ({
  active,
  payload,
  customActionLabel,
  showPercentage = true,
  percentageLabel,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const [closed, setClosed] = useState(false);

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
  const safeTotal = data.total != null ? data.total : 1;
  const percentage = formatPercent(safeValue / safeTotal, currentLanguage);

  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-4 text-white">
      <div className="flex justify-end items-center relative z-30">
        {isMobile && (
          <button
            className="flex"
            style={{ pointerEvents: "auto" }}
            onClick={() => setClosed(true)}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <p className="text-sm font-medium mb-1">{name}</p>
      <div className="text-sm text-grey">
        <div>
          {formatEmissionsAbsolute(Math.round(safeValue), currentLanguage)}{" "}
          {t("emissionsUnit")}
        </div>
        {showPercentage && safeTotal && (
          <div>
            {percentage}{" "}
            {percentageLabel || t("companiesPage.sectorGraphs.ofTotal")}
          </div>
        )}
        <p className="text-xs italic text-blue-2 mt-2">
          {customActionLabel
            ? customActionLabel
            : t("companies.scope3Chart.clickToFilter")}
        </p>
      </div>
    </div>
  );
};

export default CompanyPieTooltip;

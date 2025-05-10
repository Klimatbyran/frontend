import React from "react";
import { TooltipProps } from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute, formatPercent } from "@/utils/localizeUnit";

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

  if (!active || !payload || !payload.length) {
    return null;
  }

  const { name, value, payload: data } = payload[0];
  const percentage = formatPercent(
    value ? value / data.total : 0,
    currentLanguage,
  );

  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-4 text-white">
      <p className="text-sm font-medium mb-1">{name}</p>
      <div className="text-sm text-grey">
        <div>
          {formatEmissionsAbsolute(Math.round(value || 0), currentLanguage)}{" "}
          {t("emissionsUnit")}
        </div>
        {showPercentage && data.total && (
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

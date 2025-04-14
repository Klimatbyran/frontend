import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute, formatPercent } from "@/utils/localizeUnit";
import React from "react";
import { useTranslation } from "react-i18next";
import { TooltipProps } from "recharts";

const PieChartTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!active || !payload || !payload.length) return null;

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
        <div>
          {percentage} {t("companiesPage.sectorGraphs.ofTotal")}
        </div>
      </div>
    </div>
  );
};

export default PieChartTooltip;

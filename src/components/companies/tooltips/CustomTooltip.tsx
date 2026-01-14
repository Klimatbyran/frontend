import React from "react";
import { useTranslation } from "react-i18next";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!active || !payload || !payload.length) {
    return null;
  }

  // Group payload items by sector and calculate totals
  const sectorTotals: { [key: string]: { total: number; color: string } } = {};

  payload.forEach((item) => {
    if (!item.dataKey || typeof item.dataKey !== "string") return;
    if (!item.value || item.value <= 0) return; // Skip undefined, null, or zero values

    const [sector] = item.dataKey.split("_scope");
    if (!sectorTotals[sector]) {
      sectorTotals[sector] = { total: 0, color: item.color || "#888888" };
    }
    sectorTotals[sector].total += item.value;
  });

  const yearTotal = Object.values(sectorTotals).reduce(
    (sum, { total }) => sum + total,
    0,
  );

  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-4 text-white min-w-[350px] z-50 relative">
      <p className="text-lg font-medium mb-3 border-b border-black-1 pb-2">
        {label}
      </p>
      <div className="space-y-2 mb-4">
        {Object.entries(sectorTotals).map(([sector, { total, color }]) => (
          <div key={sector} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium">{sector}</span>
            </div>
            <div className="text-xs text-grey">
              {formatEmissionsAbsolute(Math.round(total), currentLanguage)}{" "}
              {t("emissionsUnit")}
              <span className="ml-1">
                (
                {formatPercent(
                  yearTotal > 0 ? total / yearTotal : 0,
                  currentLanguage,
                )}
                )
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-black-1">
        <div className="flex justify-between text-sm">
          <span className="text-grey font-medium">
            {t("companyDetailPage.sectorGraphs.yearTotal")}
          </span>
          <span className="font-medium">
            {formatEmissionsAbsolute(Math.round(yearTotal), currentLanguage)}{" "}
            {t("emissionsUnit")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomTooltip;

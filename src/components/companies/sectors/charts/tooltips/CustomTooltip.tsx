import React from "react";
import { TooltipProps } from "recharts";
import { useTranslation } from "react-i18next";
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;
  const { t } = useTranslation();

  // Group payload items by sector and calculate totals
  const sectorTotals: { [key: string]: { total: number; color: string } } = {};

  payload.forEach((item) => {
    if (!item.dataKey || typeof item.dataKey !== "string") return;

    const [sector] = item.dataKey.split("_scope");
    if (!sectorTotals[sector]) {
      sectorTotals[sector] = { total: 0, color: item.color || "#888888" };
    }
    sectorTotals[sector].total += item.value || 0;
  });

  const yearTotal = Object.values(sectorTotals).reduce(
    (sum, { total }) => sum + total,
    0
  );

  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-4 text-white min-w-[350px]">
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
              {Math.round(total).toLocaleString()} tCO₂e
              <span className="ml-1">
                ({((total / yearTotal) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-black-1">
        <div className="flex justify-between text-sm">
          <span className="text-grey font-medium">
            {t("companies.sectorGraphs.yearTotal")}
          </span>
          <span className="font-medium">
            {Math.round(yearTotal).toLocaleString()} tCO₂e
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomTooltip;

import React from "react";
import { TooltipProps } from "recharts";

const PieChartTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || !payload.length) return null;

  const { name, value, payload: data } = payload[0];
  const percentage = value ? ((value / data.total) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-4 text-white">
      <p className="text-sm font-medium mb-1">{name}</p>
      <div className="text-sm text-grey">
        <div>{Math.round(value || 0).toLocaleString()} tCO₂e</div>
        <div>{percentage}% of total</div>
      </div>
    </div>
  );
};

export default PieChartTooltip;

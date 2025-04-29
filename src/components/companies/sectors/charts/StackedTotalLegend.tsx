import React from "react";

interface StackedTotalLegendProps {
  payload: Array<{
    value: string;
    color: string;
  }>;
}

const StackedTotalLegend: React.FC<StackedTotalLegendProps> = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-grey">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default StackedTotalLegend;

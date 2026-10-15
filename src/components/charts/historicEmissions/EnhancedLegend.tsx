import React from "react";
import { AiIcon } from "@/components/ui/ai-icon";
import { LegendItem } from "../../../types/charts";

interface EnhancedLegendProps {
  items: LegendItem[];
  className?: string;
}

export const EnhancedLegend: React.FC<EnhancedLegendProps> = ({
  items,
  className = "",
}) => {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {item.marker === "ai" ? (
            <AiIcon size="sm" />
          ) : (
            <div
              className="w-3 h-3 rounded flex-shrink-0"
              style={{
                backgroundColor: item.isDashed ? "transparent" : item.color,
                border: item.isDashed ? `2px solid ${item.color}` : "none",
              }}
            />
          )}
          <span className="text-sm text-white">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

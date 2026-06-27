import React from "react";
import { ChartInsight } from "@/hooks/companies/useSectorChartInsights";

interface SectorChartInsightsProps {
  insights: ChartInsight[];
}

const SectorChartInsights: React.FC<SectorChartInsightsProps> = ({
  insights,
}) => {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {insights.map((insight) => {
        const Icon = insight.icon;

        return (
          <div
            key={insight.title}
            className="bg-black-2 rounded-lg p-6 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${insight.bgColor}`}>
                <Icon className={`h-5 w-5 ${insight.iconColor}`} />
              </div>
              <h3 className="text-sm font-medium text-white">{insight.title}</h3>
            </div>
            <p className="text-sm text-grey">{insight.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SectorChartInsights;

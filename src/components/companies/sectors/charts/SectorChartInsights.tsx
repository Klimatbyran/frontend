import React from "react";
import { ChartInsight } from "@/hooks/companies/useSectorChartInsights";
import { InsightBarChart, InsightStackedBar } from "./InsightVisualization";

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
            className="bg-black-2 rounded-lg border p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${insight.bgColor}`}>
                <Icon className={`h-5 w-5 ${insight.iconColor}`} />
              </div>
              <h3 className="text-sm font-medium text-white">
                {insight.title}
              </h3>
            </div>

            {(insight.stat || insight.statLabel) && (
              <div>
                {insight.stat && (
                  <div className="text-3xl font-light text-white">
                    {insight.stat}
                  </div>
                )}
                {insight.statLabel && (
                  <div className="text-sm text-grey mt-1">
                    {insight.statLabel}
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-grey">{insight.description}</p>

            {insight.bars && insight.bars.length > 0 && (
              <InsightBarChart bars={insight.bars} />
            )}

            {insight.segments && insight.segments.length > 0 && (
              <InsightStackedBar segments={insight.segments} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SectorChartInsights;

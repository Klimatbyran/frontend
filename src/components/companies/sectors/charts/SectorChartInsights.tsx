import React from "react";
import { motion } from "framer-motion";
import { ChartInsight } from "@/hooks/companies/useSectorChartInsights";
import { useChartMotion } from "@/hooks/useChartMotion";
import { InsightBarChart, InsightStackedBar } from "./InsightVisualization";

interface SectorChartInsightsProps {
  insights: ChartInsight[];
  animationKey?: string;
}

const SectorChartInsights: React.FC<SectorChartInsightsProps> = ({
  insights,
  animationKey = "default",
}) => {
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {insights.map((insight, index) => {
        const Icon = insight.icon;

        return (
          <motion.div
            key={`${animationKey}-${insight.title}`}
            className="bg-black-2 rounded-lg border p-6 space-y-4"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: fadeDuration,
              delay: stagger(index, 0.12),
              ease,
            }}
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
                  <motion.div
                    key={`${animationKey}-${insight.stat}`}
                    className="text-3xl font-light text-white"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: fadeDuration, ease }}
                  >
                    {insight.stat}
                  </motion.div>
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
          </motion.div>
        );
      })}
    </div>
  );
};

export default SectorChartInsights;

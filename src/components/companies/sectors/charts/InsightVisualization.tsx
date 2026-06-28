import React from "react";
import { motion } from "framer-motion";
import {
  InsightBar,
  InsightSegment,
} from "@/hooks/companies/useSectorChartInsights";
import { useChartMotion } from "@/hooks/useChartMotion";

interface InsightBarChartProps {
  bars: InsightBar[];
  showValues?: boolean;
}

export const InsightBarChart: React.FC<InsightBarChartProps> = ({
  bars,
  showValues = true,
}) => {
  const { reduceMotion, barDuration, fadeDuration, stagger, ease } =
    useChartMotion();

  if (bars.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      {bars.map((bar, index) => (
        <motion.div
          key={bar.label}
          className="space-y-1"
          initial={reduceMotion ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: fadeDuration,
            delay: stagger(index, 0.06),
            ease,
          }}
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-white truncate">{bar.label}</span>
            {showValues && (
              <span className="text-grey shrink-0">{bar.valueLabel}</span>
            )}
          </div>
          <div className="h-2 rounded-full bg-black-1 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{
                width: `${Math.max(bar.share * 100, 2)}%`,
              }}
              transition={{
                duration: barDuration,
                delay: stagger(index, 0.08),
                ease,
              }}
              style={{ backgroundColor: bar.color }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface InsightStackedBarProps {
  segments: InsightSegment[];
}

export const InsightStackedBar: React.FC<InsightStackedBarProps> = ({
  segments,
}) => {
  const { reduceMotion, barDuration, fadeDuration, stagger, ease } =
    useChartMotion();
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);

  if (total === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex h-2.5 rounded-full overflow-hidden bg-black-1">
        {segments.map((segment, index) => {
          if (segment.count === 0) {
            return null;
          }

          return (
            <motion.div
              key={segment.label}
              className="h-full origin-left"
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: barDuration,
                delay: stagger(index, 0.1),
                ease,
              }}
              style={{
                width: `${(segment.count / total) * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.label}
            className="flex items-center gap-1.5 text-xs text-grey"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: fadeDuration,
              delay: stagger(index, 0.05),
              ease,
            }}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span>
              {segment.label}{" "}
              <span className="text-white">
                {segment.displayValue ?? segment.count}
              </span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

import { useTranslation } from "react-i18next";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { NationLayerComparison } from "@/utils/data/nationStoryMetrics";
import {
  formatMton,
  NATION_BASELINE_YEAR,
} from "@/utils/data/nationStoryMetrics";
import { formatPercentChange } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

function LayerRow({
  layer,
  latestYear,
  maxMton,
  scrollYProgress,
  range,
}: {
  layer: NationLayerComparison;
  latestYear: number;
  maxMton: number;
  scrollYProgress: MotionValue<number>;
  range: [number, number];
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const rowProgress = useTransform(scrollYProgress, range, [0, 1]);
  const opacity = useTransform(rowProgress, [0, 0.3, 1], [0, 1, 1]);
  const slideX = useTransform(rowProgress, [0, 0.4], [-30, 0]);
  const bar1990Width = useTransform(
    rowProgress,
    [0.1, 0.55],
    ["0%", `${(layer.mton1990 / maxMton) * 100}%`],
  );
  const barLatestWidth = useTransform(
    rowProgress,
    [0.25, 0.7],
    ["0%", `${(layer.mtonLatest / maxMton) * 100}%`],
  );

  return (
    <motion.div
      style={{ opacity, x: slideX }}
      className="space-y-3 py-6 border-b border-white/10 last:border-0"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h3 className="text-lg md:text-xl text-white font-light flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: layer.color }}
          />
          {t(layer.labelKey)}
        </h3>
        <span
          className={`text-sm font-medium ${
            layer.changePercent <= 0 ? "text-green-3" : "text-pink-3"
          }`}
        >
          {formatPercentChange(layer.changePercent, currentLanguage, true)}{" "}
          {t("nation.story.comparisons.since1990")}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-grey w-12 shrink-0">
            {NATION_BASELINE_YEAR}
          </span>
          <div className="flex-1 h-8 bg-black-2 rounded-md overflow-hidden">
            <motion.div
              className="h-full rounded-md"
              style={{
                width: bar1990Width,
                backgroundColor: layer.color,
                opacity: 0.55,
              }}
            />
          </div>
          <span className="text-xs text-grey w-20 text-right shrink-0">
            {formatMton(layer.mton1990, currentLanguage, 0)}{" "}
            {t("nation.story.unit.mton")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-grey w-12 shrink-0">{latestYear}</span>
          <div className="flex-1 h-8 bg-black-2 rounded-md overflow-hidden">
            <motion.div
              className="h-full rounded-md"
              style={{
                width: barLatestWidth,
                backgroundColor: layer.color,
              }}
            />
          </div>
          <span className="text-xs text-white w-20 text-right shrink-0">
            {formatMton(layer.mtonLatest, currentLanguage, 0)}{" "}
            {t("nation.story.unit.mton")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

type NationLayerComparisonsProps = {
  layers: NationLayerComparison[];
  latestYear: number;
  maxMton: number;
  scrollYProgress: MotionValue<number>;
};

export function NationLayerComparisons({
  layers,
  latestYear,
  maxMton,
  scrollYProgress,
}: NationLayerComparisonsProps) {
  const { t } = useTranslation();

  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.15], [30, 0]);

  const mainLayers = layers.filter((l) => l.key !== "exportOfOilProducts");
  const rowRanges: [number, number][] = [
    [0.1, 0.45],
    [0.28, 0.63],
    [0.46, 0.81],
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        style={{ opacity: headerOpacity, y: headerY }}
        className="mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          {t("nation.story.comparisons.title")}
        </h2>
        <p className="text-grey text-lg">
          {t("nation.story.comparisons.description")}
        </p>
      </motion.div>

      <div>
        {mainLayers.map((layer, index) => (
          <LayerRow
            key={layer.key}
            layer={layer}
            latestYear={latestYear}
            maxMton={maxMton}
            scrollYProgress={scrollYProgress}
            range={rowRanges[index] ?? [0.1, 0.45]}
          />
        ))}
      </div>
    </div>
  );
}

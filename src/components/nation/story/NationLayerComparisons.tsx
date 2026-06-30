import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { NationLayerComparison } from "@/utils/data/nationStoryMetrics";
import {
  formatMton,
  NATION_BASELINE_YEAR,
} from "@/utils/data/nationStoryMetrics";
import { formatPercentChange } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

const ROW_DELAYS = [0, 0.18, 0.36];

function LayerRow({
  layer,
  latestYear,
  maxMton,
  delay,
}: {
  layer: NationLayerComparison;
  latestYear: number;
  maxMton: number;
  delay: number;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.45, delay }}
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
            layer.changePercent <= 0 ? "text-blue-3" : "text-pink-3"
          }`}
        >
          {formatPercentChange(layer.changePercent, currentLanguage)}{" "}
          {t("nation.story.comparisons.since1990")}
        </span>
      </div>

      <div className="space-y-2">
        {/* 1990 bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-grey w-12 shrink-0">
            {NATION_BASELINE_YEAR}
          </span>
          <div className="flex-1 h-8 bg-black-2 rounded-md overflow-hidden">
            <motion.div
              className="h-full rounded-md"
              style={{ backgroundColor: layer.color, opacity: 0.5 }}
              initial={{ width: "0%" }}
              whileInView={{
                width: `${(layer.mton1990 / maxMton) * 100}%`,
              }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: delay + 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </div>
          <span className="text-xs text-grey w-20 text-right shrink-0">
            {formatMton(layer.mton1990, currentLanguage, 0)}{" "}
            {t("nation.story.unit.mton")}
          </span>
        </div>
        {/* Latest bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-grey w-12 shrink-0">{latestYear}</span>
          <div className="flex-1 h-8 bg-black-2 rounded-md overflow-hidden">
            <motion.div
              className="h-full rounded-md"
              style={{ backgroundColor: layer.color }}
              initial={{ width: "0%" }}
              whileInView={{
                width: `${(layer.mtonLatest / maxMton) * 100}%`,
              }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: delay + 0.2,
                ease: [0.16, 1, 0.3, 1],
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
};

export function NationLayerComparisons({
  layers,
  latestYear,
  maxMton,
}: NationLayerComparisonsProps) {
  const { t } = useTranslation();
  const mainLayers = layers.filter((l) => l.key !== "exportOfOilProducts");

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          {t("nation.story.comparisons.title")}
        </h2>
        <p className="text-grey text-lg">
          {t("nation.story.comparisons.description")}
        </p>
      </div>
      <div>
        {mainLayers.map((layer, index) => (
          <LayerRow
            key={layer.key}
            layer={layer}
            latestYear={latestYear}
            maxMton={maxMton}
            delay={ROW_DELAYS[index] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

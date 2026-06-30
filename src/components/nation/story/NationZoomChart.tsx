import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";

const LAYERS = [
  {
    key: "territorial" as const,
    color: "var(--orange-2)",
    labelKey: "nation.story.graph.territorialFossil",
    captionKey: "nation.story.zoom.phase1",
    getMton: (m: NationStoryMetrics) => m.territorialLatestMton,
  },
  {
    key: "biogenic" as const,
    color: "var(--green-3)",
    labelKey: "nation.story.graph.biogenic",
    captionKey: "nation.story.zoom.phase2",
    getMton: (m: NationStoryMetrics) => m.biogenicLatestMton,
  },
  {
    key: "consumption" as const,
    color: "var(--pink-3)",
    labelKey: "nation.story.graph.consumptionAbroad",
    captionKey: "nation.story.zoom.phase3",
    getMton: (m: NationStoryMetrics) => m.consumptionLatestMton,
  },
];

const MAX_RADIUS = 80;
// Time (s) each bubble waits before appearing, so they introduce one by one
const STEP_DELAY = 0.9;

type NationZoomChartProps = {
  metrics: NationStoryMetrics;
};

export function NationZoomChart({ metrics }: NationZoomChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const maxMton = Math.max(...LAYERS.map((l) => l.getMton(metrics)));

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      {LAYERS.map((layer, i) => {
        const mton = layer.getMton(metrics);
        const diameter = Math.sqrt(mton / maxMton) * MAX_RADIUS * 2;
        const delay = i * STEP_DELAY;

        return (
          <div key={layer.key} className="flex items-center gap-5 md:gap-8">
            {/* Bubble */}
            <motion.div
              className="relative flex items-center justify-center shrink-0"
              style={{
                width: diameter,
                height: diameter,
                borderRadius: "50%",
                backgroundColor: layer.color,
                opacity: 0.9,
              }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay }}
            >
              <span className="text-black font-bold text-sm md:text-lg tabular-nums select-none leading-tight text-center">
                {formatMton(mton, currentLanguage, 0)}
                <br />
                <span className="text-[10px] md:text-xs font-medium">
                  {t("nation.story.unit.mton")}
                </span>
              </span>
            </motion.div>

            {/* Text introduced together with its bubble */}
            <motion.div
              className="flex-1 space-y-1"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.4, delay: delay + 0.15 }}
            >
              <p className="flex items-center gap-2 text-white font-medium">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                {t(layer.labelKey)}
              </p>
              <p className="text-sm md:text-base text-grey leading-relaxed">
                {t(layer.captionKey)}
              </p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

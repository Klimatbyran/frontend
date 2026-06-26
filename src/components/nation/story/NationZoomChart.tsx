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
    getMton: (m: NationStoryMetrics) => m.territorialLatestMton,
  },
  {
    key: "biogenic" as const,
    color: "var(--green-2)",
    labelKey: "nation.story.graph.biogenic",
    getMton: (m: NationStoryMetrics) => m.biogenicLatestMton,
  },
  {
    key: "consumption" as const,
    color: "var(--blue-2)",
    labelKey: "nation.story.graph.consumptionAbroad",
    getMton: (m: NationStoryMetrics) => m.consumptionLatestMton,
  },
];

const MAX_RADIUS = 90;

type NationZoomChartProps = {
  metrics: NationStoryMetrics;
};

export function NationZoomChart({ metrics }: NationZoomChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const maxMton = Math.max(...LAYERS.map((l) => l.getMton(metrics)));

  return (
    <div className="flex flex-col items-center gap-10 w-full">
      <p className="text-xl md:text-2xl text-center text-grey max-w-2xl font-light">
        {t("nation.story.zoom.phase3")}
      </p>

      <div className="flex flex-col items-center gap-2">
        {/* Top row: territorial + biogenic */}
        <div className="flex items-end justify-center gap-4 md:gap-6">
          {LAYERS.slice(0, 2).map((layer, i) => {
            const mton = layer.getMton(metrics);
            const radius = Math.sqrt(mton / maxMton) * MAX_RADIUS;
            const diameter = radius * 2;
            return (
              <div key={layer.key} className="flex flex-col items-center gap-3">
                <motion.div
                  style={{
                    width: diameter,
                    height: diameter,
                    borderRadius: "50%",
                    backgroundColor: layer.color,
                    opacity: 0.85,
                  }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: false, amount: 0.4 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18, delay: i * 0.25 }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.4 }}
                  transition={{ duration: 0.4, delay: i * 0.25 + 0.1 }}
                  className="text-center space-y-0.5"
                >
                  <p className="text-white text-sm font-medium tabular-nums">
                    {formatMton(mton, currentLanguage, 0)}{" "}
                    {t("nation.story.unit.mton")}
                  </p>
                  <p className="text-xs text-grey max-w-[110px] leading-snug">
                    {t(layer.labelKey)}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Bottom: consumption abroad (largest) centered */}
        {(() => {
          const layer = LAYERS[2];
          const mton = layer.getMton(metrics);
          const radius = Math.sqrt(mton / maxMton) * MAX_RADIUS;
          const diameter = radius * 2;
          return (
            <div className="flex flex-col items-center gap-3 -mt-3">
              <motion.div
                style={{
                  width: diameter,
                  height: diameter,
                  borderRadius: "50%",
                  backgroundColor: layer.color,
                  opacity: 0.85,
                }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.5 }}
              />
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="text-center space-y-0.5"
              >
                <p className="text-white text-sm font-medium tabular-nums">
                  {formatMton(mton, currentLanguage, 0)}{" "}
                  {t("nation.story.unit.mton")}
                </p>
                <p className="text-xs text-grey max-w-[130px] leading-snug">
                  {t(layer.labelKey)}
                </p>
              </motion.div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

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

  const bubbles = LAYERS.map((layer) => {
    const mton = layer.getMton(metrics);
    const radius = Math.sqrt(mton / maxMton) * MAX_RADIUS;
    return { ...layer, mton, diameter: radius * 2 };
  });

  const renderBubble = (
    b: (typeof bubbles)[0],
    delay: number,
    extraStyle?: React.CSSProperties,
  ) => (
    <motion.div
      key={b.key}
      className="relative flex items-center justify-center"
      style={{
        width: b.diameter,
        height: b.diameter,
        borderRadius: "50%",
        backgroundColor: b.color,
        opacity: 0.85,
        flexShrink: 0,
        ...extraStyle,
      }}
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 200, damping: 18, delay }}
    >
      <span className="text-black font-bold text-base md:text-xl tabular-nums select-none">
        {formatMton(b.mton, currentLanguage, 0)}
      </span>
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex flex-col gap-3 max-w-2xl text-center">
        {[
          t("nation.story.zoom.phase1"),
          t("nation.story.zoom.phase2"),
          t("nation.story.zoom.phase3"),
        ].map((caption, i) => (
          <motion.p
            key={i}
            className="text-base md:text-lg text-grey font-light leading-relaxed"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.4, delay: i * 0.25 }}
          >
            {caption}
          </motion.p>
        ))}
      </div>

      {/* Pyramid: two on top, largest centered below */}
      <div className="flex flex-col items-center">
        <div className="flex items-end justify-center gap-4 md:gap-6">
          {bubbles.slice(0, 2).map((b, i) => renderBubble(b, i * 0.25))}
        </div>
        {renderBubble(bubbles[2], 0.5, { marginTop: "-14px" })}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {bubbles.map((b, i) => {
          return (
            <motion.div
              key={b.key}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.35, delay: i * 0.25 + 0.15 }}
              className="flex items-center gap-3"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: b.color }}
              />
              <span className="text-sm text-grey flex-1">{t(b.labelKey)}</span>
              <span className="text-sm text-white font-medium tabular-nums shrink-0">
                {formatMton(b.mton, currentLanguage, 0)}{" "}
                {t("nation.story.unit.mton")}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

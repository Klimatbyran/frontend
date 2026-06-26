import { useTranslation } from "react-i18next";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useState } from "react";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";

const LAYERS = [
  {
    key: "territorial" as const,
    color: "var(--orange-2)",
    labelKey: "nation.story.graph.territorialFossil",
    getMton: (m: NationStoryMetrics) => m.territorialLatestMton,
    range: [0, 0.22] as [number, number],
    phase: 0,
  },
  {
    key: "biogenic" as const,
    color: "var(--green-2)",
    labelKey: "nation.story.graph.biogenic",
    getMton: (m: NationStoryMetrics) => m.biogenicLatestMton,
    range: [0.18, 0.42] as [number, number],
    phase: 1,
  },
  {
    key: "consumption" as const,
    color: "var(--blue-2)",
    labelKey: "nation.story.graph.consumptionAbroad",
    getMton: (m: NationStoryMetrics) => m.consumptionLatestMton,
    range: [0.38, 0.62] as [number, number],
    phase: 2,
  },
];

const MAX_RADIUS = 90; // px for the largest bubble

type NationZoomChartProps = {
  metrics: NationStoryMetrics;
  scrollYProgress: MotionValue<number>;
};

export function NationZoomChart({
  metrics,
  scrollYProgress,
}: NationZoomChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [phase, setPhase] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v < 0.18) setPhase(0);
    else if (v < 0.38) setPhase(1);
    else setPhase(2);
  });

  const maxMton = Math.max(...LAYERS.map((l) => l.getMton(metrics)));

  const bubbleScales = LAYERS.map((layer) =>
    useTransform(scrollYProgress, layer.range, [0, 1]),
  );

  const captions = [
    t("nation.story.zoom.phase1"),
    t("nation.story.zoom.phase2"),
    t("nation.story.zoom.phase3"),
  ];

  return (
    <div className="flex flex-col items-center gap-10 w-full">
      {/* Caption */}
      <p className="text-xl md:text-2xl text-center text-grey max-w-2xl min-h-[3.5rem] font-light">
        {captions[phase]}
      </p>

      {/* Bubbles */}
      <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
        {LAYERS.map((layer, i) => {
          const mton = layer.getMton(metrics);
          const radius = Math.sqrt(mton / maxMton) * MAX_RADIUS;
          const diameter = radius * 2;

          return (
            <div key={layer.key} className="flex flex-col items-center gap-4">
              <motion.div
                style={{
                  width: diameter,
                  height: diameter,
                  borderRadius: "50%",
                  backgroundColor: layer.color,
                  opacity: 0.85,
                  scale: bubbleScales[i],
                }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              />
              <motion.div
                style={{ opacity: bubbleScales[i] }}
                className="text-center space-y-1"
              >
                <p className="text-white text-sm md:text-base font-medium tabular-nums">
                  {formatMton(mton, currentLanguage, 0)}{" "}
                  {t("nation.story.unit.mton")}
                </p>
                <p className="text-xs text-grey max-w-[130px] leading-snug">
                  {t(layer.labelKey)}
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

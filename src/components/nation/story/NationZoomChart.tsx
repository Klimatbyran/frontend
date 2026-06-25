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
    // Grows from progress 0→0.33
    range: [0, 0.4] as [number, number],
    phase: 0,
  },
  {
    key: "biogenic" as const,
    color: "var(--green-2)",
    labelKey: "nation.story.graph.biogenic",
    getMton: (m: NationStoryMetrics) => m.biogenicLatestMton,
    // Grows from progress 0.3→0.65
    range: [0.3, 0.65] as [number, number],
    phase: 1,
  },
  {
    key: "consumption" as const,
    color: "var(--blue-2)",
    labelKey: "nation.story.graph.consumptionAbroad",
    getMton: (m: NationStoryMetrics) => m.consumptionLatestMton,
    // Grows from progress 0.6→0.95
    range: [0.6, 0.95] as [number, number],
    phase: 2,
  },
];

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
    if (v < 0.3) setPhase(0);
    else if (v < 0.6) setPhase(1);
    else setPhase(2);
  });

  const maxMton = metrics.combinedLatestMton;
  const barMaxHeight = 280;

  const barScales = LAYERS.map((layer) =>
    useTransform(scrollYProgress, layer.range, [0, 1]),
  );

  const captions = [
    t("nation.story.zoom.phase1"),
    t("nation.story.zoom.phase2"),
    t("nation.story.zoom.phase3"),
  ];

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <p className="text-xl md:text-2xl text-center text-grey max-w-2xl min-h-[4rem] font-light">
        {captions[phase]}
      </p>

      <div className="flex items-end justify-center gap-6 md:gap-10 w-full">
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex flex-col-reverse items-stretch w-24 md:w-32 rounded-t-lg overflow-hidden border border-white/10"
            style={{ height: barMaxHeight }}
          >
            {LAYERS.map((layer, i) => (
              <motion.div
                key={layer.key}
                style={{
                  height: `${(layer.getMton(metrics) / maxMton) * 100}%`,
                  backgroundColor: layer.color,
                  scaleY: barScales[i],
                  transformOrigin: "bottom",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend always visible */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {LAYERS.map((layer) => (
          <div key={layer.key} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: layer.color }}
            />
            <span className="text-sm text-grey">
              {t(layer.labelKey)}:{" "}
              <span className="text-white">
                {formatMton(layer.getMton(metrics), currentLanguage, 0)}{" "}
                {t("nation.story.unit.mton")}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

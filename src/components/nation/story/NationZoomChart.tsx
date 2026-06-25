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

// Section has 280vh → 180vh scrollable (at 100vh viewport).
// Spread 4 phases across the full 0–1 range.
const PHASE_RANGES = {
  territorial: [0, 0.2] as [number, number],
  biogenic: [0.22, 0.48] as [number, number],
  consumption: [0.48, 0.72] as [number, number],
  legend: [0.72, 0.92] as [number, number],
};

const PHASE_BOUNDARIES = [0.22, 0.48, 0.72];

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

  const zoomScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.48, 0.72, 1],
    [1.35, 1.1, 0.92, 0.85, 0.85],
  );
  const territorialReveal = useTransform(
    scrollYProgress,
    PHASE_RANGES.territorial,
    [0, 1],
  );
  const biogenicReveal = useTransform(
    scrollYProgress,
    PHASE_RANGES.biogenic,
    [0, 1],
  );
  const consumptionReveal = useTransform(
    scrollYProgress,
    PHASE_RANGES.consumption,
    [0, 1],
  );
  const legendReveal = useTransform(
    scrollYProgress,
    PHASE_RANGES.legend,
    [0, 1],
  );

  // Caption fades between phases
  const captionOpacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.22, 0.44, 0.48, 0.68, 0.72, 0.88, 0.92, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
  );

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v < PHASE_BOUNDARIES[0]) setPhase(0);
    else if (v < PHASE_BOUNDARIES[1]) setPhase(1);
    else if (v < PHASE_BOUNDARIES[2]) setPhase(2);
    else setPhase(3);
  });

  const maxMton = metrics.combinedLatestMton;
  const barMaxHeight = 260;

  const captions = [
    t("nation.story.zoom.phase1"),
    t("nation.story.zoom.phase2"),
    t("nation.story.zoom.phase3"),
    t("nation.story.zoom.phase4", {
      ratio: metrics.ratioReportedToFull.toLocaleString(
        currentLanguage === "sv" ? "sv-SE" : "en-GB",
        { maximumFractionDigits: 1 },
      ),
      total: formatMton(metrics.combinedLatestMton, currentLanguage, 0),
    }),
  ];

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <motion.p
        style={{ opacity: captionOpacity }}
        className="text-xl md:text-2xl text-center text-grey max-w-2xl min-h-[4rem] font-light"
      >
        {captions[phase]}
      </motion.p>

      <motion.div
        style={{ scale: zoomScale }}
        className="flex items-end justify-center gap-6 md:gap-10 w-full"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative flex flex-col-reverse items-stretch w-24 md:w-32 rounded-t-lg overflow-hidden border border-white/10"
            style={{ height: barMaxHeight }}
          >
            <motion.div
              className="w-full"
              style={{
                height: `${(metrics.territorialLatestMton / maxMton) * 100}%`,
                backgroundColor: LAYERS[0].color,
                scaleY: territorialReveal,
                transformOrigin: "bottom",
              }}
            />
            <motion.div
              className="w-full"
              style={{
                height: `${(metrics.biogenicLatestMton / maxMton) * 100}%`,
                backgroundColor: LAYERS[1].color,
                scaleY: biogenicReveal,
                transformOrigin: "bottom",
              }}
            />
            <motion.div
              className="w-full"
              style={{
                height: `${(metrics.consumptionLatestMton / maxMton) * 100}%`,
                backgroundColor: LAYERS[2].color,
                scaleY: consumptionReveal,
                transformOrigin: "bottom",
              }}
            />
          </div>
          <span className="text-xs md:text-sm text-grey text-center">
            {formatMton(metrics.combinedLatestMton, currentLanguage, 0)}{" "}
            {t("nation.story.unit.mton")}
          </span>
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: legendReveal }}
        className="flex flex-wrap justify-center gap-4 md:gap-6"
      >
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
      </motion.div>
    </div>
  );
}

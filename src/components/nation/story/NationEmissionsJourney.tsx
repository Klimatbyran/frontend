import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Warehouse } from "lucide-react";
import {
  formatMton,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import {
  NATION_STORY_COLORS,
  NATION_STORY_TEXT,
} from "@/components/nation/story/nationStoryColors";
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";
import { useReportStoryStage } from "@/components/nation/story/storyStageContext";

type JourneyStep = {
  key: string;
  labelKey: string;
  textKey: string;
  color: string;
  total: number;
  delta: number;
  layer: boolean;
  badgeKey?: string;
};

const MAX_DIAMETER = 380;
const JOURNEY_STEP_VH = 115;
const LAYER_GROW_TRANSITION = {
  type: "spring" as const,
  stiffness: 48,
  damping: 16,
  mass: 1.6,
};

function buildSteps(metrics: NationStoryMetrics): JourneyStep[] {
  const territorial = metrics.territorialLatestMton;
  const production = metrics.productionLatestMton;
  const consumption = metrics.consumptionLatestMton;
  const biogenic = metrics.biogenicLatestMton;

  return [
    {
      key: "step1",
      labelKey: "nation.story.journey.step1.label",
      textKey: "nation.story.journey.step1.text",
      color: NATION_STORY_COLORS.territorial,
      total: territorial,
      delta: territorial,
      layer: true,
    },
    {
      key: "step2",
      labelKey: "nation.story.journey.step2.label",
      textKey: "nation.story.journey.step2.text",
      color: NATION_STORY_COLORS.production,
      total: production,
      delta: production - territorial,
      layer: true,
    },
    {
      key: "step3",
      labelKey: "nation.story.journey.step3.label",
      textKey: "nation.story.journey.step3.text",
      color: NATION_STORY_COLORS.consumption,
      total: production + consumption,
      delta: consumption,
      layer: true,
    },
    {
      key: "step4",
      labelKey: "nation.story.journey.step4.label",
      textKey: "nation.story.journey.step4.text",
      color: NATION_STORY_COLORS.eCommerceRing,
      total: production + consumption,
      delta: metrics.eCommerceLatestMton,
      layer: false,
      badgeKey: "nation.story.journey.step4.badge",
    },
    {
      key: "step5",
      labelKey: "nation.story.journey.step5.label",
      textKey: "nation.story.journey.step5.text",
      color: NATION_STORY_COLORS.biogenic,
      total: production + consumption + biogenic,
      delta: biogenic,
      layer: true,
    },
  ];
}

type NationEmissionsJourneyProps = {
  metrics: NationStoryMetrics;
};

export function NationEmissionsJourney({
  metrics,
}: NationEmissionsJourneyProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const steps = buildSteps(metrics);
  const maxTotal = steps[steps.length - 1].total;
  const consumptionTotal =
    metrics.productionLatestMton + metrics.consumptionLatestMton;

  const { ref, step, sectionVh, stageStyle, mode } = usePinnedSteps(
    steps.length,
    JOURNEY_STEP_VH,
  );
  useReportStoryStage("journey", mode);

  const current = steps[step];
  const newestLayerKey = steps
    .slice(0, step + 1)
    .filter((s) => s.layer)
    .at(-1)?.key;

  const revealedLayers = steps
    .slice(0, step + 1)
    .filter((s) => s.layer)
    .sort((a, b) => b.total - a.total);

  const showECommerceMarker = step >= 3 && metrics.eCommerceLatestMton > 0;

  const diameterFor = (total: number) =>
    Math.sqrt(total / maxTotal) * MAX_DIAMETER;

  const consumptionDiameter = diameterFor(consumptionTotal);
  const eCommerceMarkerSize = Math.max(
    16,
    Math.min(
      consumptionDiameter *
        Math.sqrt(metrics.eCommerceLatestMton / metrics.consumptionLatestMton) *
        0.9,
      40,
    ),
  );

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: `${sectionVh}vh` }}
    >
      <div
        className="h-screen flex items-center px-4 md:px-8"
        style={stageStyle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center w-full max-w-5xl mx-auto">
          <div className="flex flex-col items-center">
            <div
              className="relative"
              style={{ width: MAX_DIAMETER, height: MAX_DIAMETER }}
            >
              {revealedLayers.map((layer) => {
                const d = diameterFor(layer.total);
                const isGrowingLayer = layer.key === newestLayerKey;
                return (
                  <motion.div
                    key={layer.key}
                    className="absolute left-1/2 top-1/2 rounded-full"
                    style={{ backgroundColor: layer.color, opacity: 1 }}
                    initial={
                      isGrowingLayer
                        ? { width: 0, height: 0, x: "-50%", y: "-50%" }
                        : { width: d, height: d, x: "-50%", y: "-50%" }
                    }
                    animate={{ width: d, height: d, x: "-50%", y: "-50%" }}
                    transition={
                      isGrowingLayer ? LAYER_GROW_TRANSITION : { duration: 0 }
                    }
                  />
                );
              })}

              {showECommerceMarker && (
                <motion.div
                  className="absolute flex items-center justify-center rounded-md border border-pink-1/80 bg-pink-1/25 text-pink-1 shadow-sm"
                  style={{
                    width: eCommerceMarkerSize,
                    height: eCommerceMarkerSize,
                    left: `calc(50% + ${consumptionDiameter * 0.17}px)`,
                    top: `calc(50% + ${consumptionDiameter * 0.11}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  title={t("nation.story.journey.step4.label")}
                >
                  <Warehouse
                    className="shrink-0"
                    style={{
                      width: eCommerceMarkerSize * 0.55,
                      height: eCommerceMarkerSize * 0.55,
                    }}
                    strokeWidth={2.2}
                    aria-hidden
                  />
                </motion.div>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-black font-bold text-4xl md:text-6xl tabular-nums select-none leading-none text-center">
                  {formatMton(current.total, currentLanguage, 0)}
                  <span className="block text-sm md:text-base font-semibold mt-1">
                    {t("nation.story.unit.mton")}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <p className="text-xl md:text-2xl text-white font-medium">
                {t(current.labelKey)}
              </p>
              <p
                className={`text-lg md:text-xl ${NATION_STORY_TEXT.body} leading-relaxed`}
              >
                {t(current.textKey)}
                <span className="block text-sm text-white/60 mt-2">
                  {t("nation.story.journey.dataYear", {
                    year: metrics.latestYear,
                  })}
                </span>
              </p>
              {current.badgeKey && (
                <p className="text-base md:text-lg text-pink-1 font-medium">
                  {t(current.badgeKey)}
                </p>
              )}
            </motion.div>

            <div className="space-y-1.5 border-t border-white/10 pt-3">
              {steps
                .slice(0, step + 1)
                .filter((s) => s.layer)
                .map((s, i) => (
                  <div
                    key={s.key}
                    className="flex items-center gap-2.5 text-base md:text-lg"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className={`${NATION_STORY_TEXT.secondary} flex-1`}>
                      {t(s.labelKey)}
                    </span>
                    <span className="text-white tabular-nums shrink-0">
                      {i === 0 ? "" : "+"}
                      {formatMton(s.delta, currentLanguage, 0)}{" "}
                      {t("nation.story.unit.mton")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

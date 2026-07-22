import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  formatMton,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  NATION_STORY_COLORS,
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";

type JourneyStep = {
  key: string;
  labelKey: string;
  textKey: string;
  color: string;
  /** cumulative total in Mton after this step */
  total: number;
  /** this step's own contribution in Mton */
  delta: number;
  /** drawn as an added colored circle layer (vs a thin ring for tiny additions) */
  layer: boolean;
  /** small extra addition drawn as a dashed ring (private e-commerce) */
  ring?: boolean;
  badgeKey?: string;
};

/** Desktop onion diameter; mobile scales down so text + bubble fit one screen. */
const DESKTOP_MAX_DIAMETER = 300;
const MOBILE_MAX_DIAMETER = 168;
/** Scroll distance per journey step – higher = more time to watch each layer grow. */
const JOURNEY_STEP_VH = 115;
/** Gentle spring so each new onion layer visibly expands. */
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
      delta: 0,
      layer: false,
      ring: true,
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
  const { isMobile } = useScreenSize();

  const steps = buildSteps(metrics);
  const maxTotal = steps[steps.length - 1].total;
  const maxDiameter = isMobile ? MOBILE_MAX_DIAMETER : DESKTOP_MAX_DIAMETER;

  const { ref, step, sectionVh, stageStyle } = usePinnedSteps(
    steps.length,
    JOURNEY_STEP_VH,
  );

  const current = steps[step];
  const newestLayerKey = steps
    .slice(0, step + 1)
    .filter((s) => s.layer)
    .at(-1)?.key;

  // All layer-circles revealed so far, largest drawn first (behind) so each
  // colour shows as a ring around the previous – i.e. the types stacked up.
  const revealedLayers = steps
    .slice(0, step + 1)
    .filter((s) => s.layer)
    .sort((a, b) => b.total - a.total);

  const showRing = steps.slice(0, step + 1).some((s) => s.ring);
  const ringStep = steps.find((s) => s.ring);
  const ringTotal = ringStep?.total ?? current.total;

  const diameterFor = (total: number) =>
    Math.sqrt(total / maxTotal) * maxDiameter;

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: `${sectionVh}vh` }}
    >
      <div
        className="h-[100svh] flex items-center px-4 md:px-8 py-3 md:py-0"
        style={stageStyle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center w-full max-w-5xl mx-auto">
          {/* Bubble = accumulating colored layers */}
          <div className="flex flex-col items-center gap-2 md:gap-4 order-1">
            <div
              className="relative"
              style={{ width: maxDiameter, height: maxDiameter }}
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

              {/* Private e-commerce: thin dashed ring around the current total */}
              {showRing && ringStep && (
                <motion.span
                  className="absolute left-1/2 top-1/2 rounded-full border-2 border-dashed"
                  style={{
                    width: diameterFor(ringTotal) + (isMobile ? 16 : 26),
                    height: diameterFor(ringTotal) + (isMobile ? 16 : 26),
                    x: "-50%",
                    y: "-50%",
                    borderColor: NATION_STORY_COLORS.eCommerceRing,
                  }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              )}

              {/* Running total on top */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`${NATION_STORY_TYPE.stat} text-black font-bold select-none leading-none text-center`}
                >
                  {formatMton(current.total, currentLanguage, 0)}
                  <span
                    className={`block ${NATION_STORY_TYPE.meta} font-semibold mt-0.5 md:mt-1`}
                  >
                    {t("nation.story.unit.mton")}
                  </span>
                </span>
              </div>
            </div>

            <p
              className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} mt-1 md:mt-10`}
            >
              {t("nation.story.journey.dataYear", { year: metrics.latestYear })}
            </p>
          </div>

          {/* Caption + legend of layers added so far */}
          <div className="space-y-2.5 md:space-y-4 order-2 min-h-0">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-2 md:space-y-3"
            >
              <p
                className={`flex items-center gap-2.5 md:gap-3 ${NATION_STORY_TYPE.emphasis} text-white`}
              >
                <span
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full shrink-0"
                  style={{ backgroundColor: current.color }}
                />
                {t(current.labelKey)}
              </p>
              <p
                className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}
              >
                {t(current.textKey)}
              </p>
              {current.badgeKey && (
                <p className={`${NATION_STORY_TYPE.emphasis} text-pink-1`}>
                  {t(current.badgeKey)}
                </p>
              )}
            </motion.div>

            {/* Legend: each type and what it adds to the total */}
            <div className="space-y-1 border-t border-white/10 pt-2 md:pt-3">
              {steps
                .slice(0, step + 1)
                .filter((s) => s.layer)
                .map((s, i) => (
                  <div
                    key={s.key}
                    className={`flex items-center gap-2 md:gap-2.5 ${NATION_STORY_TYPE.meta}`}
                  >
                    <span
                      className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0"
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

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  formatMton,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
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

const MAX_DIAMETER = 300;

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
      color: "var(--orange-2)",
      total: territorial,
      delta: territorial,
      layer: true,
    },
    {
      key: "step2",
      labelKey: "nation.story.journey.step2.label",
      textKey: "nation.story.journey.step2.text",
      color: "var(--blue-3)",
      total: production,
      delta: production - territorial,
      layer: true,
    },
    {
      key: "step3",
      labelKey: "nation.story.journey.step3.label",
      textKey: "nation.story.journey.step3.text",
      color: "var(--pink-3)",
      total: production + consumption,
      delta: consumption,
      layer: true,
    },
    {
      key: "step4",
      labelKey: "nation.story.journey.step4.label",
      textKey: "nation.story.journey.step4.text",
      color: "var(--pink-2)",
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
      color: "var(--green-3)",
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

  const { ref, step, sectionVh, stageStyle } = usePinnedSteps(steps.length);

  const current = steps[step];

  // All layer-circles revealed so far, largest drawn first (behind) so each
  // colour shows as a ring around the previous – i.e. the types stacked up.
  const revealedLayers = steps
    .slice(0, step + 1)
    .filter((s) => s.layer)
    .sort((a, b) => b.total - a.total);

  const showRing = steps.slice(0, step + 1).some((s) => s.ring);

  const diameterFor = (total: number) =>
    Math.sqrt(total / maxTotal) * MAX_DIAMETER;

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
          {/* Bubble = accumulating colored layers */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative"
              style={{ width: MAX_DIAMETER, height: MAX_DIAMETER }}
            >
              {revealedLayers.map((layer) => {
                const d = diameterFor(layer.total);
                return (
                  <motion.div
                    key={layer.key}
                    className="absolute left-1/2 top-1/2 rounded-full"
                    style={{ backgroundColor: layer.color, opacity: 0.92 }}
                    initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                    animate={{ width: d, height: d, x: "-50%", y: "-50%" }}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  />
                );
              })}

              {/* Private e-commerce: thin dashed ring around the current total */}
              {showRing && (
                <motion.span
                  className="absolute left-1/2 top-1/2 rounded-full border-2 border-dashed"
                  style={{
                    width: diameterFor(current.total) + 26,
                    height: diameterFor(current.total) + 26,
                    x: "-50%",
                    y: "-50%",
                    borderColor: "var(--pink-2)",
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}

              {/* Running total on top */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-black font-bold text-2xl md:text-4xl tabular-nums select-none leading-none text-center">
                  {formatMton(current.total, currentLanguage, 0)}
                  <span className="block text-xs md:text-sm font-medium mt-1">
                    {t("nation.story.unit.mton")}
                  </span>
                </span>
              </div>
            </div>

            <p className="mt-6 md:mt-10 text-xs uppercase tracking-widest text-grey">
              {t("nation.story.journey.runningTotalLabel")}
            </p>
          </div>

          {/* Caption + legend of layers added so far */}
          <div className="space-y-4">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <p className="flex items-center gap-2 text-lg md:text-xl text-white font-medium">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: current.color }}
                />
                {t(current.labelKey)}
              </p>
              <p className="text-base md:text-lg text-grey leading-relaxed">
                {t(current.textKey)}
              </p>
              {current.badgeKey && (
                <p className="text-sm text-pink-2">{t(current.badgeKey)}</p>
              )}
            </motion.div>

            {/* Legend: each type and what it adds to the total */}
            <div className="space-y-1.5 border-t border-white/10 pt-3">
              {steps
                .slice(0, step + 1)
                .filter((s) => s.layer)
                .map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-grey flex-1">{t(s.labelKey)}</span>
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

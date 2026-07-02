import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";

type JourneyStep = {
  key: string;
  labelKey: string;
  textKey: string;
  color: string;
  /** cumulative total in Mton after this step */
  total: number;
  /** small extra addition drawn as a ring (private e-commerce) */
  ring?: boolean;
  badgeKey?: string;
};

const MAX_DIAMETER = 300;
/** Scroll distance (vh) allotted to each step */
const STEP_VH = 90;

function buildSteps(metrics: NationStoryMetrics): JourneyStep[] {
  const territorial = metrics.territorialLatestMton; // ~47
  const consumption = metrics.consumptionLatestMton; // ~60
  const biogenic = metrics.biogenicLatestMton; // ~47
  // Production-based is ~4 Mton above territorial per the report (51 vs 47)
  const production = territorial + 4;

  return [
    {
      key: "step1",
      labelKey: "nation.story.journey.step1.label",
      textKey: "nation.story.journey.step1.text",
      color: "var(--orange-2)",
      total: territorial,
    },
    {
      key: "step2",
      labelKey: "nation.story.journey.step2.label",
      textKey: "nation.story.journey.step2.text",
      color: "var(--blue-3)",
      total: production,
    },
    {
      key: "step3",
      labelKey: "nation.story.journey.step3.label",
      textKey: "nation.story.journey.step3.text",
      color: "var(--pink-3)",
      total: production + consumption,
    },
    {
      key: "step4",
      labelKey: "nation.story.journey.step4.label",
      textKey: "nation.story.journey.step4.text",
      color: "var(--pink-2)",
      total: production + consumption,
      ring: true,
      badgeKey: "nation.story.journey.step4.badge",
    },
    {
      key: "step5",
      labelKey: "nation.story.journey.step5.label",
      textKey: "nation.story.journey.step5.text",
      color: "var(--green-3)",
      total: production + consumption + biogenic,
    },
  ];
}

/**
 * Invisible scroll trigger. Uses IntersectionObserver (via useInView) so it
 * works regardless of which element is the scroll container. It reports as
 * active when it crosses the vertical center of the viewport.
 */
function StepSentinel({
  index,
  top,
  onActivate,
}: {
  index: number;
  top: string;
  onActivate: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-50% 0px -50% 0px" });

  useEffect(() => {
    if (inView) onActivate(index);
  }, [inView, index, onActivate]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-0 w-px"
      style={{ top, height: `${STEP_VH}vh` }}
    />
  );
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

  const [step, setStep] = useState(0);
  const onActivate = useCallback((i: number) => setStep(i), []);

  const current = steps[step];
  const diameter = Math.sqrt(current.total / maxTotal) * MAX_DIAMETER;

  return (
    <section
      className="relative"
      style={{ height: `${steps.length * STEP_VH}vh` }}
    >
      {/* Scroll triggers spread across the section */}
      {steps.map((s, i) => (
        <StepSentinel
          key={s.key}
          index={i}
          top={`${i * STEP_VH}vh`}
          onActivate={onActivate}
        />
      ))}

      <div className="sticky top-0 h-screen flex items-center px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center w-full max-w-5xl mx-auto">
          {/* Bubble stays in place; size + color animate on scroll */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative flex items-center justify-center"
              style={{ height: MAX_DIAMETER }}
            >
              <motion.div
                className="relative flex items-center justify-center"
                animate={{
                  width: diameter,
                  height: diameter,
                  backgroundColor: current.color,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                style={{ borderRadius: "50%", opacity: 0.9 }}
              >
                <span className="text-black font-bold text-2xl md:text-4xl tabular-nums select-none leading-none text-center">
                  {formatMton(current.total, currentLanguage, 0)}
                  <span className="block text-xs md:text-sm font-medium mt-1">
                    {t("nation.story.unit.mton")}
                  </span>
                </span>

                {/* Private e-commerce ring */}
                {current.ring && (
                  <motion.span
                    className="absolute rounded-full border-2 border-dashed"
                    style={{ inset: -14, borderColor: current.color }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.div>
            </div>

            {current.ring && current.badgeKey && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-sm text-pink-2"
              >
                {t(current.badgeKey)}
              </motion.p>
            )}

            <p className="text-xs uppercase tracking-widest text-grey">
              {t("nation.story.journey.runningTotalLabel")}
            </p>
          </div>

          {/* Caption changes with scroll */}
          <div className="space-y-3">
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
            </motion.div>

            {/* Scroll progress indicator */}
            <div className="flex gap-2 pt-2">
              {steps.map((s, i) => (
                <span
                  key={s.key}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-8 bg-white" : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

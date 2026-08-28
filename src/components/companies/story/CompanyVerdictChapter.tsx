import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import type { CompanyStoryMetrics } from "@/utils/data/companyStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";
import { useStorySectionJumping } from "@/components/nation/story/useStoryAutoSnap";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import {
  COMPANY_STORY_COLORS,
  COMPANY_STORY_TEXT_CLASSES,
  phyllotaxis,
  swarmSpread,
  uniformDotRadius,
} from "@/components/companies/story/companyStoryTheme";

/**
 * Steps: 1) the whole field, 2) the aligned break away, 3) the rest get
 * their verdict, 4) dots re-scale by emissions – the harsher picture.
 */
const STEP_COUNT = 4;
const STEP_VH = 75;
const EXIT_VH = 35;

const VIEW_W = 1000;
const VIEW_H = 560;
const FIELD_CENTER = { x: VIEW_W / 2, y: 258 };
const FIELD_RADIUS = 225;
const ALIGNED_CENTER = { x: 262, y: 268 };
const OTHERS_CENTER = { x: 712, y: 268 };
/** Weighted step spreads clusters out to make room for the big dots. */
const WEIGHTED_SPREAD_FACTOR = 1.75;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

type DotState = {
  x: number;
  y: number;
  r: number;
};

type VerdictLayout = {
  /** Per dot (in metrics.dots order): state for field / split / weighted */
  field: DotState[];
  split: DotState[];
  weighted: DotState[];
};

function buildVerdictLayout(metrics: CompanyStoryMetrics): VerdictLayout {
  const dots = metrics.dots;
  const spread = swarmSpread(dots.length, FIELD_RADIUS);
  const baseRadius = uniformDotRadius(spread);

  const fieldPositions = phyllotaxis(dots.length, spread);
  const field = dots.map((_, i) => ({
    x: FIELD_CENTER.x + fieldPositions[i].x,
    y: FIELD_CENTER.y + fieldPositions[i].y,
    r: baseRadius,
  }));

  // Split clusters keep the field's density, so cluster size mirrors count.
  const alignedIndices = dots.flatMap((dot, i) => (dot.aligned ? [i] : []));
  const otherIndices = dots.flatMap((dot, i) => (dot.aligned ? [] : [i]));
  const alignedPositions = phyllotaxis(alignedIndices.length, spread);
  const otherPositions = phyllotaxis(otherIndices.length, spread);

  const split: DotState[] = new Array(dots.length);
  alignedIndices.forEach((dotIndex, i) => {
    split[dotIndex] = {
      x: ALIGNED_CENTER.x + alignedPositions[i].x,
      y: ALIGNED_CENTER.y + alignedPositions[i].y,
      r: baseRadius,
    };
  });
  otherIndices.forEach((dotIndex, i) => {
    split[dotIndex] = {
      x: OTHERS_CENTER.x + otherPositions[i].x,
      y: OTHERS_CENTER.y + otherPositions[i].y,
      r: baseRadius,
    };
  });

  // Emissions-weighted radii: area-true within a clamped range so the
  // giants dominate visually without swallowing the whole cluster.
  const maxEmissions = dots[0]?.emissionsTonnes ?? 1;
  const maxDotRadius = baseRadius * 3.4;
  const minDotRadius = baseRadius * 0.3;
  const weightedSpread = spread * WEIGHTED_SPREAD_FACTOR;
  const alignedWeighted = phyllotaxis(alignedIndices.length, weightedSpread);
  const othersWeighted = phyllotaxis(otherIndices.length, weightedSpread);

  const weightedRadius = (emissionsTonnes: number) =>
    Math.max(
      minDotRadius,
      Math.sqrt(emissionsTonnes / maxEmissions) * maxDotRadius,
    );

  const weighted: DotState[] = new Array(dots.length);
  alignedIndices.forEach((dotIndex, i) => {
    weighted[dotIndex] = {
      x: ALIGNED_CENTER.x + alignedWeighted[i].x,
      y: ALIGNED_CENTER.y + alignedWeighted[i].y,
      r: weightedRadius(dots[dotIndex].emissionsTonnes),
    };
  });
  otherIndices.forEach((dotIndex, i) => {
    weighted[dotIndex] = {
      x: OTHERS_CENTER.x + othersWeighted[i].x,
      y: OTHERS_CENTER.y + othersWeighted[i].y,
      r: weightedRadius(dots[dotIndex].emissionsTonnes),
    };
  });

  return { field, split, weighted };
}

function dotStateForStep(layout: VerdictLayout, step: number): DotState[] {
  if (step <= 0) return layout.field;
  if (step <= 2) return layout.split;
  return layout.weighted;
}

function dotColorForStep(aligned: boolean, step: number): string {
  if (step <= 0) return COMPANY_STORY_COLORS.field;
  if (aligned) return COMPANY_STORY_COLORS.aligned;
  return step >= 2
    ? COMPANY_STORY_COLORS.notAligned
    : COMPANY_STORY_COLORS.neutral;
}

type CompanyVerdictChapterProps = {
  metrics: CompanyStoryMetrics;
};

export function CompanyVerdictChapter({ metrics }: CompanyVerdictChapterProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();
  const sectionJumping = useStorySectionJumping();
  const instantMotion = reducedMotion || sectionJumping;

  const layout = useMemo(() => buildVerdictLayout(metrics), [metrics]);

  const { ref, step, exitProgress, mode, sectionVh, stageStyle } =
    usePinnedSteps(STEP_COUNT, STEP_VH, { exitVh: EXIT_VH });

  const sectionStarted = mode !== "before";
  const activeStep = sectionStarted ? step : 0;
  const states = dotStateForStep(layout, activeStep);
  const exitFade = 1 - smoothstep(clamp01(exitProgress));

  const numberFormat = new Intl.NumberFormat(
    currentLanguage === "sv" ? "sv-SE" : "en-GB",
  );
  const alignedShare = Math.round(metrics.alignedCompanyShare);
  const emissionsShare = Math.round(metrics.alignedEmissionsShare);

  const stepStats = [
    numberFormat.format(metrics.companyCount),
    `${numberFormat.format(metrics.alignedCount)} / ${numberFormat.format(metrics.companyCount)}`,
    numberFormat.format(metrics.notAlignedCount),
    `${emissionsShare} %`,
  ];
  const stepStatColors = [
    COMPANY_STORY_TEXT_CLASSES.field,
    COMPANY_STORY_TEXT_CLASSES.aligned,
    COMPANY_STORY_TEXT_CLASSES.notAligned,
    COMPANY_STORY_TEXT_CLASSES.aligned,
  ];

  const stepKey = `step${activeStep + 1}`;
  const showClusterLabels = activeStep >= 1;

  const dotTransition = instantMotion
    ? "none"
    : "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), fill 0.5s ease";
  const captionTransition = instantMotion ? { duration: 0 } : { duration: 0.4 };

  return (
    <section
      ref={ref}
      data-story-section
      data-story-chapter="verdict"
      data-story-step={step}
      data-story-steps={STEP_COUNT}
      data-story-step-vh={STEP_VH}
      data-story-exit-vh={EXIT_VH}
      className="relative"
      style={{ height: `${sectionVh}vh` }}
    >
      <div
        className="h-[100svh] min-h-0 flex flex-col px-4 md:px-8 pt-[var(--story-stage-pad-top)] pb-[var(--story-stage-pad-bottom)] md:py-0 overflow-hidden"
        style={stageStyle}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <div
          className="relative flex h-full min-h-0 flex-1 flex-col justify-center gap-3 story-short:gap-2 md:gap-5 w-full max-w-5xl mx-auto"
          style={{ opacity: exitFade }}
        >
          {/* The swarm itself */}
          <div className="w-full max-w-4xl mx-auto">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="w-full h-auto max-h-[48svh] story-short:max-h-[42svh] md:max-h-[52svh] block"
              role="img"
              aria-label={t("companies.story.verdict.swarmAria", {
                aligned: metrics.alignedCount,
                companyCount: metrics.companyCount,
              })}
            >
              {metrics.dots.map((dot, i) => {
                const state = states[i];
                return (
                  <circle
                    key={dot.id}
                    r={1}
                    fill={dotColorForStep(dot.aligned, activeStep)}
                    opacity={0.92}
                    style={{
                      transform: `translate(${state.x}px, ${state.y}px) scale(${state.r})`,
                      transition: dotTransition,
                      transitionDelay: instantMotion
                        ? undefined
                        : `${(i % 48) * 7}ms`,
                    }}
                  />
                );
              })}

              {/* Cluster labels once the field has split */}
              <motion.g
                initial={false}
                animate={{ opacity: showClusterLabels ? 1 : 0 }}
                transition={captionTransition}
              >
                <text
                  x={ALIGNED_CENTER.x}
                  y={VIEW_H - 18}
                  fill={COMPANY_STORY_COLORS.aligned}
                  fontSize={19}
                  fontWeight={500}
                  textAnchor="middle"
                >
                  {t("companies.story.verdict.alignedLabel", {
                    alignedCount: numberFormat.format(metrics.alignedCount),
                  })}
                </text>
                <text
                  x={OTHERS_CENTER.x}
                  y={VIEW_H - 18}
                  fill={
                    activeStep >= 2
                      ? COMPANY_STORY_COLORS.notAligned
                      : COMPANY_STORY_COLORS.neutral
                  }
                  fontSize={19}
                  fontWeight={500}
                  textAnchor="middle"
                >
                  {t("companies.story.verdict.notAlignedLabel", {
                    notAlignedCount: numberFormat.format(
                      metrics.notAlignedCount,
                    ),
                  })}
                </text>
              </motion.g>
            </svg>
          </div>

          {/* Caption below the swarm */}
          <div className="text-center max-w-2xl mx-auto space-y-1.5 story-short:space-y-1 md:space-y-2.5">
            <motion.div
              key={stepKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: sectionStarted ? 1 : 0,
                y: sectionStarted ? 0 : 12,
              }}
              transition={captionTransition}
              className="space-y-1.5 story-short:space-y-1 md:space-y-2.5"
            >
              <p
                className={`${NATION_STORY_TYPE.eyebrow} ${NATION_STORY_TEXT.eyebrow}`}
              >
                {t("companies.story.verdict.stepCounter", {
                  current: activeStep + 1,
                  total: STEP_COUNT,
                })}
              </p>
              <p
                className={`${NATION_STORY_TYPE.stat} ${stepStatColors[activeStep]}`}
              >
                {stepStats[activeStep]}
              </p>
              <p
                className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}
              >
                {t(`companies.story.verdict.${stepKey}.text`, {
                  companyCount: numberFormat.format(metrics.companyCount),
                  aligned: numberFormat.format(metrics.alignedCount),
                  notAligned: numberFormat.format(metrics.notAlignedCount),
                  alignedShare,
                  emissionsShare,
                  totalMton: formatMton(metrics.totalMton, currentLanguage, 0),
                })}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

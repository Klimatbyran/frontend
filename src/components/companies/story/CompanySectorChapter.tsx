import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import type {
  CompanyStoryMetrics,
  SectorRaceLane,
} from "@/utils/data/companyStoryMetrics";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";
import { useStorySectionJumping } from "@/components/nation/story/useStoryAutoSnap";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import {
  COMPANY_STORY_COLORS,
  COMPANY_STORY_TEXT_CLASSES,
} from "@/components/companies/story/companyStoryTheme";

/** Steps: 1) the whole field races in, 2) the leader, 3) the tail light. */
const STEP_COUNT = 3;
const STEP_VH = 65;
const EXIT_VH = 30;
/** Keep the board readable – the biggest sectors only. */
const MAX_LANES = 8;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

type RaceLane = SectorRaceLane & { name: string };

function useRaceLanes(metrics: CompanyStoryMetrics): RaceLane[] {
  const sectorNames = useSectorNames();

  return useMemo(() => {
    const biggest = [...metrics.sectorLanes]
      .sort((a, b) => b.totalMton - a.totalMton)
      .slice(0, MAX_LANES);

    return biggest
      .sort((a, b) => b.alignedShare - a.alignedShare || b.totalMton - a.totalMton)
      .map((lane) => ({
        ...lane,
        name:
          sectorNames[lane.sectorCode as keyof typeof sectorNames] ??
          lane.sectorCode,
      }));
  }, [metrics.sectorLanes, sectorNames]);
}

type CompanySectorChapterProps = {
  metrics: CompanyStoryMetrics;
};

/**
 * The sector race: one lane per sector, filled by the share of its companies
 * that keep the Paris pace. The finish line is everyone keeping the pace.
 */
export function CompanySectorChapter({ metrics }: CompanySectorChapterProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const sectionJumping = useStorySectionJumping();
  const instantMotion = reducedMotion || sectionJumping;

  const lanes = useRaceLanes(metrics);
  const { ref, step, exitProgress, mode, sectionVh, stageStyle } =
    usePinnedSteps(STEP_COUNT, STEP_VH, { exitVh: EXIT_VH });

  const sectionStarted = mode !== "before";
  const activeStep = sectionStarted ? step : 0;
  const exitFade = 1 - smoothstep(clamp01(exitProgress));

  const leader = lanes[0];
  const tail = lanes[lanes.length - 1];
  const highlightIndex =
    activeStep === 1 ? 0 : activeStep === 2 ? lanes.length - 1 : null;

  const fillTransition = instantMotion
    ? { duration: 0 }
    : { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const };
  const captionTransition = instantMotion ? { duration: 0 } : { duration: 0.4 };

  const stepText =
    activeStep === 0
      ? t("companies.story.sectors.step1.text")
      : activeStep === 1
        ? t("companies.story.sectors.step2.text", {
            name: leader?.name,
            aligned: leader?.alignedCount,
            companyCount: leader?.companyCount,
          })
        : t("companies.story.sectors.step3.text", {
            name: tail?.name,
            aligned: tail?.alignedCount,
            companyCount: tail?.companyCount,
          });

  return (
    <section
      ref={ref}
      data-story-section
      data-story-chapter="sectors"
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
          className="relative flex h-full min-h-0 flex-1 flex-col justify-center gap-4 story-short:gap-2.5 md:gap-6 w-full max-w-3xl mx-auto"
          style={{ opacity: exitFade }}
        >
          <div className="text-center space-y-1.5 story-short:space-y-1 md:space-y-2.5">
            <p
              className={`${NATION_STORY_TYPE.eyebrow} ${NATION_STORY_TEXT.eyebrow}`}
            >
              {t("companies.story.sectors.stepCounter", {
                current: activeStep + 1,
                total: STEP_COUNT,
              })}
            </p>
            <h2 className={`${NATION_STORY_TYPE.title} text-white`}>
              {t("companies.story.sectors.title")}
            </h2>
          </div>

          {/* The race board */}
          <div className="relative space-y-2.5 story-short:space-y-1.5 md:space-y-3.5">
            {/* Finish line: every company in the sector keeping the pace */}
            <div
              aria-hidden
              className="absolute -top-1 -bottom-1 right-0 border-r border-dashed border-white/30"
            />
            <p
              className={`text-right ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} pr-1`}
            >
              {t("companies.story.sectors.finishLabel")}
            </p>

            {lanes.map((lane, index) => {
              const dimmed = highlightIndex !== null && index !== highlightIndex;
              const highlighted = highlightIndex === index;

              return (
                <motion.div
                  key={lane.sectorCode}
                  initial={false}
                  animate={{ opacity: sectionStarted ? (dimmed ? 0.35 : 1) : 0 }}
                  transition={captionTransition}
                >
                  <div
                    className={`flex items-baseline justify-between gap-3 mb-1 ${NATION_STORY_TYPE.meta}`}
                  >
                    <span
                      className={
                        highlighted ? "text-white font-medium" : "text-grey"
                      }
                    >
                      {lane.name}
                    </span>
                    <span
                      className={`tabular-nums shrink-0 ${
                        highlighted ? "text-white font-medium" : "text-grey"
                      }`}
                    >
                      {t("companies.story.sectors.laneValue", {
                        aligned: lane.alignedCount,
                        companyCount: lane.companyCount,
                      })}
                    </span>
                  </div>
                  <div className="h-3.5 story-short:h-2.5 md:h-4 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          lane.alignedShare > 0
                            ? COMPANY_STORY_COLORS.aligned
                            : COMPANY_STORY_COLORS.notAligned,
                        minWidth: lane.alignedShare > 0 ? undefined : 6,
                      }}
                      initial={false}
                      animate={{
                        width: sectionStarted
                          ? `${Math.max(lane.alignedShare, 0.8)}%`
                          : "0%",
                      }}
                      transition={{
                        ...fillTransition,
                        delay: instantMotion ? 0 : index * 0.09,
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            key={`caption-${activeStep}`}
            initial={instantMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: sectionStarted ? 1 : 0, y: 0 }}
            transition={captionTransition}
            className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} text-center max-w-xl mx-auto`}
          >
            {stepText}
          </motion.p>

          <p
            className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} text-center`}
          >
            <motion.span
              className="block"
              initial={false}
              animate={{ opacity: sectionStarted ? 1 : 0 }}
              transition={captionTransition}
            >
              <span className={COMPANY_STORY_TEXT_CLASSES.aligned}>●</span>{" "}
              {t("companies.story.sectors.dataNote")}
            </motion.span>
          </p>
        </div>
      </div>
    </section>
  );
}

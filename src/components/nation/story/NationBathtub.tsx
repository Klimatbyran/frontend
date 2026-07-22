import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  formatMton,
  type NationBathtubDataPoint,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";

/** Sample years so each scroll step adds a visible water chunk. */
function sampleBathtubYears(
  data: NationBathtubDataPoint[],
): NationBathtubDataPoint[] {
  if (data.length === 0) return [];
  const sampled: NationBathtubDataPoint[] = [];
  for (const point of data) {
    const isMilestone = (point.year - data[0].year) % 5 === 0;
    const isLast = point === data.at(-1);
    if (isMilestone || isLast) sampled.push(point);
  }
  return sampled;
}

/**
 * Absolute fragment URL so SVG clipPath works with <base href="/">.
 * Bare url(#id) resolves against the base and breaks on locale routes.
 */
function svgLocalUrl(elementId: string): string {
  if (typeof window === "undefined") return `url(#${elementId})`;
  const { origin, pathname, search } = window.location;
  return `url(${origin}${pathname}${search}#${elementId})`;
}

type NationBathtubProps = {
  data: NationBathtubDataPoint[];
};

/** Wide tub geometry (viewBox 520×280) – used full-bleed on desktop with copy inside. */
const TUB_WATER_TOP = 72;
const TUB_INNER_BOTTOM = 232;
const TUB_WATER_HEIGHT = TUB_INNER_BOTTOM - TUB_WATER_TOP;
const TUB_WATER_LEFT = 48;
const TUB_WATER_WIDTH = 424;
const TUB_WATER_CLIP_PATH =
  "M48 72 h424 v118 c0 32 -48 42 -212 42 s-212 -10 -212 -42 z";
const TUB_OUTLINE_PATH =
  "M40 64 h440 v126 c0 36 -52 48 -220 48 s-220 -12 -220 -48 z";

type TubGraphicProps = {
  waterClipId: string;
  waterClipUrl: string;
  chunks: NationBathtubDataPoint[];
  maxCumulative: number;
  waterTop: number;
  /** Stronger fill when copy is not overlaid (mobile). */
  strongerWater?: boolean;
  className?: string;
};

function TubGraphic({
  waterClipId,
  waterClipUrl,
  chunks,
  maxCumulative,
  waterTop,
  strongerWater = false,
  className,
}: TubGraphicProps) {
  return (
    <svg viewBox="0 0 520 280" className={className} aria-hidden>
      <path
        d="M390 18 h36 a7 7 0 0 1 7 7 v12 h-12 v-7 h-31 z"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M426 37 v18"
        stroke="rgba(125, 211, 252, 0.7)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={TUB_OUTLINE_PATH}
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <defs>
        <clipPath id={waterClipId}>
          <path d={TUB_WATER_CLIP_PATH} />
        </clipPath>
      </defs>
      <g clipPath={waterClipUrl}>
        {chunks.map((chunk, index) => {
          const prevCumulative =
            index === 0 ? 0 : chunks[index - 1].cumulativeMton;
          const bottom =
            TUB_INNER_BOTTOM -
            (prevCumulative / maxCumulative) * TUB_WATER_HEIGHT;
          const top =
            TUB_INNER_BOTTOM -
            (chunk.cumulativeMton / maxCumulative) * TUB_WATER_HEIGHT;
          const height = Math.max(bottom - top, 0);
          const fillAlpha = strongerWater
            ? 0.28 + (index / Math.max(chunks.length, 1)) * 0.4
            : 0.1 + (index / Math.max(chunks.length, 1)) * 0.22;
          return (
            <motion.rect
              key={chunk.year}
              x={TUB_WATER_LEFT}
              width={TUB_WATER_WIDTH}
              initial={{ y: bottom, height: 0, opacity: 0 }}
              animate={{ y: top, height, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              fill={`rgba(56, 189, 248, ${fillAlpha})`}
            />
          );
        })}
        <motion.line
          x1={TUB_WATER_LEFT}
          x2={TUB_WATER_LEFT + TUB_WATER_WIDTH}
          stroke="rgba(186, 230, 253, 0.75)"
          strokeWidth="2"
          initial={false}
          animate={{ y1: waterTop, y2: waterTop }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </g>
    </svg>
  );
}

export function NationBathtub({ data }: NationBathtubProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  // useId can include ":" which is awkward in url(#…) fragments
  const waterClipId = `tub-water-clip-${useId().replace(/:/g, "")}`;
  const waterClipUrl = useMemo(() => svgLocalUrl(waterClipId), [waterClipId]);
  const steps = useMemo(() => sampleBathtubYears(data), [data]);
  const maxCumulative = steps.at(-1)?.cumulativeMton ?? 1;

  const { ref, step, sectionVh, stageStyle } = usePinnedSteps(
    Math.max(steps.length, 1),
    70,
  );

  const current = steps[step] ?? steps[0];
  if (!current) return null;

  const previous = step === 0 ? null : steps[step - 1];
  const previousCumulative = previous?.cumulativeMton ?? 0;
  const chunkMton = current.cumulativeMton - previousCumulative;
  // Milestone chunks cover the years after the previous sample through current.
  const chunkFromYear = previous ? previous.year + 1 : current.year;
  const chunkToYear = current.year;
  const fillRatio = Math.min(current.cumulativeMton / maxCumulative, 1);
  const waterTop = TUB_INNER_BOTTOM - fillRatio * TUB_WATER_HEIGHT;

  // Chunk bands: each sampled year contributes a layer of water
  const chunks = steps.slice(0, step + 1);

  const chunkCaption =
    chunkFromYear === chunkToYear
      ? t("nation.story.bathtub.chunkCaptionSingleYear", {
          value: formatMton(chunkMton, currentLanguage, 0),
          year: chunkToYear,
        })
      : t("nation.story.bathtub.chunkCaptionYearRange", {
          value: formatMton(chunkMton, currentLanguage, 0),
          fromYear: chunkFromYear,
          toYear: chunkToYear,
        });

  const yearBlock = (
    <div className="text-center space-y-0.5 md:space-y-1 min-h-[3.5rem] md:min-h-[4.5rem]">
      <motion.p
        key={current.year}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={NATION_STORY_TYPE.stat}
      >
        {current.year}
      </motion.p>
      <p className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.body}`}>
        {t("nation.story.bathtub.levelCaption", {
          value: formatMton(current.cumulativeMton, currentLanguage, 0),
        })}
      </p>
      <p className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}>
        {chunkCaption}
      </p>
    </div>
  );

  return (
    <section
      ref={ref}
      data-story-section
      data-story-step={step}
      data-story-steps={steps.length}
      data-story-step-vh={70}
      className="relative"
      style={{ height: `${sectionVh}vh` }}
    >
      <div
        className="h-[100svh] flex items-center px-4 md:px-8 py-3 md:py-0"
        style={stageStyle}
      >
        {/* Mobile: compact tub on top, copy below (Swedish text is too long for the basin). */}
        <div className="w-full max-w-3xl mx-auto md:hidden space-y-3">
          <div className="flex flex-col items-center gap-2">
            <TubGraphic
              waterClipId={waterClipId}
              waterClipUrl={waterClipUrl}
              chunks={chunks}
              maxCumulative={maxCumulative}
              waterTop={waterTop}
              strongerWater
              className="w-44 h-auto"
            />
            {yearBlock}
          </div>
          <div className="space-y-2.5 text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}
            >
              {t("nation.story.bathtub.text")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className={`${NATION_STORY_TYPE.emphasis} text-white`}
            >
              {t("nation.story.bathtub.question")}
            </motion.p>
          </div>
        </div>

        {/* Desktop: wide tub with copy inside translucent water. */}
        <div className="hidden md:block w-full max-w-4xl mx-auto">
          <div className="relative mx-auto w-full">
            <TubGraphic
              waterClipId={`${waterClipId}-desktop`}
              waterClipUrl={svgLocalUrl(`${waterClipId}-desktop`)}
              chunks={chunks}
              maxCumulative={maxCumulative}
              waterTop={waterTop}
              className="w-full h-auto"
            />
            <div className="pointer-events-none absolute inset-x-[12%] top-[28%] bottom-[26%] flex flex-col items-center justify-center gap-4 text-center px-6">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="text-lg leading-relaxed text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]"
              >
                {t("nation.story.bathtub.text")}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="text-xl font-medium text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]"
              >
                {t("nation.story.bathtub.question")}
              </motion.p>
            </div>
          </div>
          <div className="mt-4">{yearBlock}</div>
        </div>
      </div>
    </section>
  );
}

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

const TUB_WATER_TOP = 52;
const TUB_INNER_BOTTOM = 168;
const TUB_WATER_HEIGHT = TUB_INNER_BOTTOM - TUB_WATER_TOP;
const TUB_WATER_CLIP_PATH =
  "M40 52 h140 v82 c0 24 -26 34 -70 34 s-70 -10 -70 -34 z";

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
        <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-14 items-center">
          <div className="space-y-3 md:space-y-6 text-center md:text-left order-2 md:order-1">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}
            >
              {t("nation.story.bathtub.text")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className={`${NATION_STORY_TYPE.emphasis} text-white`}
            >
              {t("nation.story.bathtub.question")}
            </motion.p>
          </div>

          <div className="flex flex-col items-center gap-2 md:gap-4 order-1 md:order-2">
            <svg
              viewBox="0 0 220 200"
              className="w-40 md:w-72 h-auto"
              aria-hidden
            >
              {/* Tap */}
              <path
                d="M150 18 h28 a6 6 0 0 1 6 6 v10 h-10 v-6 h-24 z"
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M178 34 v14"
                stroke="rgba(125, 211, 252, 0.85)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Tub outline */}
              <path
                d="M36 48 h148 v88 c0 28 -28 40 -74 40 s-74 -12 -74 -40 z"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Water chunks clipped inside tub */}
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
                  const fillAlpha =
                    0.35 + (index / Math.max(chunks.length, 1)) * 0.45;
                  return (
                    <motion.rect
                      key={chunk.year}
                      x={40}
                      width={140}
                      initial={{ y: bottom, height: 0, opacity: 0 }}
                      animate={{ y: top, height, opacity: 1 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      fill={`rgba(56, 189, 248, ${fillAlpha})`}
                    />
                  );
                })}
                {/* Surface line */}
                <motion.line
                  x1={40}
                  x2={180}
                  stroke="rgba(186, 230, 253, 0.95)"
                  strokeWidth="2"
                  initial={false}
                  animate={{ y1: waterTop, y2: waterTop }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </g>
            </svg>

            <div className="text-center space-y-0.5 md:space-y-1 min-h-[3.5rem] md:min-h-[4.5rem]">
              <motion.p
                key={current.year}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={NATION_STORY_TYPE.stat}
              >
                {current.year}
              </motion.p>
              <p
                className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.body}`}
              >
                {t("nation.story.bathtub.levelCaption", {
                  value: formatMton(current.cumulativeMton, currentLanguage, 0),
                })}
              </p>
              <p
                className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}
              >
                {chunkCaption}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

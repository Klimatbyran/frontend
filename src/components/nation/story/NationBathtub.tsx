import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  formatMton,
  type NationBathtubDataPoint,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { NATION_STORY_TEXT } from "@/components/nation/story/nationStoryColors";
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";
import { useReportStoryStage } from "@/components/nation/story/storyStageContext";

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

type NationBathtubProps = {
  data: NationBathtubDataPoint[];
};

const TUB_INNER_TOP = 48;
const TUB_INNER_BOTTOM = 168;
const TUB_INNER_HEIGHT = TUB_INNER_BOTTOM - TUB_INNER_TOP;

export function NationBathtub({ data }: NationBathtubProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const steps = useMemo(() => sampleBathtubYears(data), [data]);
  const maxCumulative = steps.at(-1)?.cumulativeMton ?? 1;

  const { ref, step, sectionVh, stageStyle, mode } = usePinnedSteps(
    Math.max(steps.length, 1),
    70,
  );
  useReportStoryStage("bathtub", mode);

  const current = steps[step] ?? steps[0];
  if (!current) return null;

  const previousCumulative =
    step === 0 ? 0 : (steps[step - 1]?.cumulativeMton ?? 0);
  const chunkMton = current.cumulativeMton - previousCumulative;
  const fillRatio = Math.min(current.cumulativeMton / maxCumulative, 1);
  const waterTop = TUB_INNER_BOTTOM - fillRatio * TUB_INNER_HEIGHT;

  // Chunk bands: each sampled year contributes a layer of water
  const chunks = steps.slice(0, step + 1);

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
        <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="space-y-6 text-center md:text-left">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={`text-lg md:text-xl ${NATION_STORY_TEXT.body} leading-relaxed`}
            >
              {t("nation.story.bathtub.text")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-2xl md:text-3xl text-white font-light leading-snug"
            >
              {t("nation.story.bathtub.question")}
            </motion.p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <svg
              viewBox="0 0 220 200"
              className="w-56 md:w-72 h-auto"
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
                <clipPath id="tub-water-clip">
                  <path d="M40 52 h140 v82 c0 24 -26 34 -70 34 s-70 -10 -70 -34 z" />
                </clipPath>
              </defs>
              <g clipPath="url(#tub-water-clip)">
                {chunks.map((chunk, index) => {
                  const prevCumulative =
                    index === 0 ? 0 : chunks[index - 1].cumulativeMton;
                  const bottom =
                    TUB_INNER_BOTTOM -
                    (prevCumulative / maxCumulative) * TUB_INNER_HEIGHT;
                  const top =
                    TUB_INNER_BOTTOM -
                    (chunk.cumulativeMton / maxCumulative) * TUB_INNER_HEIGHT;
                  const height = Math.max(bottom - top, 0);
                  const opacity =
                    0.35 + (index / Math.max(chunks.length, 1)) * 0.45;
                  return (
                    <motion.rect
                      key={chunk.year}
                      x={40}
                      width={140}
                      initial={{ y: bottom, height: 0, opacity: 0 }}
                      animate={{ y: top, height, opacity }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      fill={`rgba(56, 189, 248, ${opacity})`}
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

            <div className="text-center space-y-1 min-h-[4.5rem]">
              <motion.p
                key={current.year}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-light tabular-nums"
              >
                {current.year}
              </motion.p>
              <p className={`text-base md:text-lg ${NATION_STORY_TEXT.body}`}>
                {t("nation.story.bathtub.levelCaption", {
                  value: formatMton(current.cumulativeMton, currentLanguage, 0),
                })}
              </p>
              <p
                className={`text-sm md:text-base ${NATION_STORY_TEXT.secondary}`}
              >
                {t("nation.story.bathtub.chunkCaption", {
                  value: formatMton(chunkMton, currentLanguage, 0),
                  year: current.year,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useId } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import {
  formatMton,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import {
  NATION_STORY_COLORS,
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import { svgLocalUrl } from "@/components/nation/story/svgLocalUrl";
import {
  SWEDEN_OUTLINE_PATH,
  SWEDEN_OUTLINE_VIEWBOX,
} from "@/components/nation/story/swedenOutlinePath";

type NationIntroPunchProps = {
  metrics: NationStoryMetrics;
};

/** Silhouette vertical extents inside the 0 0 100 220 viewBox. */
const OUTLINE_TOP = 6;
const OUTLINE_BOTTOM = 214;
const OUTLINE_HEIGHT = OUTLINE_BOTTOM - OUTLINE_TOP;

const FILL_SPRING = {
  type: "spring" as const,
  stiffness: 50,
  damping: 18,
  mass: 1,
};

type StatCalloutProps = {
  label: string;
  value: string;
  /** Compact unit for mobile (e.g. "Mton") */
  unitShort: string;
  /** Written-out unit for desktop (e.g. "miljoner ton") */
  unitLong: string;
  colorClass: string;
  delay: number;
  className?: string;
};

function StatCallout({
  label,
  value,
  unitShort,
  unitLong,
  colorClass,
  delay,
  className,
}: StatCalloutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay }}
      className={`text-center md:text-left ${className ?? ""}`}
    >
      <p
        className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} mb-1`}
      >
        {label}
      </p>
      <p className={`${NATION_STORY_TYPE.display} ${colorClass}`}>
        {value}{" "}
        {/* Unit below the number on mobile (symmetric columns, same format
            as the onion total), inline written-out on desktop */}
        <span
          className={`block mt-1 md:mt-0 md:inline ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} font-normal align-baseline`}
        >
          <span className="md:hidden whitespace-nowrap">{unitShort}</span>
          <span className="hidden md:inline whitespace-nowrap">{unitLong}</span>
        </span>
      </p>
    </motion.div>
  );
}

/**
 * Hero visual: the Sweden silhouette in the full-emissions colour, with the
 * officially reported share shown as a liquid fill rising from the bottom —
 * foreshadowing the bathtub metaphor later in the story.
 *
 * The fill is height-proportional (standard infographic convention); the
 * exact figures live in the callouts beside the silhouette.
 */
export function NationIntroPunch({ metrics }: NationIntroPunchProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();
  const clipId = `sweden-fill-clip-${useId().replace(/:/g, "")}`;

  const reportedValue = metrics.territorialLatestMton;
  const fullValue = Math.max(metrics.combinedLatestMton, reportedValue);
  const reported = formatMton(reportedValue, currentLanguage, 0);
  const full = formatMton(fullValue, currentLanguage, 0);
  const fillRatio = reportedValue / fullValue;
  const fillTop = OUTLINE_BOTTOM - fillRatio * OUTLINE_HEIGHT;
  const unitShort = t("nation.story.unit.mtonCo2e");
  const unitLong = t("nation.story.unit.millionTco2e");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-10 lg:gap-14"
    >
      <div className="relative h-[clamp(220px,41svh,400px)] md:h-[clamp(260px,44svh,460px)] aspect-[100/220]">
        <svg
          viewBox={SWEDEN_OUTLINE_VIEWBOX}
          className="h-full w-auto max-w-full mx-auto"
          role="img"
          aria-label={`${reported}–${full} ${unitLong}`}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={SWEDEN_OUTLINE_PATH} />
            </clipPath>
          </defs>

          <motion.path
            d={SWEDEN_OUTLINE_PATH}
            fill={NATION_STORY_COLORS.consumption}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "50% 50%" }}
          />

          {/* Reported share rises like water inside the silhouette */}
          <g clipPath={svgLocalUrl(clipId)}>
            <motion.rect
              x={0}
              width={100}
              fill={NATION_STORY_COLORS.territorial}
              initial={
                reducedMotion
                  ? { y: fillTop, height: OUTLINE_BOTTOM - fillTop + 6 }
                  : { y: OUTLINE_BOTTOM, height: 0 }
              }
              whileInView={{
                y: fillTop,
                height: OUTLINE_BOTTOM - fillTop + 6,
              }}
              viewport={{ once: true, amount: 0.35 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { ...FILL_SPRING, delay: 0.35 }
              }
            />
            <motion.line
              x1={0}
              x2={100}
              stroke="var(--orange-1)"
              strokeWidth="1"
              strokeOpacity="0.8"
              initial={
                reducedMotion
                  ? { y1: fillTop, y2: fillTop, opacity: 1 }
                  : { y1: OUTLINE_BOTTOM, y2: OUTLINE_BOTTOM, opacity: 0 }
              }
              whileInView={{ y1: fillTop, y2: fillTop, opacity: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { ...FILL_SPRING, delay: 0.35 }
              }
            />
          </g>
        </svg>
      </div>

      {/* Full/pink callout beside the upper region, reported/orange beside the fill */}
      <div className="flex flex-row md:flex-col items-center md:items-start justify-center gap-8 md:gap-10">
        <StatCallout
          label={t("nation.story.intro.fullLabel")}
          value={full}
          unitShort={unitShort}
          unitLong={unitLong}
          colorClass="text-pink-3"
          delay={0.15}
          className="order-2 md:order-1"
        />
        <StatCallout
          label={t("nation.story.intro.usualLabel")}
          value={reported}
          unitShort={unitShort}
          unitLong={unitLong}
          colorClass="text-orange-3"
          delay={0.3}
          className="order-1 md:order-2"
        />
      </div>
    </motion.div>
  );
}

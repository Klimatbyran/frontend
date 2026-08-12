import { useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, useReducedMotion } from "framer-motion";
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
      className={`min-w-0 ${className ?? ""}`}
    >
      {/* Mobile: big number on top so both columns share a baseline */}
      <div className="md:hidden flex flex-col items-center text-center px-0.5">
        <p className={`${NATION_STORY_TYPE.display} ${colorClass}`}>{value}</p>
        <p
          className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} mt-1 story-short:mt-0.5`}
        >
          {unitShort}
        </p>
        <p
          className={`${NATION_STORY_TYPE.meta} leading-snug ${NATION_STORY_TEXT.secondary} mt-2 story-short:mt-1 max-w-[9.25rem]`}
        >
          {label}
        </p>
      </div>

      {/* Desktop: centered under the page title; mobile stays compact */}
      <div className="hidden md:block text-center">
        <p
          className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} mb-1`}
        >
          {label}
        </p>
        <p
          className={`${NATION_STORY_TYPE.display} leading-none ${colorClass}`}
        >
          {value}{" "}
          <span
            className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} font-normal align-baseline whitespace-nowrap`}
          >
            {unitLong}
          </span>
        </p>
      </div>
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInView = useInView(mapRef, { once: true, amount: 0.15 });

  const reportedValue = metrics.territorialLatestMton;
  const fullValue = Math.max(metrics.combinedLatestMton, reportedValue);
  const reported = formatMton(reportedValue, currentLanguage, 0);
  const full = formatMton(fullValue, currentLanguage, 0);
  const fillRatio = reportedValue / fullValue;
  const fillTop = OUTLINE_BOTTOM - fillRatio * OUTLINE_HEIGHT;
  const fillHeight = OUTLINE_BOTTOM - fillTop + 6;
  const unitShort = t("nation.story.unit.mtonCo2e");
  const unitLong = t("nation.story.unit.millionTco2e");

  const fillShown = reducedMotion || mapInView;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
      className="mx-auto flex w-fit max-w-full flex-col items-center justify-center gap-2 max-md:gap-1.5 story-short:gap-1 md:flex-row md:items-center md:gap-10 lg:gap-14"
    >
      <div
        ref={mapRef}
        className="relative h-[clamp(130px,24svh,280px)] story-short:h-[clamp(110px,20svh,200px)] md:h-[clamp(260px,44svh,460px)] aspect-[100/220]"
      >
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
                  ? { y: fillTop, height: fillHeight }
                  : { y: OUTLINE_BOTTOM, height: 0 }
              }
              animate={
                fillShown
                  ? { y: fillTop, height: fillHeight }
                  : { y: OUTLINE_BOTTOM, height: 0 }
              }
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
              animate={
                fillShown
                  ? { y1: fillTop, y2: fillTop, opacity: 1 }
                  : { y1: OUTLINE_BOTTOM, y2: OUTLINE_BOTTOM, opacity: 0 }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { ...FILL_SPRING, delay: 0.35 }
              }
            />
          </g>
        </svg>
      </div>

      {/* Desktop: map + callouts centered as one unit; mobile: two-column grid */}
      <div className="grid grid-cols-2 gap-x-3 md:flex md:w-auto md:flex-col md:items-center md:gap-10 w-full max-w-[20rem] md:max-w-none mx-auto">
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

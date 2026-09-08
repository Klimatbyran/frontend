import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import { useTranslation } from "react-i18next";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import {
  formatMton,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import {
  SWEDEN_OUTLINE_PATH,
  SWEDEN_OUTLINE_VIEWBOX,
  swedenOutlineScaleMatrix,
} from "@/components/nation/story/swedenOutlinePath";

type NationIntroPunchProps = {
  metrics: NationStoryMetrics;
};

/** Intro-only palette: blue for the usual figure (47), orange for full emissions (159). */
const INTRO_INNER_MAP_FILL = "var(--blue-3)";
const INTRO_OUTER_MAP_FILL = "var(--orange-3)";
const INTRO_USUAL_VALUE_CLASS = "text-blue-3";
const INTRO_FULL_VALUE_CLASS = "text-orange-3";

/** Outer map grows out from the blue core shortly after mount. */
const PINK_MAP_REVEAL_DELAY_S = 0.35;

const PINK_REVEAL_TRANSITION = {
  type: "spring" as const,
  stiffness: 42,
  damping: 20,
  mass: 1,
  delay: PINK_MAP_REVEAL_DELAY_S,
  bounce: 0,
};

/** Visual nudge – the silhouette reads right-heavy when nested at bbox centre. */
const INNER_MAP_NUDGE_X = -7;

type SwedenSilhouetteProps = {
  scale: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  nudgeX?: number;
  nudgeY?: number;
};

/** Scale the path around the silhouette centre via a single matrix on the path. */
function SwedenSilhouette({
  scale,
  fill,
  stroke,
  strokeWidth = 0,
  opacity = 1,
  nudgeX = 0,
  nudgeY = 0,
}: SwedenSilhouetteProps) {
  return (
    <path
      d={SWEDEN_OUTLINE_PATH}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      transform={swedenOutlineScaleMatrix(scale, nudgeX, nudgeY)}
    />
  );
}

type AnimatedPinkSilhouetteProps = {
  progress: MotionValue<number>;
  fill: string;
};

/** Pink map scale – SVG attribute updates without React re-renders per frame. */
function AnimatedPinkSilhouette({
  progress,
  fill,
}: AnimatedPinkSilhouetteProps) {
  const ref = useRef<SVGPathElement>(null);

  const applyTransform = (p: number) => {
    // Clamp so spring easing cannot overshoot and clip against the SVG viewport.
    const scale = Math.min(1, Math.max(p, 0.001));
    ref.current?.setAttribute("transform", swedenOutlineScaleMatrix(scale));
  };

  useMotionValueEvent(progress, "change", applyTransform);

  useEffect(() => {
    applyTransform(progress.get());
  }, [progress]);

  return (
    <path
      ref={ref}
      d={SWEDEN_OUTLINE_PATH}
      fill={fill}
      shapeRendering="geometricPrecision"
    />
  );
}

type IntroSwedenMapsProps = {
  pinkProgress: MotionValue<number>;
  innerScale: number;
  reported: string;
  full: string;
  unitLong: string;
};

const IntroSwedenMaps = memo(function IntroSwedenMaps({
  pinkProgress,
  innerScale,
  reported,
  full,
  unitLong,
}: IntroSwedenMapsProps) {
  return (
    <div className="relative h-[clamp(155px,28svh,300px)] story-short:h-[clamp(130px,24svh,230px)] landing-laptop:h-[clamp(280px,42svh,420px)] story-compact:landing-laptop:h-[clamp(240px,36svh,360px)] xl:h-[clamp(260px,44svh,460px)] aspect-[100/220] shrink-0 isolate">
      <div className="absolute inset-[5%] landing-laptop:inset-[5%] xl:inset-[8%]">
        <svg
          viewBox={SWEDEN_OUTLINE_VIEWBOX}
          overflow="visible"
          className="h-full w-full block"
          role="img"
          aria-label={`${reported}–${full} ${unitLong}`}
        >
          <AnimatedPinkSilhouette
            progress={pinkProgress}
            fill={INTRO_OUTER_MAP_FILL}
          />
          <SwedenSilhouette
            scale={innerScale}
            fill={INTRO_INNER_MAP_FILL}
            nudgeX={INNER_MAP_NUDGE_X}
          />
        </svg>
      </div>
    </div>
  );
});

type StatCalloutProps = {
  label: string;
  value: string;
  /** Invisible width anchor so counting digits do not shift sibling layout */
  reservedValue?: string;
  unitShort: string;
  unitLong: string;
  colorClass: string;
  className?: string;
  mobileValueRef?: RefObject<HTMLSpanElement>;
  desktopValueRef?: RefObject<HTMLSpanElement>;
};

function StableStatValue({
  value,
  reservedValue,
  className,
  valueRef,
}: {
  value: string;
  reservedValue: string;
  className: string;
  valueRef?: RefObject<HTMLSpanElement>;
}) {
  return (
    <span className={`inline-grid ${className}`}>
      <span
        className="col-start-1 row-start-1 invisible pointer-events-none select-none"
        aria-hidden="true"
      >
        {reservedValue}
      </span>
      <span
        ref={valueRef}
        className="col-start-1 row-start-1"
        {...(valueRef ? { "aria-live": "polite" as const } : {})}
      >
        {valueRef ? null : value}
      </span>
    </span>
  );
}

function StatCallout({
  label,
  value,
  reservedValue,
  unitShort,
  unitLong,
  colorClass,
  className,
  mobileValueRef,
  desktopValueRef,
}: StatCalloutProps) {
  const widthAnchor = reservedValue ?? value;

  return (
    <div className={className ?? ""}>
      <div className="md:hidden flex flex-col items-center text-center px-0.5">
        <p className={`${NATION_STORY_TYPE.display} ${colorClass}`}>
          <StableStatValue
            value={value}
            reservedValue={widthAnchor}
            className="justify-items-center"
            valueRef={mobileValueRef}
          />
        </p>
        <p
          className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} mt-1 story-short:mt-0.5 px-0.5 leading-normal`}
        >
          {unitShort}
        </p>
        <p
          className={`${NATION_STORY_TYPE.meta} leading-snug ${NATION_STORY_TEXT.secondary} mt-2 story-short:mt-1 max-w-[11rem]`}
        >
          {label}
        </p>
      </div>

      <div className="hidden md:block text-left min-w-[12.5rem]">
        <p
          className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} mb-1`}
        >
          {label}
        </p>
        <p
          className={`${NATION_STORY_TYPE.display} leading-none ${colorClass}`}
        >
          <StableStatValue
            value={value}
            reservedValue={widthAnchor}
            className="justify-items-start"
            valueRef={desktopValueRef}
          />
        </p>
        <p
          className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} mt-1.5 leading-normal whitespace-nowrap`}
        >
          {unitLong}
        </p>
      </div>
    </div>
  );
}

type PinkStatCalloutProps = {
  label: string;
  unitShort: string;
  unitLong: string;
  colorClass: string;
  className?: string;
  /** 0–1, shared with the pink map scale animation */
  progress: MotionValue<number>;
  targetMton: number;
  reducedMotion: boolean | null;
};

const PinkStatCallout = memo(function PinkStatCallout({
  label,
  unitShort,
  unitLong,
  colorClass,
  className,
  progress,
  targetMton,
  reducedMotion,
}: PinkStatCalloutProps) {
  const { currentLanguage } = useLanguage();
  const reservedValue = formatMton(targetMton, currentLanguage, 0);
  const initialValue = formatMton(0, currentLanguage, 0);
  const mobileValueRef = useRef<HTMLSpanElement>(null);
  const desktopValueRef = useRef<HTMLSpanElement>(null);
  const lastRoundedRef = useRef(-1);

  const writeValue = (rounded: number) => {
    const text = formatMton(rounded, currentLanguage, 0);
    if (mobileValueRef.current) mobileValueRef.current.textContent = text;
    if (desktopValueRef.current) desktopValueRef.current.textContent = text;
  };

  useMotionValueEvent(progress, "change", (p) => {
    const clamped = Math.min(1, Math.max(p, 0));
    const rounded = Math.round(clamped * targetMton);
    if (rounded === lastRoundedRef.current) return;
    lastRoundedRef.current = rounded;
    writeValue(rounded);
  });

  useEffect(() => {
    if (!reducedMotion) return;
    lastRoundedRef.current = Math.round(targetMton);
    writeValue(targetMton);
  }, [reducedMotion, targetMton, currentLanguage]);

  useLayoutEffect(() => {
    const clamped = Math.min(1, Math.max(progress.get(), 0));
    const rounded = Math.round(clamped * targetMton);
    if (rounded === lastRoundedRef.current) {
      writeValue(rounded);
      return;
    }
    lastRoundedRef.current = rounded;
    writeValue(rounded);
  });

  return (
    <div className={className}>
      <StatCallout
        label={label}
        value={initialValue}
        reservedValue={reservedValue}
        unitShort={unitShort}
        unitLong={unitLong}
        colorClass={colorClass}
        mobileValueRef={mobileValueRef}
        desktopValueRef={desktopValueRef}
      />
    </div>
  );
});

type IntroPunchContent = {
  pinkProgress: MotionValue<number>;
  reducedMotion: boolean | null;
  innerScale: number;
  reported: string;
  full: string;
  fullValue: number;
  unitShort: string;
  unitLong: string;
  usualLabel: string;
  fullLabel: string;
};

const IntroStatCallouts = memo(function IntroStatCallouts({
  className,
  ...content
}: IntroPunchContent & { className?: string }) {
  const {
    pinkProgress,
    reducedMotion,
    reported,
    fullValue,
    unitShort,
    unitLong,
    usualLabel,
    fullLabel,
  } = content;

  return (
    <div
      className={`grid w-full max-w-[22rem] grid-cols-2 gap-x-4 md:flex md:w-auto md:max-w-none md:flex-col md:items-start md:gap-5 lg:gap-6 md:shrink-0 ${className ?? ""}`}
    >
      <StatCallout
        label={usualLabel}
        value={reported}
        reservedValue={reported}
        unitShort={unitShort}
        unitLong={unitLong}
        colorClass={INTRO_USUAL_VALUE_CLASS}
        className="order-1"
      />
      <PinkStatCallout
        reducedMotion={reducedMotion}
        progress={pinkProgress}
        targetMton={fullValue}
        label={fullLabel}
        unitShort={unitShort}
        unitLong={unitLong}
        colorClass={INTRO_FULL_VALUE_CLASS}
        className="order-2"
      />
    </div>
  );
});

function useIntroPunchContent(metrics: NationStoryMetrics): IntroPunchContent {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();

  const reportedValue = metrics.territorialLatestMton;
  const fullValue = Math.max(metrics.combinedLatestMton, reportedValue);
  const reported = formatMton(reportedValue, currentLanguage, 0);
  const full = formatMton(fullValue, currentLanguage, 0);
  const fillRatio = reportedValue / fullValue;
  const innerScale = Math.sqrt(fillRatio);
  const pinkProgress = useMotionValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion === null) return;
    if (reducedMotion) {
      pinkProgress.set(1);
      return;
    }
    pinkProgress.set(0);
    const controls = animate(pinkProgress, 1, PINK_REVEAL_TRANSITION);
    return () => controls.stop();
  }, [reducedMotion, pinkProgress]);

  return {
    pinkProgress,
    reducedMotion,
    innerScale,
    reported,
    full,
    fullValue,
    unitShort: t("nation.story.unit.mtonCo2e"),
    unitLong: t("nation.story.unit.millionTco2e"),
    usualLabel: t("nation.story.intro.usualLabel"),
    fullLabel: t("nation.story.intro.fullLabel"),
  };
}

/**
 * Hero visual: a smaller blue Sweden (what we usually discuss) nested inside
 * a larger orange silhouette (the full picture). The ring between them is
 * the emissions gap the story unpacks.
 */
export function NationIntroPunch({ metrics }: NationIntroPunchProps) {
  const content = useIntroPunchContent(metrics);

  return (
    <div className="mx-auto grid max-w-full grid-cols-1 justify-items-center gap-2 max-md:gap-1.5 story-short:gap-1">
      <IntroSwedenMaps
        pinkProgress={content.pinkProgress}
        innerScale={content.innerScale}
        reported={content.reported}
        full={content.full}
        unitLong={content.unitLong}
      />
      <IntroStatCallouts {...content} />
    </div>
  );
}

function IntroPunchVisual({ content }: { content: IntroPunchContent }) {
  return (
    <div className="mx-auto grid max-w-full grid-cols-1 justify-items-center gap-2 max-md:gap-1.5 story-short:gap-1 md:flex md:w-fit md:max-w-full md:items-center md:justify-center md:gap-6 story-compact:gap-6 lg:gap-10 xl:gap-14">
      <IntroSwedenMaps
        pinkProgress={content.pinkProgress}
        innerScale={content.innerScale}
        reported={content.reported}
        full={content.full}
        unitLong={content.unitLong}
      />
      <IntroStatCallouts {...content} />
    </div>
  );
}

/** Landing and other embeds: map + stats side by side from md up. */
export function NationIntroVisual({ metrics }: NationIntroPunchProps) {
  const content = useIntroPunchContent(metrics);
  return <IntroPunchVisual content={content} />;
}

/** Intro hero: stacked on mobile; centered title/body with map + stats side by side on desktop. */
export function NationIntroHero({ metrics }: NationIntroPunchProps) {
  const { t } = useTranslation();
  const content = useIntroPunchContent(metrics);
  const title = t("nation.story.intro.title");
  const paragraph = t("nation.story.intro.paragraph1");

  return (
    <div className="relative w-full max-w-5xl mx-auto shrink-0 md:max-w-6xl">
      <div className="text-center space-y-1.5 max-md:space-y-1 story-short:space-y-0.5 md:space-y-3 story-compact:space-y-2 lg:space-y-4">
        <h1 className={`${NATION_STORY_TYPE.heroTitle} text-white`}>{title}</h1>
        <p
          className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} max-w-2xl mx-auto`}
        >
          {paragraph}
        </p>
        <div className="pt-2 max-md:pt-1.5 story-short:pt-1 md:pt-4 story-compact:pt-3 lg:pt-6 xl:pt-10">
          <IntroPunchVisual content={content} />
        </div>
      </div>
    </div>
  );
}

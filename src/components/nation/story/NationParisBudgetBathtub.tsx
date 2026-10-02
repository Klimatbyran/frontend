import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useParisBudget } from "@/hooks/nation/useParisBudget";
import type { ParisBudgetFacts } from "@/hooks/nation/useParisBudget";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";

const RIM_Y = 74;
const FLOOR_Y = 206;
const BASIN_LEFT = 54;
const BASIN_RIGHT = 386;
const BASIN_CLIP =
  "M54 74 C54 150 84 196 142 202 L298 202 C356 196 386 150 386 74 Z";
const BASIN_WALL =
  "M38 68 C38 152 72 204 138 214 L302 214 C368 204 402 152 402 68";
const STROKE = "rgba(255,255,255,0.4)";

type YearPoint = { year: number; cumulativeMton: number };

function buildCumulative(facts: ParisBudgetFacts): YearPoint[] {
  let cumulative = 0;
  return facts.path.map((point) => {
    cumulative += point.trendMton;
    return { year: point.year, cumulativeMton: cumulative };
  });
}

function Spill({
  x,
  direction,
  animate,
}: {
  x: number;
  direction: -1 | 1;
  animate: boolean;
}) {
  const stream = `M${x} ${RIM_Y - 2} c${direction * 10} 14 ${direction * 12} 40 ${direction * 8} 74`;

  return (
    <g>
      <path
        d={stream}
        fill="none"
        stroke="var(--pink-3)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity={0.85}
      />
      {animate && (
        <motion.circle
          cx={x + direction * 10}
          cy={RIM_Y + 30}
          r={4}
          fill="var(--pink-2)"
          animate={{ cy: [RIM_Y + 20, RIM_Y + 86], opacity: [1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "easeIn" }}
        />
      )}
    </g>
  );
}

function ParisBudgetBathtubVisual({ facts }: { facts: ParisBudgetFacts }) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();
  const clipId = `budget-tub-${useId().replace(/:/g, "")}`;
  const years = useMemo(() => buildCumulative(facts), [facts]);
  const [index, setIndex] = useState(() => {
    const spent = years.findIndex(
      (point) => point.year === facts.budgetSpentYear,
    );
    return spent >= 0 ? spent : years.length - 1;
  });

  const current = years[Math.min(index, years.length - 1)];
  const ratio = current.cumulativeMton / facts.budgetMton;
  const waterTop = FLOOR_Y - Math.min(ratio, 1) * (FLOOR_Y - RIM_Y);
  const overflowing = ratio > 1;
  const waterColor = overflowing ? "var(--pink-4)" : "var(--blue-4)";
  const surfaceColor = overflowing ? "var(--pink-2)" : "var(--blue-2)";
  const unit = t("nation.story.unit.mtonCo2e");
  const budgetLabel = `${formatMton(facts.budgetMton, currentLanguage, 0)} ${unit}`;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h2 className={NATION_STORY_TYPE.title}>
          {t("nation.story.parisBudgetBathtub.title")}
        </h2>
        <p className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}>
          {t("nation.story.parisBudgetBathtub.intro", { budget: budgetLabel })}
        </p>
      </div>

      <svg
        viewBox="0 0 440 272"
        className="mx-auto h-auto w-full max-w-lg md:mx-0"
        role="img"
        aria-label={t("nation.story.parisBudgetBathtub.chartAria", {
          year: current.year,
          percent: Math.round(ratio * 100),
        })}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={BASIN_CLIP} />
          </clipPath>
        </defs>

        <path
          d={`M348 ${RIM_Y - 6} V34 Q348 20 334 20 H326 V24`}
          fill="none"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M322 24 h8 v4 h-8 z" fill={STROKE} />
        {!reducedMotion && (
          <motion.circle
            cx={326}
            cy={32}
            r={3.2}
            fill={surfaceColor}
            animate={{ cy: [32, 66], opacity: [0, 1, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.3, ease: "easeIn" }}
          />
        )}

        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x={BASIN_LEFT}
            width={BASIN_RIGHT - BASIN_LEFT}
            initial={false}
            animate={{
              y: waterTop,
              height: FLOOR_Y - waterTop,
              fill: waterColor,
            }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
            fillOpacity={0.9}
          />
        </g>
        <motion.line
          x1={BASIN_LEFT + 4}
          x2={BASIN_RIGHT - 4}
          initial={false}
          animate={{ y1: waterTop, y2: waterTop, stroke: surfaceColor }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
          strokeWidth="3"
        />

        {overflowing && (
          <>
            <path
              d={`M${BASIN_LEFT - 4} ${RIM_Y} Q220 ${RIM_Y - 26} ${BASIN_RIGHT + 4} ${RIM_Y} Z`}
              fill="var(--pink-4)"
              fillOpacity={0.9}
            />
            <Spill x={BASIN_LEFT - 6} direction={-1} animate={!reducedMotion} />
            <Spill x={BASIN_RIGHT + 6} direction={1} animate={!reducedMotion} />
            <ellipse
              cx="220"
              cy="250"
              rx="124"
              ry="9"
              fill="var(--pink-4)"
              fillOpacity={0.55}
            />
          </>
        )}

        <path
          d={BASIN_WALL}
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse
          cx="220"
          cy="68"
          rx="182"
          ry="13"
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
        />
        <path
          d="M140 214 Q140 230 128 238"
          fill="none"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M300 214 Q300 230 312 238"
          fill="none"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <line
          x1="20"
          x2="420"
          y1={RIM_Y}
          y2={RIM_Y}
          stroke={overflowing ? "var(--pink-2)" : "var(--green-2)"}
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        <text
          x="20"
          y={RIM_Y - 10}
          fill={overflowing ? "var(--pink-2)" : "var(--green-2)"}
          fontSize="13"
        >
          {t("nation.story.parisBudgetBathtub.parisLimitLabel")}
        </text>

        <text
          x="220"
          y="150"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="34"
          fontWeight={500}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(ratio * 100)}%
        </text>
        <text
          x="220"
          y="172"
          textAnchor="middle"
          fill="rgba(255,255,255,0.75)"
          fontSize="13"
        >
          {t("nation.story.parisBudgetBathtub.percentUsed")}
        </text>
      </svg>

      <div className="mx-auto max-w-lg space-y-3 md:mx-0">
        <input
          type="range"
          min={0}
          max={years.length - 1}
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
          aria-label={t("nation.story.parisBudgetBathtub.yearSlider")}
          className="w-full accent-[#E2FF8D]"
        />
        <div className="flex items-baseline justify-between text-sm text-grey">
          <span>{years[0].year}</span>
          <span className="text-2xl font-light text-white tabular-nums">
            {current.year}
          </span>
          <span>{years.at(-1)!.year}</span>
        </div>
      </div>

      <p
        className={`mx-auto max-w-xl text-center text-lg font-light md:mx-0 md:text-left ${NATION_STORY_TEXT.body}`}
      >
        {overflowing
          ? t("nation.story.parisBudgetBathtub.overflow", {
              year: facts.budgetSpentYear ?? facts.endYear,
            })
          : t("nation.story.parisBudgetBathtub.withinBudget", {
              year: facts.budgetSpentYear ?? facts.endYear,
            })}
      </p>
    </div>
  );
}

export function NationParisBudgetBathtub() {
  const { facts } = useParisBudget();

  if (!facts) return null;

  return (
    <section
      data-story-section
      data-story-chapter="parisBudgetBathtub"
      className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 pt-[var(--story-stage-pad-top)] pb-[var(--story-stage-pad-bottom)] md:py-8 story-compact:py-6 lg:py-10 xl:py-8"
    >
      <div className="w-full max-w-2xl mx-auto">
        <ParisBudgetBathtubVisual facts={facts} />
      </div>
    </section>
  );
}

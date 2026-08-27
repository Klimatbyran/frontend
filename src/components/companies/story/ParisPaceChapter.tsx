import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import type { CompanyStoryMetrics } from "@/utils/data/companyStoryMetrics";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import {
  COMPANY_STORY_COLORS,
  COMPANY_STORY_TEXT_CLASSES,
} from "@/components/companies/story/companyStoryTheme";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 300;
const MARGIN = { top: 24, right: 30, bottom: 34, left: 30 };
const START_YEAR = 2025;
const END_YEAR = 2050;
/** Years annotated with how far emissions must have fallen by then. */
const ANNOTATED_YEARS = [2030, 2040];

function xForYear(year: number): number {
  const innerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
  return (
    MARGIN.left + ((year - START_YEAR) / (END_YEAR - START_YEAR)) * innerWidth
  );
}

function yForRemaining(remainingPercent: number): number {
  const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  return MARGIN.top + (1 - remainingPercent / 100) * innerHeight;
}

type PaceAnnotation = {
  year: number;
  x: number;
  y: number;
  dropPercent: number;
};

type ParisPaceChapterProps = {
  metrics: CompanyStoryMetrics;
};

/**
 * The rule of the game: the Carbon Law descent that Klimatkollen assesses
 * companies against, drawn as a single line gliding towards zero.
 */
export function ParisPaceChapter({ metrics }: ParisPaceChapterProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  const pathD = useMemo(() => {
    return metrics.paceCurve
      .map((point, i) => {
        const x = xForYear(point.year);
        const y = yForRemaining(point.remainingPercent);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [metrics.paceCurve]);

  const annotations: PaceAnnotation[] = useMemo(
    () =>
      ANNOTATED_YEARS.map((year) => {
        const remaining = metrics.paceRemainingAt(year);
        return {
          year,
          x: xForYear(year),
          y: yForRemaining(remaining),
          dropPercent: Math.round(100 - remaining),
        };
      }),
    [metrics],
  );

  const axisYears = [START_YEAR, 2030, 2040, END_YEAR];
  const reductionPercent = Math.round(
    100 - metrics.paceRemainingAt(START_YEAR + 1),
  );
  const halving = Math.round(metrics.halvingYears);

  return (
    <div className="max-w-3xl mx-auto text-center space-y-5 story-short:space-y-3 md:space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className={NATION_STORY_TYPE.title}
      >
        {t("companies.story.pace.title")}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} max-w-2xl mx-auto`}
      >
        {t("companies.story.pace.body", {
          reduction: reductionPercent,
          halving,
        })}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.4 }}
      >
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full max-w-2xl mx-auto block"
          role="img"
          aria-label={t("companies.story.pace.chartAria")}
        >
          {/* Baseline (today's level) and zero line */}
          <line
            x1={MARGIN.left}
            x2={CHART_WIDTH - MARGIN.right}
            y1={yForRemaining(100)}
            y2={yForRemaining(100)}
            stroke="rgba(255,255,255,0.14)"
            strokeDasharray="3 5"
          />
          <line
            x1={MARGIN.left}
            x2={CHART_WIDTH - MARGIN.right}
            y1={yForRemaining(0)}
            y2={yForRemaining(0)}
            stroke="rgba(255,255,255,0.14)"
          />
          <text
            x={MARGIN.left}
            y={yForRemaining(100) - 8}
            fill="var(--grey)"
            fontSize={12}
            textAnchor="start"
          >
            {t("companies.story.pace.todayLabel")}
          </text>
          <text
            x={CHART_WIDTH - MARGIN.right}
            y={yForRemaining(0) - 8}
            fill="var(--grey)"
            fontSize={12}
            textAnchor="end"
          >
            {t("companies.story.pace.zeroLabel")}
          </text>

          {/* The descent itself, drawn in as the reader arrives */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={COMPANY_STORY_COLORS.pace}
            strokeWidth={3}
            strokeLinecap="round"
            initial={reducedMotion ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 1.8, ease: "easeInOut", delay: 0.15 }
            }
          />

          {annotations.map((annotation, i) => (
            <motion.g
              key={annotation.year}
              initial={reducedMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.4, delay: 0.9 + i * 0.45 }
              }
            >
              <circle
                cx={annotation.x}
                cy={annotation.y}
                r={5}
                fill={COMPANY_STORY_COLORS.pace}
              />
              <text
                x={annotation.x + 10}
                y={annotation.y - 10}
                fill="#ffffff"
                fontSize={13}
                fontWeight={500}
                textAnchor="start"
              >
                {t("companies.story.pace.annotation", {
                  drop: annotation.dropPercent,
                  year: annotation.year,
                })}
              </text>
            </motion.g>
          ))}

          {axisYears.map((year) => (
            <text
              key={year}
              x={xForYear(year)}
              y={CHART_HEIGHT - 10}
              fill="var(--grey)"
              fontSize={12}
              textAnchor="middle"
            >
              {year}
            </text>
          ))}
        </svg>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} max-w-2xl mx-auto`}
      >
        {t("companies.story.pace.body2")}{" "}
        <span className={COMPANY_STORY_TEXT_CLASSES.pace}>
          {t("companies.story.pace.body2Question")}
        </span>
      </motion.p>
    </div>
  );
}

import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  formatMton,
  NATION_BASELINE_YEAR,
  type NationStackDataPoint,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import { ChartTooltip, getXAxisProps } from "@/components/charts";
import {
  NATION_STORY_CHART,
  NATION_STORY_COLORS,
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";
import { useStoryCompactViewport } from "@/components/nation/story/useStoryCompactViewport";
import { useStoryShortViewport } from "@/components/nation/story/useStoryShortViewport";
import {
  createMirroredYAxisTick,
  getStoryChartMargin,
  STORY_Y_AXIS_WIDTH,
  StoryChartYAxisUnit,
} from "@/components/nation/story/storyChartAxis";
import type { TooltipProps } from "recharts";

function NationStoryChartTooltip({
  active,
  payload,
  label,
  unit,
  customFormatter,
}: TooltipProps<number, string> & {
  unit: string;
  customFormatter: (value: number) => string;
}) {
  const reversedPayload = payload ? [...payload].reverse() : undefined;
  return (
    <ChartTooltip
      active={active}
      payload={reversedPayload}
      label={label}
      unit={unit}
      customFormatter={customFormatter}
    />
  );
}

const LAYERS = [
  {
    dataKey: "territorialFossil" as const,
    color: NATION_STORY_COLORS.territorial,
    translationKey: "nation.story.graph.territorialFossil",
    captionKey: "nation.story.stacked.layerCaption1",
  },
  {
    dataKey: "productionBeyondTerritorial" as const,
    color: NATION_STORY_COLORS.production,
    translationKey: "nation.story.graph.productionBeyondTerritorial",
    captionKey: "nation.story.stacked.layerCaption2",
  },
  {
    dataKey: "consumptionAbroad" as const,
    color: NATION_STORY_COLORS.consumption,
    translationKey: "nation.story.graph.consumptionAbroad",
    captionKey: "nation.story.stacked.layerCaption3",
  },
  {
    dataKey: "biogenic" as const,
    color: NATION_STORY_COLORS.biogenic,
    translationKey: "nation.story.graph.biogenic",
    captionKey: "nation.story.stacked.layerCaption4",
  },
];

/** Shorter than the 90vh default so the reveal is quicker to scroll through. */
const STACKED_STEP_VH = 70;

const LAYER_COUNT = LAYERS.length;
/** One extra scroll step after all layers: names-only legend, no caption. */
const STEP_COUNT = LAYER_COUNT + 1;

function buildLegendEntries(visibleLayers: number) {
  return LAYERS.slice(0, visibleLayers);
}

interface NationStackedChartProps {
  data: NationStackDataPoint[];
  className?: string;
  /** Static embed for landing etc. – no scroll-pinning or story chrome. */
  embedded?: boolean;
}

export const NationStackedChart: FC<NationStackedChartProps> = ({
  data,
  className,
  embedded = false,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile, isTablet } = useScreenSize();
  const isStoryShort = useStoryShortViewport();
  const isStoryCompact = useStoryCompactViewport();
  const reducedMotion = useReducedMotion();
  const latestYear = data.at(-1)?.year ?? NATION_BASELINE_YEAR;
  // Mobile skips 2020: it sits so close to the latest year that recharts
  // drops one of the colliding labels, leaving uneven spacing.
  const xAxisTicks = useMemo(() => {
    const ticks = isMobile ? [1990, 2000, 2010] : [1990, 2000, 2010, 2020];
    if (latestYear > 2020) ticks.push(latestYear);
    return ticks;
  }, [latestYear, isMobile]);

  // Scroll-driven: each step reveals one more area layer, then a summary step.
  const { ref, step, sectionVh, stageStyle } = usePinnedSteps(
    STEP_COUNT,
    STACKED_STEP_VH,
  );
  const visibleLayers = embedded
    ? LAYER_COUNT
    : reducedMotion
      ? LAYER_COUNT
      : Math.min(step + 1, LAYER_COUNT);
  const showCaption = !embedded && !reducedMotion && step < LAYER_COUNT;

  // Mobile: legend becomes a KPI readout while scrubbing the chart.
  const [scrubYear, setScrubYear] = useState<number | null>(null);
  const scrubClearRef = useRef<number | null>(null);
  const latestPoint = data.at(-1);
  const scrubbing = isMobile && scrubYear !== null;
  const showLegendValues = scrubbing;
  const readoutYear = scrubYear ?? latestYear;
  const readoutPoint =
    data.find((point) => point.year === readoutYear) ?? latestPoint;
  const handleScrub = ({ activeLabel }: { activeLabel?: string | number }) => {
    const year = Number(activeLabel);
    if (!Number.isFinite(year)) return;
    setScrubYear(year);
    if (scrubClearRef.current) window.clearTimeout(scrubClearRef.current);
    scrubClearRef.current = window.setTimeout(() => setScrubYear(null), 2500);
  };
  useEffect(
    () => () => {
      if (scrubClearRef.current) window.clearTimeout(scrubClearRef.current);
    },
    [],
  );

  // Height caps so phones with browser chrome still fit the title, caption,
  const chartHeight = embedded
    ? "100%"
    : isMobile
      ? isStoryShort
        ? "min(160px, 20svh)"
        : "min(200px, 24svh)"
      : isStoryCompact || isTablet
        ? 260
        : 330;
  const activeLayer = LAYERS[Math.min(visibleLayers, LAYER_COUNT) - 1];

  // Full-bleed mobile plot: the edge ticks anchor inward so "1990" and the
  // latest year don't clip at the svg boundary.
  const edgeAwareTick = ({
    x,
    y,
    payload,
  }: {
    x: number;
    y: number;
    payload: { value: number };
  }) => {
    const anchor =
      payload.value === NATION_BASELINE_YEAR
        ? "start"
        : payload.value === latestYear
          ? "end"
          : "middle";
    return (
      <text
        x={x}
        y={y + 10}
        textAnchor={anchor}
        fontSize={isMobile ? 10 : 12}
        fill="var(--grey)"
      >
        {payload.value}
      </text>
    );
  };

  // Mirrored Y labels paint above the fills (the axis is declared after the
  // areas), so plain sharp white text is enough. The 0 tick is skipped – the
  // baseline explains itself.
  const mirroredYAxisTick = useMemo(
    () => createMirroredYAxisTick(currentLanguage),
    [currentLanguage],
  );
  const unitLabel = t("nation.story.unit.mtonCo2e");
  const legendEntries = useMemo(
    () => buildLegendEntries(visibleLayers),
    [visibleLayers],
  );
  const readoutLegendEntries = useMemo(
    () => [...legendEntries].reverse(),
    [legendEntries],
  );

  const chartBlock = (
    <>
      {!embedded && (
        <>
          <p
            className={`hidden md:block ${NATION_STORY_TYPE.eyebrow} ${NATION_STORY_TEXT.eyebrow} mb-2 md:mb-3`}
          >
            {t("nation.story.stacked.layerCounter", {
              current: Math.min(step + 1, STEP_COUNT),
              total: STEP_COUNT,
            })}
          </p>
          <h2
            className={`${NATION_STORY_TYPE.title} text-white mb-2 story-short:mb-1 md:mb-4`}
          >
            {t("nation.story.stacked.title")}
          </h2>
        </>
      )}

      <div
        className={`mb-2 story-short:mb-0.5 md:mb-4 ${
          showCaption
            ? "min-h-[3.75rem] story-short:min-h-[2.5rem] md:min-h-[2.5rem]"
            : embedded
              ? "min-h-0"
              : ""
        }`}
      >
        {showCaption && (
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex items-start gap-2 md:gap-3 ${NATION_STORY_TYPE.meta} text-white`}
          >
            <span
              className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0 mt-1 md:mt-1.5"
              style={{ backgroundColor: LAYERS[step].color }}
            />
            {t(LAYERS[step].captionKey)}
          </motion.p>
        )}
      </div>

      <div
        className={`relative touch-pan-x ${embedded ? "min-h-0 flex-1" : ""}`}
        style={{ width: "100%", height: chartHeight }}
      >
        <StoryChartYAxisUnit unit={unitLabel} />
        {!embedded && (
          <AnimatePresence>
            <motion.div
              key={`glow-${activeLayer.color}`}
              aria-hidden
              className="absolute inset-x-6 inset-y-2 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: activeLayer.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={getStoryChartMargin(isMobile)}
            {...(!embedded && isMobile
              ? { onMouseMove: handleScrub, onTouchMove: handleScrub }
              : {})}
          >
            <XAxis
              {...getXAxisProps(
                "year",
                [NATION_BASELINE_YEAR, latestYear],
                xAxisTicks,
                edgeAwareTick,
              )}
              interval={0}
            />
            <Tooltip
              content={
                !embedded && isMobile ? (
                  () => null
                ) : (
                  <NationStoryChartTooltip
                    unit={t("nation.story.unit.mton")}
                    customFormatter={(value) =>
                      formatMton(value, currentLanguage, 1)
                    }
                  />
                )
              }
              cursor={{ stroke: "var(--grey)", strokeDasharray: "4 4" }}
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />
            {LAYERS.slice(0, visibleLayers).map((layer, index) => (
              <Area
                key={layer.dataKey}
                type="monotone"
                dataKey={layer.dataKey}
                stackId="emissions"
                stroke={layer.color}
                strokeWidth={NATION_STORY_CHART.strokeWidth}
                fill={layer.color}
                fillOpacity={
                  index === visibleLayers - 1
                    ? NATION_STORY_CHART.fillOpacity
                    : NATION_STORY_CHART.fillOpacity * 0.8
                }
                name={t(layer.translationKey)}
                connectNulls={false}
                isAnimationActive={!embedded}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            ))}
            <YAxis
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              mirror={isMobile}
              width={isMobile ? 36 : STORY_Y_AXIS_WIDTH}
              tickMargin={isMobile ? undefined : 4}
              tick={
                isMobile
                  ? mirroredYAxisTick
                  : { fill: "var(--grey)", fontSize: 12 }
              }
              tickFormatter={(value: number) =>
                formatMton(value, currentLanguage, 0)
              }
              domain={[0, "auto"]}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 story-short:mt-1.5 md:mt-5 border-t border-white/10 pt-2.5 story-short:pt-1.5 md:pt-3 shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          {!embedded && showLegendValues ? (
            <motion.div
              key="legend-readout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.35,
                ease: "easeOut",
              }}
              className="space-y-1.5 story-short:space-y-1 md:space-y-2"
            >
              <p className={NATION_STORY_TYPE.meta}>
                <span className="text-white tabular-nums font-medium">
                  {readoutYear}
                </span>
              </p>
              <div className="flex flex-col gap-y-1.5 story-short:gap-y-1">
                {readoutLegendEntries.map((layer) => {
                  const layerIndex = LAYERS.indexOf(layer);
                  return (
                    <span
                      key={layer.dataKey}
                      className={`flex items-center gap-2 md:gap-2.5 w-full ${NATION_STORY_TYPE.meta}`}
                    >
                      <span
                        className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className={NATION_STORY_TEXT.secondary}>
                        {t(layer.translationKey)}
                      </span>
                      <span className="ml-auto text-white tabular-nums">
                        {layerIndex === 0 ? "" : "+"}
                        {formatMton(
                          readoutPoint?.[layer.dataKey] ?? 0,
                          currentLanguage,
                          0,
                        )}
                      </span>
                    </span>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="legend-compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.25,
                ease: "easeOut",
              }}
              className="space-y-1.5 story-short:space-y-1 md:space-y-2"
            >
              {!embedded && isMobile && (
                <p
                  className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}
                >
                  {t("nation.story.stacked.scrubHint")}
                </p>
              )}
              <div className="flex flex-col gap-y-1.5 story-short:gap-y-1 md:flex-row md:flex-wrap md:items-center md:gap-x-8">
                {readoutLegendEntries.map((layer) => (
                  <span
                    key={layer.dataKey}
                    className={`flex items-center gap-2 md:gap-2.5 ${NATION_STORY_TYPE.meta}`}
                  >
                    <span
                      className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className={NATION_STORY_TEXT.secondary}>
                      {t(layer.translationKey)}
                    </span>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div
        className={`relative flex h-full min-h-0 flex-col ${className ?? ""}`}
      >
        {chartBlock}
      </div>
    );
  }

  return (
    <section
      ref={ref}
      data-story-section
      data-story-chapter="stacked"
      data-story-step={step}
      data-story-steps={STEP_COUNT}
      data-story-step-vh={STACKED_STEP_VH}
      className="relative"
      style={{ height: `${sectionVh}vh` }}
    >
      <div
        className="h-[100svh] min-h-0 flex flex-col px-4 md:px-8 pt-[var(--story-stage-pad-top)] pb-[var(--story-stage-pad-bottom)] md:py-0 overflow-hidden"
        style={stageStyle}
      >
        {/* Same depth backdrop as the hero and journey chapters */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <div
          className={`relative flex min-h-0 flex-1 flex-col justify-center w-full max-w-4xl mx-auto ${className ?? ""}`}
        >
          {chartBlock}
        </div>
      </div>
    </section>
  );
};

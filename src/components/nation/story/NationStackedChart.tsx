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
import { AnimatePresence, motion } from "framer-motion";
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

/**
 * Mobile runs the plot edge-to-edge so it lines up with the heading and copy
 * (the Y labels mirror inside the plot instead of reserving a gutter).
 * Desktop keeps room for the outside axis + rotated unit label.
 */
function getStoryChartMargin(isMobile: boolean) {
  return {
    top: 8,
    right: isMobile ? 0 : 12,
    left: isMobile ? 0 : 20,
    bottom: 0,
  };
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

interface NationStackedChartProps {
  data: NationStackDataPoint[];
  className?: string;
}

export const NationStackedChart: FC<NationStackedChartProps> = ({
  data,
  className,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const latestYear = data.at(-1)?.year ?? NATION_BASELINE_YEAR;
  // Mobile skips 2020: it sits so close to the latest year that recharts
  // drops one of the colliding labels, leaving uneven spacing.
  const xAxisTicks = useMemo(() => {
    const ticks = isMobile ? [1990, 2000, 2010] : [1990, 2000, 2010, 2020];
    if (latestYear > 2020) ticks.push(latestYear);
    return ticks;
  }, [latestYear, isMobile]);

  // Scroll-driven: each step reveals one more area layer.
  const { ref, step, sectionVh, stageStyle } = usePinnedSteps(
    LAYERS.length,
    STACKED_STEP_VH,
  );
  const visibleLayers = step + 1;

  // Mobile has no floating tooltip (it covers the chart); instead the legend
  // becomes a readout while the reader scrubs a finger across the chart,
  // showing that year's stacking arithmetic (47, +4, +60, +48 = total). It
  // lingers briefly after the finger lifts, then returns to names-only.
  const [scrubYear, setScrubYear] = useState<number | null>(null);
  const scrubClearRef = useRef<number | null>(null);
  const latestPoint = data.at(-1);
  const scrubbing = isMobile && scrubYear !== null;
  const readoutYear = scrubYear ?? latestYear;
  const readoutPoint =
    data.find((point) => point.year === readoutYear) ?? latestPoint;
  const readoutTotal = LAYERS.slice(0, visibleLayers).reduce(
    (sum, layer) => sum + (readoutPoint?.[layer.dataKey] ?? 0),
    0,
  );
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

  // Height caps at 32svh so short phones (~570-670px tall) still fit the
  // title, caption, chart and legend inside the pinned stage.
  const chartHeight = isMobile ? "min(240px, 32svh)" : 330;
  const activeLayer = LAYERS[visibleLayers - 1];

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
        fontSize={10}
        fill="var(--grey)"
      >
        {payload.value}
      </text>
    );
  };

  // Mirrored Y labels paint above the fills (the axis is declared after the
  // areas), so plain sharp white text is enough. The 0 tick is skipped – the
  // baseline explains itself.
  const mirroredYAxisTick = ({
    x,
    y,
    payload,
  }: {
    x: number;
    y: number;
    payload: { value: number };
  }) => {
    if (payload.value === 0) return <g />;
    return (
      <text
        x={x + 2}
        y={y + 4}
        textAnchor="start"
        fontSize={11}
        fontWeight={600}
        fill="#ffffff"
      >
        {formatMton(payload.value, currentLanguage, 0)}
      </text>
    );
  };

  return (
    <section
      ref={ref}
      data-story-section
      data-story-step={step}
      data-story-steps={LAYERS.length}
      data-story-step-vh={STACKED_STEP_VH}
      className="relative"
      style={{ height: `${sectionVh}vh` }}
    >
      <div
        className="h-[100svh] flex items-center px-4 md:px-8 pt-14 pb-6 md:py-0 overflow-hidden"
        style={stageStyle}
      >
        {/* Same depth backdrop as the hero and journey chapters */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <div className={`relative w-full max-w-4xl mx-auto ${className ?? ""}`}>
          {/* Mobile relies on the step dots for progress instead */}
          <p
            className={`hidden md:block ${NATION_STORY_TYPE.eyebrow} ${NATION_STORY_TEXT.eyebrow} mb-2 md:mb-3`}
          >
            {t("nation.story.stacked.layerCounter", {
              current: visibleLayers,
              total: LAYERS.length,
            })}
          </p>
          <h2 className={`${NATION_STORY_TYPE.title} text-white mb-2 md:mb-4`}>
            {t("nation.story.stacked.title")}
          </h2>

          {/* Caption explaining the layer currently being drawn – meta scale
              like the legend rows (it runs several lines on mobile, where the
              step-header emphasis style reads too heavy), dot on line one */}
          {/* Sized for the longest caption (3 lines mobile) so the chart
              below doesn't shift vertically as the step captions swap */}
          <div className="min-h-[3.75rem] md:min-h-[2.5rem] mb-2 md:mb-4">
            <motion.p
              key={visibleLayers}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex items-start gap-2 md:gap-3 ${NATION_STORY_TYPE.meta} text-white`}
            >
              <span
                className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0 mt-1 md:mt-1.5"
                style={{ backgroundColor: LAYERS[visibleLayers - 1].color }}
              />
              {t(LAYERS[visibleLayers - 1].captionKey)}
            </motion.p>
          </div>

          {/* Mobile has no rotated axis label, so state the unit here */}
          {isMobile && (
            <p
              className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} mb-1`}
            >
              {t("nation.story.unit.mtonCo2e")}
            </p>
          )}
          <div
            className="relative"
            style={{ width: "100%", height: chartHeight }}
          >
            {/* Soft glow behind the chart in the active layer's color – the
                same cue the onion scene uses when a new layer grows */}
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={getStoryChartMargin(isMobile)}
                {...(isMobile
                  ? { onMouseMove: handleScrub, onTouchMove: handleScrub }
                  : {})}
              >
                <XAxis
                  {...getXAxisProps(
                    "year",
                    [NATION_BASELINE_YEAR, latestYear],
                    xAxisTicks,
                    isMobile ? edgeAwareTick : undefined,
                  )}
                  // Render every hand-picked tick: recharts' collision culling
                  // assumes centered labels and drops the edge-anchored 1990
                  interval={0}
                />
                {/* Mobile keeps the vertical cursor line for scrub feedback but
                    renders no tooltip box – the legend below is the readout. */}
                <Tooltip
                  content={
                    isMobile ? (
                      () => null
                    ) : (
                      <ChartTooltip
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
                    // Newest layer carries the emphasis; earlier ones recede
                    fillOpacity={
                      index === visibleLayers - 1
                        ? NATION_STORY_CHART.fillOpacity
                        : NATION_STORY_CHART.fillOpacity * 0.8
                    }
                    name={t(layer.translationKey)}
                    connectNulls={false}
                    isAnimationActive
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                ))}
                {/* Declared after the areas: recharts paints children in
                    order, and the mirrored mobile labels sit inside the plot
                    – earlier in the tree they'd be buried under the fills. */}
                <YAxis
                  stroke="var(--grey)"
                  tickLine={false}
                  axisLine={false}
                  // Mirrored on mobile: labels sit inside the plot, so the
                  // chart spans the full text column width without a gutter
                  mirror={isMobile}
                  width={isMobile ? 36 : 56}
                  tick={
                    isMobile
                      ? mirroredYAxisTick
                      : { fill: "var(--grey)", fontSize: 12 }
                  }
                  tickFormatter={(value: number) =>
                    formatMton(value, currentLanguage, 0)
                  }
                  domain={[0, "auto"]}
                  {...(!isMobile
                    ? {
                        label: {
                          value: t("nation.story.unit.mton"),
                          angle: -90,
                          position: "insideLeft" as const,
                          style: {
                            fill: "var(--grey)",
                            fontSize: 12,
                            textAnchor: "middle",
                          },
                        },
                      }
                    : {})}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend in the story's own styling. At rest it is names only; on
              mobile, scrubbing the chart turns it into a readout showing the
              scrubbed year's stacking arithmetic with a summed total. Desktop
              keeps the hover tooltip for values. */}
          <div className="mt-3 md:mt-5 border-t border-white/10 pt-2.5 md:pt-3 space-y-1.5 md:space-y-2">
            {/* Same slot: an invitation to scrub at rest, the scrubbed year
                while the finger is on the chart */}
            {isMobile &&
              (scrubbing ? (
                <p className={`${NATION_STORY_TYPE.meta}`}>
                  <span className="text-white tabular-nums font-medium">
                    {readoutYear}
                  </span>
                </p>
              ) : (
                <p
                  className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}
                >
                  {t("nation.story.stacked.scrubHint")}
                </p>
              ))}
            <div className="flex flex-col gap-y-1.5 md:flex-row md:flex-wrap md:items-center md:gap-x-8">
              {LAYERS.slice(0, visibleLayers).map((layer, index) => (
                <motion.span
                  key={layer.dataKey}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className={`flex items-center gap-2 md:gap-2.5 ${NATION_STORY_TYPE.meta}`}
                >
                  <span
                    className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className={NATION_STORY_TEXT.secondary}>
                    {t(layer.translationKey)}
                  </span>
                  {scrubbing && (
                    <span className="ml-auto text-white tabular-nums">
                      {index === 0 ? "" : "+"}
                      {formatMton(
                        readoutPoint?.[layer.dataKey] ?? 0,
                        currentLanguage,
                        0,
                      )}
                    </span>
                  )}
                </motion.span>
              ))}
            </div>
            {scrubbing && visibleLayers > 1 && (
              <p
                className={`flex items-center justify-between border-t border-white/10 pt-1.5 ${NATION_STORY_TYPE.meta} text-white font-medium`}
              >
                <span>{t("nation.story.journey.totalLabel")}</span>
                <span className="tabular-nums">
                  {formatMton(readoutTotal, currentLanguage, 0)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

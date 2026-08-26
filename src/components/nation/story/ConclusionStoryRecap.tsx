import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { BathtubRecapGraphic } from "@/components/nation/story/NationBathtub";
import {
  NATION_STORY_CHART,
  NATION_STORY_COLORS,
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  createMirroredYAxisTick,
  getStoryChartMargin,
  STORY_Y_AXIS_WIDTH,
  StoryChartYAxisUnit,
} from "@/components/nation/story/storyChartAxis";
import {
  formatMton,
  NATION_BASELINE_YEAR,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const E_COMMERCE_MTON = 0.326;

const CHART_LAYERS = [
  {
    dataKey: "territorialFossil" as const,
    color: NATION_STORY_COLORS.territorial,
    translationKey: "nation.story.graph.territorialFossil",
  },
  {
    dataKey: "productionBeyondTerritorial" as const,
    color: NATION_STORY_COLORS.production,
    translationKey: "nation.story.graph.productionBeyondTerritorial",
  },
  {
    dataKey: "consumptionAbroad" as const,
    color: NATION_STORY_COLORS.consumption,
    translationKey: "nation.story.graph.consumptionAbroad",
  },
  {
    dataKey: "biogenic" as const,
    color: NATION_STORY_COLORS.biogenic,
    translationKey: "nation.story.graph.biogenic",
  },
];

const RECAP_LEGEND_CLASS = `w-full border-t border-white/10 pt-3 mt-1 space-y-1.5 ${NATION_STORY_TYPE.meta}`;
const RECAP_DIALOG_LEGEND_CLASS = `w-full shrink-0 border-t border-white/10 pt-2 space-y-1 ${NATION_STORY_TYPE.meta}`;
const RECAP_LEGEND_ROW_CLASS = `flex items-center gap-2.5 w-full ${NATION_STORY_TYPE.meta}`;

function RecapLegendRow({
  color,
  label,
  value,
  borderedDot = false,
  total = false,
}: {
  color?: string;
  label: string;
  value?: string;
  borderedDot?: boolean;
  total?: boolean;
}) {
  return (
    <div
      className={cn(
        RECAP_LEGEND_ROW_CLASS,
        total && "border-t border-white/10 pt-1.5 text-white font-medium",
      )}
    >
      {color ? (
        <span
          className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0"
          style={{
            backgroundColor: color,
            ...(borderedDot
              ? { border: "1px solid rgba(255,255,255,0.2)" }
              : {}),
          }}
          aria-hidden
        />
      ) : (
        <span className="w-2.5 md:w-3.5 shrink-0" aria-hidden />
      )}
      <span className={total ? "flex-1" : NATION_STORY_TEXT.secondary}>
        {label}
      </span>
      {value ? (
        <span className="ml-auto tabular-nums text-white">{value}</span>
      ) : null}
    </div>
  );
}

function OnionRecapLegend({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();

  const rows = [
    {
      key: "step1",
      labelKey: "nation.story.journey.step1.label",
      color: NATION_STORY_COLORS.territorial,
    },
    {
      key: "step2",
      labelKey: "nation.story.journey.step2.label",
      color: NATION_STORY_COLORS.production,
    },
    {
      key: "step3",
      labelKey: "nation.story.journey.step3.label",
      color: NATION_STORY_COLORS.consumption,
    },
    {
      key: "step4",
      labelKey: "nation.story.journey.step4.label",
      color: NATION_STORY_COLORS.eCommerce,
      borderedDot: true,
    },
    {
      key: "step5",
      labelKey: "nation.story.journey.step5.label",
      color: NATION_STORY_COLORS.biogenic,
    },
  ];

  return (
    <div className={compact ? RECAP_DIALOG_LEGEND_CLASS : RECAP_LEGEND_CLASS}>
      <div className={cn("flex flex-col", compact ? "gap-y-1" : "gap-y-1.5")}>
        {[...rows].reverse().map((row) => (
          <RecapLegendRow
            key={row.key}
            color={row.color}
            borderedDot={row.borderedDot}
            label={t(row.labelKey)}
          />
        ))}
      </div>
    </div>
  );
}

function ChartRecapLegend({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();

  const legendRows = [...CHART_LAYERS].reverse().map((layer) => ({
    key: layer.dataKey,
    color: layer.color,
    label: t(layer.translationKey),
  }));

  return (
    <div className={compact ? RECAP_DIALOG_LEGEND_CLASS : RECAP_LEGEND_CLASS}>
      <div className={cn("flex flex-col", compact ? "gap-y-1" : "gap-y-1.5")}>
        {legendRows.map((row) => (
          <RecapLegendRow key={row.key} color={row.color} label={row.label} />
        ))}
      </div>
    </div>
  );
}

const RECAP_ONION_DIAMETER = 168;
/** Glow halo + blur spread – size rings inside this inset so nothing clips. */
const ONION_GLOW_INSET = 1.2;
const RECAP_VISUAL_HEIGHT =
  "h-[13rem] story-short:h-[12rem] md:h-[11.5rem] story-compact:md:h-[10.5rem] lg:h-[13rem]";
const RECAP_EXPANDED_VISUAL_HEIGHT =
  "h-[min(48vh,18rem)] sm:h-[min(52vh,20rem)]";

function recapExpandedFrameClass(
  variant: RecapVisualVariant,
  fitDialog = false,
) {
  const base = "flex w-full items-center justify-center";
  if (fitDialog) {
    switch (variant) {
      case "onion":
        return cn(
          base,
          "h-[min(28svh,11rem)] sm:h-[min(32svh,13rem)] shrink-0 overflow-hidden px-2 py-0",
        );
      case "bathtub":
        return cn(
          base,
          "h-[min(26svh,10rem)] sm:h-[min(30svh,12rem)] shrink-0 overflow-hidden px-2 py-0",
        );
      case "chart":
        return cn(
          base,
          "h-[min(30svh,12rem)] sm:h-[min(34svh,14rem)] shrink-0 overflow-hidden px-1 py-0",
        );
    }
  }
  switch (variant) {
    case "onion":
      return cn(
        base,
        "overflow-visible px-3 py-2 sm:px-2 sm:py-1",
        "h-[min(calc(100vw-4rem),11rem)] sm:h-[min(48vh,18rem)]",
      );
    case "bathtub":
      return cn(
        base,
        "overflow-visible px-3 py-0",
        "h-auto max-h-[min(36vh,12rem)] sm:h-[min(48vh,18rem)] sm:max-h-none",
      );
    case "chart":
      return cn(
        base,
        "overflow-hidden px-2 py-1",
        RECAP_EXPANDED_VISUAL_HEIGHT,
      );
  }
}

function recapExpandedInnerClass(variant: RecapVisualVariant) {
  switch (variant) {
    case "onion":
      return "aspect-square h-full w-full max-h-full max-w-full sm:w-auto";
    case "chart":
      return "h-full w-full min-w-0";
    case "bathtub":
      return "h-full w-full min-w-0";
  }
}
const RECAP_CHART_MARGIN = { top: 26, right: 8, left: 6, bottom: 18 };
const RECAP_DIALOG_CHART_MARGIN = { top: 30, right: 4, left: 6, bottom: 14 };

const RECAP_HEADLINE_CLASS = `${NATION_STORY_TYPE.emphasis} text-white w-full leading-snug`;
const RECAP_HEADLINE_ROW_MOBILE =
  "flex min-h-[3.25rem] items-start justify-center px-1 pt-0.5 text-center";
const RECAP_HEADLINE_ROW_DESKTOP =
  "flex h-[3rem] lg:h-[3.25rem] items-start justify-center px-1 text-center";
const RECAP_CARD_CLASS =
  "group flex h-full w-full flex-col gap-1.5 overflow-visible rounded-xl border border-white/15 bg-black/40 p-3 text-left transition-colors hover:border-white/25 hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:bg-black/60";

type RecapVisualVariant = "onion" | "chart" | "bathtub";

type RecapItem = {
  key: string;
  headline: string;
  delay: number;
  variant: RecapVisualVariant;
  renderVisual: (enlarged: boolean) => React.ReactNode;
};

function RecapVisualFrame({
  variant,
  enlarged,
  fitDialog = false,
  children,
}: {
  variant: RecapVisualVariant;
  enlarged: boolean;
  fitDialog?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        enlarged
          ? recapExpandedFrameClass(variant, fitDialog)
          : cn(
              "flex w-full items-center justify-center pt-0 pb-1",
              variant === "bathtub" ? "px-3" : "px-2",
              variant === "chart" ? "overflow-hidden" : "overflow-visible",
              RECAP_VISUAL_HEIGHT,
            ),
      )}
    >
      <div
        className={cn(
          "flex min-h-0 items-center justify-center",
          enlarged
            ? recapExpandedInnerClass(variant)
            : cn(
                variant === "onion" &&
                  "aspect-square h-full max-h-full w-auto max-w-full",
                variant === "chart" && "h-full w-full min-w-0",
                variant === "bathtub" && "h-full w-full min-w-0",
              ),
        )}
      >
        {children}
      </div>
    </div>
  );
}

function OnionRecapSnapshot({
  metrics,
  enlarged = false,
}: {
  metrics: NationStoryMetrics;
  enlarged?: boolean;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const [diameter, setDiameter] = useState(RECAP_ONION_DIAMETER);
  const glowInset = enlarged ? (isMobile ? 1.38 : 1.12) : ONION_GLOW_INSET;

  useEffect(() => {
    const slot = containerRef.current;
    if (!slot) return;

    const update = () => {
      const base = Math.min(slot.clientWidth, slot.clientHeight);
      if (base > 0) setDiameter(base / glowInset);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(slot);
    return () => observer.disconnect();
  }, [glowInset]);

  const { layers, total } = useMemo(() => {
    const territorial = metrics.territorialLatestMton;
    const production = metrics.productionLatestMton;
    const consumption = metrics.consumptionLatestMton;
    const biogenic = metrics.biogenicLatestMton;

    const steps = [
      {
        key: "step1",
        color: NATION_STORY_COLORS.territorial,
        total: territorial,
      },
      {
        key: "step2",
        color: NATION_STORY_COLORS.production,
        total: production,
      },
      {
        key: "step3",
        color: NATION_STORY_COLORS.consumption,
        total: production + consumption,
      },
      {
        key: "step4",
        color: NATION_STORY_COLORS.eCommerce,
        total: production + consumption + E_COMMERCE_MTON,
      },
      {
        key: "step5",
        color: NATION_STORY_COLORS.biogenic,
        total: production + consumption + E_COMMERCE_MTON + biogenic,
      },
    ];

    const maxTotal = steps[steps.length - 1].total;
    const diameterFor = (value: number) =>
      Math.sqrt(value / maxTotal) * diameter;

    const minRingGrowth = (10 / RECAP_ONION_DIAMETER) * diameter;
    const layerDiameters = new Map<string, number>();
    let previous = 0;
    for (const step of steps) {
      const diameter = Math.max(
        diameterFor(step.total),
        previous + minRingGrowth,
      );
      layerDiameters.set(step.key, diameter);
      previous = diameter;
    }

    return {
      total: steps[steps.length - 1].total,
      layers: steps
        .slice()
        .sort((a, b) => b.total - a.total)
        .map((step) => ({
          key: step.key,
          color: step.color,
          diameter: layerDiameters.get(step.key) ?? 0,
        })),
    };
  }, [metrics, diameter]);

  const innerDiameter =
    layers.find((layer) => layer.key === "step1")?.diameter ?? diameter * 0.54;
  const textScale = enlarged ? 0.34 : 0.4;
  const statFontRem = (innerDiameter * textScale) / 16;
  const statFontSize = enlarged
    ? Math.min(3, Math.max(1.5, statFontRem))
    : Math.min(1.5, Math.max(1.05, statFontRem));

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-visible"
    >
      <div
        className="relative shrink-0"
        style={{ width: diameter, height: diameter }}
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-1/2 rounded-full blur-2xl"
          style={{
            width: diameter * 1.25,
            height: diameter * 1.25,
            transform: "translate(-50%, -50%)",
            backgroundColor: NATION_STORY_COLORS.biogenic,
            opacity: 0.14,
          }}
        />
        {layers.map((layer) => (
          <div
            key={layer.key}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: layer.diameter,
              height: layer.diameter,
              transform: "translate(-50%, -50%)",
              backgroundColor: layer.color,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-medium tabular-nums leading-none text-center text-black select-none"
            style={{ fontSize: `${statFontSize}rem` }}
          >
            {formatMton(total, currentLanguage, 0)}
            <span
              className="block mt-0.5 font-medium"
              style={{ fontSize: `${statFontSize * 0.46}rem` }}
            >
              {t("nation.story.unit.mton")}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ChartRecapSnapshot({
  metrics,
  compact = false,
  fitDialog = false,
}: {
  metrics: NationStoryMetrics;
  compact?: boolean;
  fitDialog?: boolean;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const useMirroredAxis = isMobile || compact || fitDialog;
  const latestYear =
    metrics.stackData[metrics.stackData.length - 1]?.year ??
    NATION_BASELINE_YEAR;
  const unitLabel = t("nation.story.unit.mtonCo2e");
  const mirroredYAxisTick = useMemo(
    () => createMirroredYAxisTick(currentLanguage),
    [currentLanguage],
  );
  const xAxisTicks = useMemo(() => {
    if (compact && !fitDialog) {
      return [NATION_BASELINE_YEAR, latestYear];
    }
    const ticks = isMobile
      ? [NATION_BASELINE_YEAR, 2000, 2010]
      : [NATION_BASELINE_YEAR, 2000, 2010];
    if (latestYear > 2020) {
      ticks.push(latestYear);
    } else {
      ticks.push(2020);
    }
    return ticks;
  }, [compact, fitDialog, isMobile, latestYear]);

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
        y={y + (isMobile ? 10 : 8)}
        textAnchor={anchor}
        fontSize={isMobile ? 10 : 10}
        fill="var(--grey)"
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div className="relative h-full w-full min-h-0 pointer-events-none select-none">
      {(compact || fitDialog) && <StoryChartYAxisUnit unit={unitLabel} />}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={metrics.stackData}
          margin={
            fitDialog
              ? RECAP_DIALOG_CHART_MARGIN
              : compact
                ? RECAP_CHART_MARGIN
                : getStoryChartMargin(isMobile)
          }
        >
          <XAxis
            dataKey="year"
            type="number"
            domain={[NATION_BASELINE_YEAR, latestYear]}
            ticks={xAxisTicks}
            tick={edgeAwareTick}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          {CHART_LAYERS.map((layer, index) => (
            <Area
              key={layer.dataKey}
              type="monotone"
              dataKey={layer.dataKey}
              stackId="emissions"
              stroke={layer.color}
              strokeWidth={NATION_STORY_CHART.strokeWidth}
              fill={layer.color}
              fillOpacity={
                index === CHART_LAYERS.length - 1
                  ? NATION_STORY_CHART.fillOpacity
                  : NATION_STORY_CHART.fillOpacity * 0.8
              }
              connectNulls={false}
              isAnimationActive={false}
              activeDot={false}
            />
          ))}
          <YAxis
            stroke="var(--grey)"
            tickLine={false}
            axisLine={false}
            mirror={useMirroredAxis}
            width={useMirroredAxis ? 36 : STORY_Y_AXIS_WIDTH}
            tickMargin={useMirroredAxis ? undefined : 4}
            tick={
              useMirroredAxis
                ? mirroredYAxisTick
                : { fill: "var(--grey)", fontSize: 10 }
            }
            tickFormatter={(value: number) =>
              formatMton(value, currentLanguage, 0)
            }
            domain={[0, "auto"]}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function BathtubRecapSnapshot({
  cumulativeMton,
  enlarged = false,
}: {
  cumulativeMton: number;
  enlarged?: boolean;
}) {
  return (
    <BathtubRecapGraphic
      cumulativeMton={cumulativeMton}
      className={cn(
        "mx-auto h-auto w-full",
        enlarged
          ? "max-h-full max-w-full sm:max-h-full sm:max-w-full"
          : "max-h-[86%] max-w-[88%]",
      )}
    />
  );
}

function RecapPanel({
  item,
  layout,
  onExpand,
}: {
  item: RecapItem;
  layout: "mobile" | "desktop";
  onExpand: () => void;
}) {
  const { t } = useTranslation();
  const showMobileLegend =
    layout === "mobile" && (item.key === "onion" || item.key === "chart");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.45, delay: item.delay }}
      className={cn(
        layout === "mobile" && "min-w-0",
        layout === "desktop" && "min-w-0 h-full",
      )}
    >
      <button
        type="button"
        onClick={onExpand}
        aria-label={t("nation.story.conclusion.recap.expandLabel", {
          headline: item.headline,
        })}
        className={RECAP_CARD_CLASS}
      >
        <div
          className={
            layout === "mobile"
              ? RECAP_HEADLINE_ROW_MOBILE
              : RECAP_HEADLINE_ROW_DESKTOP
          }
        >
          <p className={RECAP_HEADLINE_CLASS}>{item.headline}</p>
        </div>
        <RecapVisualFrame variant={item.variant} enlarged={false}>
          {item.renderVisual(false)}
        </RecapVisualFrame>
        {showMobileLegend && item.key === "onion" && (
          <OnionRecapLegend compact />
        )}
        {showMobileLegend && item.key === "chart" && (
          <ChartRecapLegend compact />
        )}
      </button>
    </motion.div>
  );
}

type ConclusionStoryRecapProps = {
  metrics: NationStoryMetrics;
};

/** Recap row: final-state onion, chart and bathtub — column on mobile, aligned grid on md+. */
export function ConclusionStoryRecap({ metrics }: ConclusionStoryRecapProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const cumulativeMton =
    metrics.bathtubData[metrics.bathtubData.length - 1]?.cumulativeMton ?? 0;

  const items: RecapItem[] = [
    {
      key: "onion",
      variant: "onion",
      headline: t("nation.story.conclusion.recap.onionHeadline", {
        year: metrics.latestYear,
      }),
      delay: 0.1,
      renderVisual: (enlarged) => (
        <OnionRecapSnapshot metrics={metrics} enlarged={enlarged} />
      ),
    },
    {
      key: "chart",
      variant: "chart",
      headline: t("nation.story.conclusion.recap.chartHeadline"),
      delay: 0.18,
      renderVisual: (enlarged) => (
        <ChartRecapSnapshot metrics={metrics} compact fitDialog={enlarged} />
      ),
    },
    {
      key: "bathtub",
      variant: "bathtub",
      headline: t("nation.story.conclusion.recap.bathtubHeadline"),
      delay: 0.26,
      renderVisual: (enlarged) => (
        <BathtubRecapSnapshot
          cumulativeMton={cumulativeMton}
          enlarged={enlarged}
        />
      ),
    },
  ];

  const expandedItem = items.find((item) => item.key === expandedKey) ?? null;
  const expandedFitsDialog =
    expandedItem?.variant === "onion" ||
    expandedItem?.variant === "chart" ||
    expandedItem?.variant === "bathtub";
  const isDialogOpen = expandedItem !== null;

  return (
    <>
      <p
        className={cn(
          `mb-4 story-short:mb-3 md:mb-5 text-center ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`,
          isDialogOpen && "opacity-60 transition-opacity duration-200",
        )}
      >
        {t(
          isMobile
            ? "nation.story.conclusion.recap.expandHintTap"
            : "nation.story.conclusion.recap.expandHintClick",
        )}
      </p>

      <div
        className={cn(
          "flex flex-col gap-5 story-short:gap-4 md:hidden w-full max-w-7xl mx-auto px-2 transition-opacity duration-200",
          isDialogOpen && "pointer-events-none opacity-55",
        )}
      >
        {items.map((item) => (
          <RecapPanel
            key={item.key}
            item={item}
            layout="mobile"
            onExpand={() => setExpandedKey(item.key)}
          />
        ))}
      </div>

      <div
        className={cn(
          "hidden md:grid md:grid-cols-3 md:items-start md:gap-x-6 lg:gap-x-10 w-full max-w-7xl mx-auto px-4 transition-opacity duration-200",
          isDialogOpen && "pointer-events-none opacity-55",
        )}
      >
        {items.map((item) => (
          <RecapPanel
            key={item.key}
            item={item}
            layout="desktop"
            onExpand={() => setExpandedKey(item.key)}
          />
        ))}
      </div>

      <Dialog
        open={expandedItem !== null}
        onOpenChange={(open) => {
          if (!open) setExpandedKey(null);
        }}
      >
        <DialogContent
          overlayClassName="z-[80] bg-black/50 backdrop-blur-sm"
          className={cn(
            "z-[80] max-w-[min(100vw-1.5rem,32rem)] border-white/15 bg-black p-4 text-white shadow-2xl sm:max-w-md sm:gap-3 sm:p-5 md:max-w-lg [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:opacity-100",
            expandedFitsDialog &&
              "!flex max-h-[min(90svh,calc(100dvh-1.5rem))] flex-col overflow-hidden",
            !expandedFitsDialog && "gap-3",
          )}
          aria-describedby={undefined}
        >
          {expandedItem ? (
            <>
              <DialogTitle
                className={`${NATION_STORY_TYPE.emphasis} shrink-0 text-center text-white leading-snug`}
              >
                {expandedItem.headline}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t("nation.story.conclusion.recap.expandLabel", {
                  headline: expandedItem.headline,
                })}
              </DialogDescription>
              <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
                <RecapVisualFrame
                  variant={expandedItem.variant}
                  enlarged
                  fitDialog
                >
                  {expandedItem.renderVisual(true)}
                </RecapVisualFrame>
                {expandedItem.key === "onion" && <OnionRecapLegend compact />}
                {expandedItem.key === "chart" && <ChartRecapLegend compact />}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

import { FC, useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  formatMton,
  NATION_BASELINE_YEAR,
  type NationStackDataPoint,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  ChartFooter,
  ChartTooltip,
  EnhancedLegend,
  getXAxisProps,
  type LegendItem,
} from "@/components/charts";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { cn } from "@/lib/utils";
import {
  NATION_STORY_CHART,
  NATION_STORY_COLORS,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";

/** Story chart needs room for Y ticks; shared chart margins are negative and clip them. */
function getStoryChartMargin(isMobile: boolean) {
  return {
    top: 8,
    right: isMobile ? 4 : 12,
    left: isMobile ? 4 : 20,
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
  const xAxisTicks = useMemo(() => {
    const ticks = [1990, 2000, 2010, 2020];
    if (latestYear > 2020) ticks.push(latestYear);
    return ticks;
  }, [latestYear]);

  // Scroll-driven: each step reveals one more area layer.
  const { ref, step, sectionVh, stageStyle } = usePinnedSteps(LAYERS.length);
  const visibleLayers = step + 1;

  const visibleLegendItems: LegendItem[] = useMemo(
    () =>
      LAYERS.slice(0, visibleLayers).map((layer) => ({
        name: t(layer.translationKey),
        color: layer.color,
        isClickable: false,
        isHidden: false,
        isDashed: false,
      })),
    [t, visibleLayers],
  );

  const chartHeight = isMobile ? 180 : 320;

  return (
    <section
      ref={ref}
      data-story-section
      data-story-step={step}
      data-story-steps={LAYERS.length}
      data-story-step-vh={90}
      className="relative"
      style={{ height: `${sectionVh}vh` }}
    >
      <div
        className="h-[100svh] flex items-center px-4 md:px-8 py-3 md:py-0"
        style={stageStyle}
      >
        <div className="w-full max-w-4xl mx-auto">
          <SectionWithHelp
            helpItems={[]}
            className={cn(
              className,
              "pb-1 md:pb-3 [&>div]:pb-1 [&>div]:mb-0 md:[&>div]:mb-2",
            )}
          >
            <h2
              className={`${NATION_STORY_TYPE.title} text-white mb-2 md:mb-4`}
            >
              {t("nation.story.stacked.title")}
            </h2>

            {/* Caption explaining the layer currently being drawn */}
            <div className="min-h-[2rem] md:min-h-[2.5rem] mb-1 md:mb-2">
              <motion.p
                key={visibleLayers}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex items-center gap-2 md:gap-3 ${NATION_STORY_TYPE.emphasis} text-white`}
              >
                <span
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full shrink-0"
                  style={{ backgroundColor: LAYERS[visibleLayers - 1].color }}
                />
                {t(LAYERS[visibleLayers - 1].captionKey)}
              </motion.p>
            </div>

            <div style={{ width: "100%", height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={getStoryChartMargin(isMobile)}>
                  <XAxis
                    {...getXAxisProps(
                      "year",
                      [NATION_BASELINE_YEAR, latestYear],
                      xAxisTicks,
                    )}
                  />
                  <YAxis
                    stroke="var(--grey)"
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 36 : 56}
                    tick={{ fill: "var(--grey)", fontSize: isMobile ? 10 : 12 }}
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
                  <Tooltip
                    content={
                      <ChartTooltip
                        unit={t("nation.story.unit.mton")}
                        customFormatter={(value) =>
                          formatMton(value, currentLanguage, 1)
                        }
                      />
                    }
                    wrapperStyle={{ outline: "none", zIndex: 60 }}
                  />
                  {LAYERS.slice(0, visibleLayers).map((layer) => (
                    <Area
                      key={layer.dataKey}
                      type="monotone"
                      dataKey={layer.dataKey}
                      stackId="emissions"
                      stroke={layer.color}
                      strokeWidth={NATION_STORY_CHART.strokeWidth}
                      fill={layer.color}
                      fillOpacity={NATION_STORY_CHART.fillOpacity}
                      name={t(layer.translationKey)}
                      connectNulls={false}
                      isAnimationActive
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <ChartFooter className="mt-1 mb-0 space-y-2">
              <EnhancedLegend
                items={visibleLegendItems}
                className="gap-1.5 md:gap-3 [&_span]:text-sm md:[&_span]:text-base"
              />
            </ChartFooter>
          </SectionWithHelp>
        </div>
      </div>
    </section>
  );
};

import { FC, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  formatMton,
  type NationStackDataPoint,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  ChartFooter,
  ChartTooltip,
  ChartYearControls,
  EnhancedLegend,
  getCurrentYearReferenceLineProps,
  getResponsiveChartMargin,
  getXAxisProps,
  getYAxisProps,
  type LegendItem,
} from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { cn } from "@/lib/utils";
import {
  NATION_STORY_CHART,
  NATION_STORY_COLORS,
} from "@/components/nation/story/nationStoryColors";
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";

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
    translationKey: "nation.story.graph.productionBased",
    captionKey: "nation.story.stacked.layerCaption2",
  },
  {
    dataKey: "biogenic" as const,
    color: NATION_STORY_COLORS.biogenic,
    translationKey: "nation.story.graph.biogenic",
    captionKey: "nation.story.stacked.layerCaption3",
  },
  {
    dataKey: "consumptionAbroad" as const,
    color: NATION_STORY_COLORS.consumption,
    translationKey: "nation.story.graph.consumptionAbroad",
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
  const currentYear = new Date().getFullYear();
  const [chartEndYear, setChartEndYear] = useState(currentYear);

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

  const filteredData = useMemo(
    () => data.filter((d) => d.year <= chartEndYear),
    [data, chartEndYear],
  );

  const chartHeight = isMobile ? 240 : 320;

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
        <div className="w-full max-w-4xl mx-auto">
          <SectionWithHelp
            helpItems={[]}
            className={cn(
              className,
              "pb-2 md:pb-3 [&>div]:pb-2 [&>div]:mb-0 md:[&>div]:mb-2",
            )}
          >
            <CardHeader
              title={t("nation.story.stacked.title")}
              description={t("nation.story.stacked.description")}
              className="[&>div]:mb-4 [&>div]:@lg:mb-6 [&_[class*='text-grey']]:text-white/85 [&_[class*='text-grey']]:text-base md:[&_[class*='text-grey']]:text-lg"
            />

            {/* Caption explaining the layer currently being drawn */}
            <div className="min-h-[2.5rem] mb-2">
              <motion.p
                key={visibleLayers}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex items-center gap-3 text-base md:text-lg text-white font-medium`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: LAYERS[visibleLayers - 1].color }}
                />
                {t(LAYERS[visibleLayers - 1].captionKey)}
              </motion.p>
            </div>

            <div style={{ width: "100%", height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData}
                  margin={getResponsiveChartMargin(isMobile)}
                >
                  <XAxis
                    {...getXAxisProps(
                      "year",
                      [1990, currentYear],
                      [1990, 2000, 2010, 2020, currentYear],
                    )}
                  />
                  <YAxis {...getYAxisProps(currentLanguage)} />
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
                  <ReferenceLine
                    {...getCurrentYearReferenceLineProps(currentYear)}
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
                className="gap-2 md:gap-3 [&_span]:text-base md:[&_span]:text-lg"
              />
              <ChartYearControls
                chartEndYear={chartEndYear}
                setChartEndYear={setChartEndYear}
                className="!mt-0 !px-0"
              />
            </ChartFooter>
          </SectionWithHelp>
        </div>
      </div>
    </section>
  );
};

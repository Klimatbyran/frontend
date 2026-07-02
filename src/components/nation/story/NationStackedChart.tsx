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
import type { NationStackDataPoint } from "@/utils/data/nationStoryMetrics";
import { formatMton } from "@/utils/data/nationStoryMetrics";
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
import { usePinnedSteps } from "@/components/nation/story/usePinnedSteps";

const LAYERS = [
  {
    dataKey: "territorialFossil" as const,
    color: "var(--orange-2)",
    translationKey: "nation.story.graph.territorialFossil",
    captionKey: "nation.story.stacked.layerCaption1",
  },
  {
    dataKey: "biogenic" as const,
    color: "var(--green-3)",
    translationKey: "nation.story.graph.biogenic",
    captionKey: "nation.story.stacked.layerCaption2",
  },
  {
    dataKey: "consumptionAbroad" as const,
    color: "var(--pink-3)",
    translationKey: "nation.story.graph.consumptionAbroad",
    captionKey: "nation.story.stacked.layerCaption3",
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
          <SectionWithHelp helpItems={[]} className={className}>
            <CardHeader
              title={t("nation.story.stacked.title")}
              description={t("nation.story.stacked.description")}
              className="[&>div]:mb-4 [&>div]:@lg:mb-6"
            />

            {/* Caption explaining the layer currently being drawn */}
            <div className="min-h-[2.5rem] mb-2">
              <motion.p
                key={visibleLayers}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 text-sm md:text-base text-white"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
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
                      strokeWidth={1.5}
                      fill={layer.color}
                      fillOpacity={0.6}
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

            <ChartFooter>
              <EnhancedLegend items={visibleLegendItems} />
              <ChartYearControls
                chartEndYear={chartEndYear}
                setChartEndYear={setChartEndYear}
              />
            </ChartFooter>
          </SectionWithHelp>
        </div>
      </div>
    </section>
  );
};

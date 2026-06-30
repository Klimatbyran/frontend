import { FC, useEffect, useMemo, useRef, useState } from "react";
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
import { motion, useInView } from "framer-motion";
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
import { formatPercentChange } from "@/utils/formatting/localization";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";

const LAYERS = [
  {
    dataKey: "territorialFossil" as const,
    color: "var(--orange-2)",
    translationKey: "nation.story.graph.territorialFossil",
  },
  {
    dataKey: "biogenic" as const,
    color: "var(--green-3)",
    translationKey: "nation.story.graph.biogenic",
  },
  {
    dataKey: "consumptionAbroad" as const,
    color: "var(--pink-3)",
    translationKey: "nation.story.graph.consumptionAbroad",
  },
];

const LAYER_STAGGER_MS = 2000;
const LAYER_CAPTION_KEYS = [
  "nation.story.stacked.layerCaption1",
  "nation.story.stacked.layerCaption2",
  "nation.story.stacked.layerCaption3",
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
  const [visibleLayers, setVisibleLayers] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: false, amount: 0.4 });

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (inView) {
      setVisibleLayers(1);
      LAYERS.slice(1).forEach((_, i) => {
        const timer = setTimeout(
          () => setVisibleLayers(i + 2),
          (i + 1) * LAYER_STAGGER_MS,
        );
        timersRef.current.push(timer);
      });
    } else {
      setVisibleLayers(0);
    }

    return () => timersRef.current.forEach(clearTimeout);
  }, [inView]);

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

  const point1990 = useMemo(() => data.find((d) => d.year === 1990), [data]);
  const pointLatest = useMemo(
    () => [...data].sort((a, b) => b.year - a.year)[0],
    [data],
  );

  const territorialChangePct = useMemo(() => {
    if (!point1990 || !pointLatest || point1990.territorialFossil === 0)
      return null;
    return (
      ((pointLatest.territorialFossil - point1990.territorialFossil) /
        point1990.territorialFossil) *
      100
    );
  }, [point1990, pointLatest]);

  const combinedChangePct = useMemo(() => {
    if (!point1990 || !pointLatest || point1990.combined === 0) return null;
    return (
      ((pointLatest.combined - point1990.combined) / point1990.combined) * 100
    );
  }, [point1990, pointLatest]);

  const chartHeight = isMobile ? 240 : 320;

  return (
    <SectionWithHelp helpItems={[]} className={className}>
      <CardHeader
        title={t("nation.story.stacked.title")}
        description={t("nation.story.stacked.description")}
        className="[&>div]:mb-4 [&>div]:@lg:mb-6"
      />

      {/* Caption explaining the layer currently being drawn */}
      <div className="min-h-[2.5rem] mb-2">
        {visibleLayers > 0 && (
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
            {t(LAYER_CAPTION_KEYS[visibleLayers - 1])}
          </motion.p>
        )}
      </div>

      <div ref={containerRef} style={{ width: "100%", height: chartHeight }}>
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
            <ReferenceLine {...getCurrentYearReferenceLineProps(currentYear)} />
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
                animationDuration={1400}
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

      {/* Big-number totals */}
      {point1990 && pointLatest && (
        <div className="mt-8 border-t border-white/10 pt-8">
          <p className="text-sm text-grey mb-6">
            {t("nation.story.stacked.totalsDescription")}
          </p>
          <div className="grid grid-cols-2 gap-8 md:gap-12">
            <div>
              <p className="text-sm text-grey mb-3">{1990}</p>
              <p className="text-4xl md:text-6xl font-light text-orange-2 tabular-nums leading-none">
                {formatMton(point1990.combined, currentLanguage, 0)}
              </p>
              <p className="text-sm text-grey mt-3">
                {t("nation.story.unit.millionTco2e")}
              </p>
            </div>
            <div>
              <p className="text-sm text-grey mb-3">{pointLatest.year}</p>
              <p className="text-4xl md:text-6xl font-light text-orange-2 tabular-nums leading-none">
                {formatMton(pointLatest.combined, currentLanguage, 0)}
              </p>
              <p className="text-sm text-grey mt-3">
                {t("nation.story.unit.millionTco2e")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change comparison */}
      {territorialChangePct !== null && combinedChangePct !== null && (
        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="text-sm text-grey mb-6">
            {t("nation.story.stacked.changeContext")}
          </p>
          <div className="grid grid-cols-2 gap-8 md:gap-12">
            <div>
              <p className="text-sm text-grey mb-3 leading-snug">
                {t("nation.story.stacked.changeTerritorialLabel")}
              </p>
              <p className="text-4xl md:text-6xl font-light text-blue-3 tabular-nums leading-none">
                {formatPercentChange(territorialChangePct, currentLanguage)}
              </p>
            </div>
            <div>
              <p className="text-sm text-grey mb-3 leading-snug">
                {t("nation.story.stacked.changeCombinedLabel")}
              </p>
              <p className="text-4xl md:text-6xl font-light text-pink-3 tabular-nums leading-none">
                {formatPercentChange(combinedChangePct, currentLanguage)}
              </p>
            </div>
          </div>
          <div className="text-base md:text-lg text-white mt-8 -mb-4 md:-mb-8 space-y-2 leading-relaxed">
            <p>{t("nation.story.stacked.changeFooterLine1")}</p>
            <p>{t("nation.story.stacked.changeFooterLine2")}</p>
          </div>
        </div>
      )}
    </SectionWithHelp>
  );
};

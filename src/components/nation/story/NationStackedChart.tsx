import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useInView } from "framer-motion";
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

const LAYERS = [
  {
    dataKey: "territorialFossil" as const,
    color: "var(--orange-2)",
    translationKey: "nation.story.graph.territorialFossil",
  },
  {
    dataKey: "biogenic" as const,
    color: "var(--green-2)",
    translationKey: "nation.story.graph.biogenic",
  },
  {
    dataKey: "consumptionAbroad" as const,
    color: "var(--blue-2)",
    translationKey: "nation.story.graph.consumptionAbroad",
  },
];

const LAYER_STAGGER_MS = 900;
type StackedView = "usual" | "total";

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
  const [stackedView, setStackedView] = useState<StackedView>("usual");

  // How many layers to show: 1 for "usual", up to 3 for "total"
  const [visibleLayers, setVisibleLayers] = useState(1);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: false, amount: 0.4 });

  const revealAllLayers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setVisibleLayers(1);
    LAYERS.slice(1).forEach((_, i) => {
      const timer = setTimeout(
        () => setVisibleLayers(i + 2),
        (i + 1) * LAYER_STAGGER_MS,
      );
      timersRef.current.push(timer);
    });
  }, []);

  // When toggling to "total", run the stagger animation
  const handleViewChange = useCallback(
    (view: StackedView) => {
      setStackedView(view);
      if (view === "usual") {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setVisibleLayers(1);
      } else {
        revealAllLayers();
      }
    },
    [revealAllLayers],
  );

  // On initial viewport entry, auto-reveal all layers
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (inView && stackedView === "total") {
      revealAllLayers();
    } else if (!inView) {
      if (stackedView === "total") setVisibleLayers(0);
    }

    return () => timersRef.current.forEach(clearTimeout);
  }, [inView, stackedView, revealAllLayers]);

  const layerCount = stackedView === "usual" ? 1 : visibleLayers;

  const visibleLegendItems: LegendItem[] = useMemo(
    () =>
      LAYERS.slice(0, layerCount).map((layer) => ({
        name: t(layer.translationKey),
        color: layer.color,
        isClickable: false,
        isHidden: false,
        isDashed: false,
      })),
    [t, layerCount],
  );

  const viewOptions = useMemo(
    () => [
      { value: "usual" as StackedView, label: t("nation.story.stacked.viewUsual") },
      { value: "total" as StackedView, label: t("nation.story.stacked.viewTotal") },
    ],
    [t],
  );

  const filteredData = useMemo(
    () => data.filter((d) => d.year <= chartEndYear),
    [data, chartEndYear],
  );

  const chartHeight = isMobile ? 240 : 320;

  return (
    <SectionWithHelp helpItems={[]} className={className}>
      <CardHeader
        title={t("nation.story.stacked.title")}
        description={t("nation.story.stacked.description")}
        dataView={stackedView}
        setDataView={handleViewChange}
        dataViewOptions={viewOptions}
        className="[&>div]:mb-4 [&>div]:@lg:mb-6"
      />

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

            {LAYERS.slice(0, layerCount).map((layer) => (
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
                animationDuration={700}
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
  );
};

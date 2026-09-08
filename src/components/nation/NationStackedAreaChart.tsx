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
import type { TooltipProps } from "recharts";
import { ChartTooltip } from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  NATION_STORY_CHART,
  NATION_STORY_COLORS,
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import {
  createMirroredYAxisTick,
  getStoryChartMargin,
  STORY_Y_AXIS_WIDTH,
  StoryChartYAxisUnit,
} from "@/components/nation/story/storyChartAxis";
import {
  formatMton,
  NATION_BASELINE_YEAR,
  type NationStackDataPoint,
} from "@/utils/data/nationStoryMetrics";
import { cn } from "@/lib/utils";

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

function NationStackedChartTooltip({
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

interface NationStackedAreaChartProps {
  data: NationStackDataPoint[];
  className?: string;
}

export const NationStackedAreaChart: FC<NationStackedAreaChartProps> = ({
  data,
  className,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const latestYear = data.at(-1)?.year ?? NATION_BASELINE_YEAR;
  const unitLabel = t("nation.story.unit.mtonCo2e");

  const mirroredYAxisTick = useMemo(
    () => createMirroredYAxisTick(currentLanguage),
    [currentLanguage],
  );

  const xAxisTicks = useMemo(() => {
    const ticks = isMobile
      ? [NATION_BASELINE_YEAR, 2000, 2010]
      : [NATION_BASELINE_YEAR, 2000, 2010, 2020];
    if (latestYear > 2020) ticks.push(latestYear);
    return ticks;
  }, [isMobile, latestYear]);

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

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <div className="relative min-h-0 flex-1">
        <StoryChartYAxisUnit unit={unitLabel} />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={getStoryChartMargin(isMobile)}>
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
            <Tooltip
              content={
                <NationStackedChartTooltip
                  unit={t("nation.story.unit.mton")}
                  customFormatter={(value) =>
                    formatMton(value, currentLanguage, 1)
                  }
                />
              }
              cursor={{ stroke: "var(--grey)", strokeDasharray: "4 4" }}
              wrapperStyle={{ outline: "none", zIndex: 60 }}
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
                name={t(layer.translationKey)}
                connectNulls={false}
                isAnimationActive={false}
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

      <div
        className={`mt-3 shrink-0 border-t border-white/10 pt-3 ${NATION_STORY_TYPE.meta}`}
      >
        <div className="flex flex-col gap-y-1.5 md:flex-row md:flex-wrap md:items-center md:gap-x-8">
          {[...CHART_LAYERS].reverse().map((layer) => (
            <span
              key={layer.dataKey}
              className={`flex items-center gap-2 md:gap-2.5 ${NATION_STORY_TYPE.meta}`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full md:h-3.5 md:w-3.5"
                style={{ backgroundColor: layer.color }}
              />
              <span className={NATION_STORY_TEXT.secondary}>
                {t(layer.translationKey)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

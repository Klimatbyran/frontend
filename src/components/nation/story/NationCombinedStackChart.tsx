import { FC, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import type { NationStackDataPoint } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  ChartArea,
  ChartFooter,
  ChartWrapper,
  ChartYearControls,
  EnhancedLegend,
  filterDataByYearRange,
  getChartContainerProps,
  getResponsiveChartMargin,
  getXAxisProps,
  type LegendItem,
} from "@/components/charts";
import { formatMton } from "@/utils/data/nationStoryMetrics";

const STACK_LAYERS = [
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

interface NationCombinedStackChartProps {
  data: NationStackDataPoint[];
}

export const NationCombinedStackChart: FC<NationCombinedStackChartProps> = ({
  data,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const currentYear = new Date().getFullYear();
  const [chartEndYear, setChartEndYear] = useState(currentYear);

  const legendItems: LegendItem[] = useMemo(
    () =>
      STACK_LAYERS.map((layer) => ({
        name: t(layer.translationKey),
        color: layer.color,
        isClickable: false,
        isHidden: false,
        isDashed: false,
      })),
    [t],
  );

  const filteredData = useMemo(
    () => filterDataByYearRange(data, chartEndYear),
    [data, chartEndYear],
  );

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
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
            <YAxis
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) =>
                formatMton(value, currentLanguage, 0)
              }
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${formatMton(value, currentLanguage, 1)} ${t("nation.story.unit.mton")}`,
                name,
              ]}
              labelFormatter={(year) => `${year}`}
              contentStyle={{
                backgroundColor: "var(--black-2)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            />
            {STACK_LAYERS.map((layer) => (
              <Area
                key={layer.dataKey}
                type="monotone"
                dataKey={layer.dataKey}
                stackId="nation"
                stroke={layer.color}
                fill={layer.color}
                fillOpacity={0.65}
                name={t(layer.translationKey)}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartArea>
      <ChartFooter>
        <EnhancedLegend items={legendItems} />
        <ChartYearControls
          chartEndYear={chartEndYear}
          setChartEndYear={setChartEndYear}
        />
      </ChartFooter>
    </ChartWrapper>
  );
};

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
import type { NationStackDataPoint } from "@/utils/data/nationStoryMetrics";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  ChartArea,
  ChartFooter,
  ChartWrapper,
  ChartYearControls,
  EnhancedLegend,
  getChartContainerProps,
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

  const legendItems: LegendItem[] = useMemo(
    () =>
      LAYERS.map((layer) => ({
        name: t(layer.translationKey),
        color: layer.color,
        isClickable: false,
        isHidden: false,
        isDashed: false,
      })),
    [t],
  );

  const filteredData = useMemo(
    () => data.filter((d) => d.year <= chartEndYear),
    [data, chartEndYear],
  );

  return (
    <SectionWithHelp helpItems={[]} className={className}>
      <CardHeader
        title={t("nation.story.stacked.title")}
        description={t("nation.story.stacked.description")}
        className="[&>div]:mb-4 [&>div]:@lg:mb-6"
      />

      <div style={{ height: isMobile ? "260px" : "340px" }}>
        <ChartWrapper>
          <ChartArea className="min-h-0 h-full">
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
                <YAxis {...getYAxisProps(currentLanguage)} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${formatMton(value, currentLanguage, 1)} ${t("nation.story.unit.mton")}`,
                    name,
                  ]}
                  labelFormatter={(year) => String(year)}
                  contentStyle={{
                    backgroundColor: "var(--black-1)",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  wrapperStyle={{ outline: "none", zIndex: 60 }}
                />
                <ReferenceLine
                  {...getCurrentYearReferenceLineProps(currentYear)}
                />
                {LAYERS.map((layer) => (
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
      </div>
    </SectionWithHelp>
  );
};

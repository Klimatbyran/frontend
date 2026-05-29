import { FC, useState, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { NationDataPoint } from "@/types/emissions";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  EnhancedLegend,
  ChartYearControls,
  LegendItem,
  getLinePropsWithHover,
  getXAxisProps,
  getYAxisProps,
  getCurrentYearReferenceLineProps,
  getChartContainerProps,
  getComposedChartProps,
  getResponsiveChartMargin,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  filterDataByYearRange,
  ChartTooltip,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";

const NATION_STACK_CONFIG = [
  {
    dataKey: "territorialFossil" as const,
    historicalTopDataKey: "territorialFossilHistoricalTop" as const,
    trendTopDataKey: "territorialFossilTrendTop" as const,
    carbonLawTopDataKey: "territorialFossilCarbonLawTop" as const,
    color: "var(--orange-2)",
    translationKey: "nation.detailPage.graph.territorialFossil",
    parisTranslationKey: "nation.detailPage.graph.territorialFossilParis",
  },
  {
    dataKey: "biogenic" as const,
    historicalTopDataKey: "biogenicHistoricalTop" as const,
    trendTopDataKey: "biogenicTrendTop" as const,
    carbonLawTopDataKey: "biogenicCarbonLawTop" as const,
    color: "var(--green-2)",
    translationKey: "nation.detailPage.graph.biogenic",
    parisTranslationKey: "nation.detailPage.graph.biogenicParis",
  },
  {
    dataKey: "consumptionAbroad" as const,
    historicalTopDataKey: "consumptionAbroadHistoricalTop" as const,
    trendTopDataKey: "consumptionAbroadTrendTop" as const,
    carbonLawTopDataKey: "consumptionAbroadCarbonLawTop" as const,
    color: "var(--blue-2)",
    translationKey: "nation.detailPage.graph.consumptionAbroad",
    parisTranslationKey: "nation.detailPage.graph.consumptionAbroadParis",
  },
] as const;

interface NationOverviewChartProps {
  projectedData: NationDataPoint[];
}

export const NationOverviewChart: FC<NationOverviewChartProps> = ({
  projectedData,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const currentYear = new Date().getFullYear();

  const [chartEndYear, setChartEndYear] = useState(
    new Date().getFullYear() + 5,
  );

  const legendItems: LegendItem[] = useMemo(() => {
    const layerItems: LegendItem[] = NATION_STACK_CONFIG.flatMap((layer) => [
      {
        name: t(layer.translationKey),
        color: layer.color,
        isClickable: false,
        isHidden: false,
        isDashed: false,
      },
      {
        name: t(layer.parisTranslationKey),
        color: layer.color,
        isClickable: false,
        isHidden: false,
        isDashed: true,
      },
    ]);

    return [
      ...layerItems,
      {
        name: t("detailPage.graph.estimated"),
        color: "var(--grey)",
        isClickable: false,
        isHidden: false,
        isDashed: true,
      },
    ];
  }, [t]);

  const filteredData = useMemo(() => {
    return filterDataByYearRange(projectedData, chartEndYear);
  }, [projectedData, chartEndYear]);

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <ComposedChart
            {...getComposedChartProps(
              filteredData,
              undefined,
              getResponsiveChartMargin(isMobile),
            )}
          >
            <XAxis
              {...getXAxisProps(
                "year",
                [1990, 2050],
                [1990, 2015, 2020, currentYear, 2030, 2040, 2050],
              )}
              allowDuplicatedCategory
              tickFormatter={(year) => year}
            />
            <YAxis {...getYAxisProps(currentLanguage)} />

            <Tooltip
              content={
                <ChartTooltip
                  dataView="nation-overview"
                  unit={t("emissionsUnit")}
                />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <ReferenceLine {...getCurrentYearReferenceLineProps(currentYear)} />

            {NATION_STACK_CONFIG.map((layer) => (
              <Area
                key={layer.dataKey}
                type="monotone"
                dataKey={layer.dataKey}
                stackId="emissions"
                stroke="none"
                fill={layer.color}
                fillOpacity={0.6}
                name={t(layer.translationKey)}
                connectNulls
              />
            ))}

            {NATION_STACK_CONFIG.map((layer) => (
              <Line
                key={layer.historicalTopDataKey}
                type="monotone"
                dataKey={layer.historicalTopDataKey}
                stroke={layer.color}
                strokeWidth={2}
                fillOpacity={0}
                dot={false}
                name={t(layer.translationKey)}
                connectNulls={false}
              />
            ))}

            {NATION_STACK_CONFIG.map((layer) => (
              <Line
                key={layer.trendTopDataKey}
                type="monotone"
                dataKey={layer.trendTopDataKey}
                stroke={layer.color}
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={0}
                dot={false}
                name={t("detailPage.graph.estimated")}
                connectNulls={false}
              />
            ))}

            {NATION_STACK_CONFIG.map((layer) => (
              <Line
                key={layer.carbonLawTopDataKey}
                type="monotone"
                dataKey={layer.carbonLawTopDataKey}
                {...getLinePropsWithHover(
                  "secondary",
                  layer.color,
                  isMobile,
                  t(layer.parisTranslationKey),
                )}
                connectNulls
              />
            ))}
          </ComposedChart>
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

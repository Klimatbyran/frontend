import { FC, useState, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { DataPoint } from "@/types/emissions";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  EnhancedLegend,
  ChartYearControls,
  LegendItem,
  getConsistentLineProps,
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
import { LEGEND_CONFIGS } from "@/components/charts/historicEmissions/styles/legendStyles";
import { useLanguage } from "@/components/LanguageProvider";

interface StackedAreasProps {
  hasBiogenic: boolean;
  hasConsumption: boolean;
  hasOilExport: boolean;
  t: (key: string) => string;
}

function StackedAreas({
  hasBiogenic,
  hasConsumption,
  hasOilExport,
  t,
}: StackedAreasProps) {
  const areaProps = {
    type: "monotone" as const,
    stackId: "main",
    strokeWidth: 2,
    dot: false as const,
    activeDot: { r: 5 },
    connectNulls: false,
    fillOpacity: 0.1,
  };
  return (
    <>
      {hasOilExport && (
        <Area
          {...areaProps}
          dataKey="exportOfOilProductsEmissions"
          name={t("detailPage.graph.exportOfOilProductsEmissions")}
          stroke={LEGEND_CONFIGS.oilExport.color}
          fill={LEGEND_CONFIGS.oilExport.color}
        />
      )}
      {hasConsumption && (
        <Area
          {...areaProps}
          dataKey="consumptionAbroadEmissions"
          name={t("detailPage.graph.consumptionAbroadEmissions")}
          stroke={LEGEND_CONFIGS.consumption.color}
          fill={LEGEND_CONFIGS.consumption.color}
        />
      )}
      {hasBiogenic && (
        <Area
          {...areaProps}
          dataKey="biogenicEmissions"
          name={t("detailPage.graph.biogenicEmissions")}
          stroke={LEGEND_CONFIGS.biogenic.color}
          fill={LEGEND_CONFIGS.biogenic.color}
        />
      )}
      {/* Historical territorial emissions on top of the stack — from 1990 */}
      <Area
        {...areaProps}
        dataKey="total"
        name={t("detailPage.graph.historical")}
        stroke={LEGEND_CONFIGS.historical.color}
        fill={LEGEND_CONFIGS.historical.color}
      />
    </>
  );
}

function buildLegendItems(
  t: (key: string) => string,
  flags: {
    hasBiogenic: boolean;
    hasConsumption: boolean;
    hasOilExport: boolean;
  },
): LegendItem[] {
  const items: LegendItem[] = [
    {
      name: t("detailPage.graph.estimated"),
      color: LEGEND_CONFIGS.estimated.color,
      isClickable: false,
      isHidden: false,
      isDashed: true,
    },
    {
      name: t("detailPage.graph.trend"),
      color: LEGEND_CONFIGS.trend.color,
      isClickable: false,
      isHidden: false,
      isDashed: true,
    },
    {
      name: t("detailPage.graph.carbonLaw"),
      color: LEGEND_CONFIGS.paris.color,
      isClickable: false,
      isHidden: false,
      isDashed: true,
    },
  ];
  if (flags.hasOilExport) {
    items.push({
      name: t("detailPage.graph.exportOfOilProductsEmissions"),
      color: LEGEND_CONFIGS.oilExport.color,
      isClickable: false,
      isHidden: false,
      isDashed: false,
    });
  }
  if (flags.hasConsumption) {
    items.push({
      name: t("detailPage.graph.consumptionAbroadEmissions"),
      color: LEGEND_CONFIGS.consumption.color,
      isClickable: false,
      isHidden: false,
      isDashed: false,
    });
  }
  if (flags.hasBiogenic) {
    items.push({
      name: t("detailPage.graph.biogenicEmissions"),
      color: LEGEND_CONFIGS.biogenic.color,
      isClickable: false,
      isHidden: false,
      isDashed: false,
    });
  }
  return items;
}

interface NationOverviewChartProps {
  projectedData: DataPoint[];
}

export const NationOverviewChart: FC<NationOverviewChartProps> = ({
  projectedData,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const currentYear = new Date().getFullYear();

  const [chartEndYear, setChartEndYear] = useState(currentYear + 5);

  const flags = {
    hasBiogenic: projectedData.some((d) => d.biogenicEmissions !== undefined),
    hasConsumption: projectedData.some(
      (d) => d.consumptionAbroadEmissions !== undefined,
    ),
    hasOilExport: projectedData.some(
      (d) => d.exportOfOilProductsEmissions !== undefined,
    ),
  };

  const legendItems = useMemo(
    () => buildLegendItems(t, flags),
    [t, flags.hasBiogenic, flags.hasConsumption, flags.hasOilExport],
  );

  const filteredData = useMemo(
    () => filterDataByYearRange(projectedData, chartEndYear),
    [projectedData, chartEndYear],
  );

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
                <ChartTooltip dataView="overview" unit={t("emissionsUnit")} />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />
            <ReferenceLine {...getCurrentYearReferenceLineProps(currentYear)} />

            <StackedAreas {...flags} t={t} />

            <Line
              type="monotone"
              dataKey="approximated"
              {...getConsistentLineProps(
                "estimated",
                false,
                t("detailPage.graph.estimated"),
              )}
            />
            <Line
              type="monotone"
              dataKey="trend"
              {...getConsistentLineProps(
                "trend",
                false,
                t("detailPage.graph.trend"),
              )}
            />
            <Line
              type="monotone"
              dataKey="carbonLaw"
              {...getConsistentLineProps(
                "paris",
                false,
                t("detailPage.graph.carbonLaw"),
              )}
            />
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

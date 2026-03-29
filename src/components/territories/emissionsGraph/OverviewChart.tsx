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

interface OverviewChartProps {
  projectedData: DataPoint[];
}

export const OverviewChart: FC<OverviewChartProps> = ({ projectedData }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const currentYear = new Date().getFullYear();

  const [chartEndYear, setChartEndYear] = useState(
    new Date().getFullYear() + 5,
  );

  const hasBiogenic = projectedData.some(
    (d) => d.biogenicEmissions !== undefined,
  );
  const hasConsumption = projectedData.some(
    (d) => d.consumptionAbroadEmissions !== undefined,
  );
  const hasOilExport = projectedData.some(
    (d) => d.exportOfOilProductsEmissions !== undefined,
  );

  const legendItems: LegendItem[] = useMemo(() => {
    // Build legend manually so historical shows as a solid area, not a dashed line
    const baseItems: LegendItem[] = [
      {
        name: t("detailPage.graph.historical"),
        color: LEGEND_CONFIGS.historical.color,
        isClickable: false,
        isHidden: false,
        isDashed: false,
      },
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
    const extraItems: LegendItem[] = [];
    if (hasOilExport) {
      extraItems.push({
        name: t("detailPage.graph.exportOfOilProductsEmissions"),
        color: LEGEND_CONFIGS.oilExport.color,
        isClickable: false,
        isHidden: false,
        isDashed: false,
      });
    }
    if (hasConsumption) {
      extraItems.push({
        name: t("detailPage.graph.consumptionAbroadEmissions"),
        color: LEGEND_CONFIGS.consumption.color,
        isClickable: false,
        isHidden: false,
        isDashed: false,
      });
    }
    if (hasBiogenic) {
      extraItems.push({
        name: t("detailPage.graph.biogenicEmissions"),
        color: LEGEND_CONFIGS.biogenic.color,
        isClickable: false,
        isHidden: false,
        isDashed: false,
      });
    }
    return [...baseItems, ...extraItems];
  }, [t, hasBiogenic, hasConsumption, hasOilExport]);

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
                <ChartTooltip dataView="overview" unit={t("emissionsUnit")} />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            {/* Current year reference line */}
            <ReferenceLine {...getCurrentYearReferenceLineProps(currentYear)} />

            {/* Additional emission categories — rendered first so they sit below historical */}
            {hasOilExport && (
              <Area
                type="monotone"
                dataKey="exportOfOilProductsEmissions"
                stackId="main"
                name={t("detailPage.graph.exportOfOilProductsEmissions")}
                stroke={LEGEND_CONFIGS.oilExport.color}
                fill={LEGEND_CONFIGS.oilExport.color}
                fillOpacity={0.3}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            )}
            {hasConsumption && (
              <Area
                type="monotone"
                dataKey="consumptionAbroadEmissions"
                stackId="main"
                name={t("detailPage.graph.consumptionAbroadEmissions")}
                stroke={LEGEND_CONFIGS.consumption.color}
                fill={LEGEND_CONFIGS.consumption.color}
                fillOpacity={0.3}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            )}
            {hasBiogenic && (
              <Area
                type="monotone"
                dataKey="biogenicEmissions"
                stackId="main"
                name={t("detailPage.graph.biogenicEmissions")}
                stroke={LEGEND_CONFIGS.biogenic.color}
                fill={LEGEND_CONFIGS.biogenic.color}
                fillOpacity={0.3}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            )}

            {/* Historical territorial emissions on top of the stack — from 1990 */}
            <Area
              type="monotone"
              dataKey="total"
              stackId="main"
              name={t("detailPage.graph.historical")}
              stroke={LEGEND_CONFIGS.historical.color}
              fill={LEGEND_CONFIGS.historical.color}
              fillOpacity={0.2}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />

            {/* Estimated line — overlay on the stacked areas */}
            <Line
              type="monotone"
              dataKey="approximated"
              {...getConsistentLineProps(
                "estimated",
                false,
                t("detailPage.graph.estimated"),
              )}
            />

            {/* Trend line */}
            <Line
              type="monotone"
              dataKey="trend"
              {...getConsistentLineProps(
                "trend",
                false,
                t("detailPage.graph.trend"),
              )}
            />

            {/* Carbon Law line */}
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

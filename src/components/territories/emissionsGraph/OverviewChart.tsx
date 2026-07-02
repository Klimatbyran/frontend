import { FC, useState, useMemo } from "react";
import {
  LineChart,
  Line,
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
  createOverviewLegendItems,
  getXAxisProps,
  getYAxisProps,
  getCurrentYearReferenceLineProps,
  getChartContainerProps,
  getLineChartProps,
  getResponsiveChartMargin,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  filterDataByYearRange,
  ChartTooltip,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import {
  chartYearToReportingYear,
  CLIMATE_TRACE_CHART_START_YEAR,
  CLIMATE_TRACE_PROJECTION_START_YEAR,
  CLIMATE_TRACE_REPORTED_END_YEAR,
} from "@/utils/europe/climateTraceKpis";

interface OverviewChartProps {
  projectedData: DataPoint[];
}

export const OverviewChart: FC<OverviewChartProps> = ({ projectedData }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const projectionStartYear = CLIMATE_TRACE_PROJECTION_START_YEAR;
  const reportedEndYear = CLIMATE_TRACE_REPORTED_END_YEAR;

  const [chartEndYear, setChartEndYear] = useState(
    new Date().getFullYear() + 5,
  );

  const legendItems: LegendItem[] = useMemo(() => {
    return createOverviewLegendItems(t, new Set(), true);
  }, [t]);

  const filteredData = useMemo(() => {
    return filterDataByYearRange(projectedData, chartEndYear);
  }, [projectedData, chartEndYear]);

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <LineChart
            {...getLineChartProps(
              filteredData,
              undefined,
              getResponsiveChartMargin(isMobile),
            )}
          >
            <XAxis
              {...getXAxisProps(
                "year",
                [CLIMATE_TRACE_CHART_START_YEAR, 2050],
                [
                  CLIMATE_TRACE_CHART_START_YEAR,
                  2015,
                  2020,
                  reportedEndYear,
                  projectionStartYear,
                  2030,
                  2040,
                  2050,
                ],
              )}
            />
            <YAxis {...getYAxisProps(currentLanguage)} />

            <Tooltip
              labelFormatter={(label) => {
                const chartYear = Number(label);
                return Number.isNaN(chartYear)
                  ? String(label)
                  : String(chartYearToReportingYear(chartYear));
              }}
              content={
                <ChartTooltip dataView="overview" unit={t("emissionsUnit")} />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <ReferenceLine
              {...getCurrentYearReferenceLineProps(
                projectionStartYear,
                String(projectionStartYear),
              )}
            />

            {/* Historical line */}
            <Line
              type="monotone"
              dataKey="total"
              {...getConsistentLineProps(
                "historical",
                false,
                t("detailPage.graph.historical"),
              )}
            />

            {/* Estimated line */}
            <Line
              type="monotone"
              dataKey="approximated"
              connectNulls={false}
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
              connectNulls={false}
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
              connectNulls={false}
              {...getConsistentLineProps(
                "paris",
                false,
                t("detailPage.graph.carbonLaw"),
              )}
            />
          </LineChart>
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

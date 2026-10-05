import { FC, useMemo } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { ChartData } from "@/types/emissions";
import {
  ChartYearControls,
  getConsistentLineProps,
  EnhancedLegend,
  createOverviewLegendItems,
  getXAxisProps,
  getYAxisProps,
  getBaseYearReferenceLineProps,
  getCurrentYearReferenceLineProps,
  getChartContainerProps,
  getLineChartProps,
  getResponsiveChartMargin,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  generateChartTicks,
  createChartClickHandler,
  createCustomTickRenderer,
  filterValidTotalData,
  mergeChartDataWithApproximated,
  ChartTooltip,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { FutureTotalsCaption } from "@/components/charts/twoFutures/FutureTotalsCaption";
import {
  buildTwoFuturesRows,
  compareFuturePathTotals,
} from "@/components/territories/emissionsGraph/twoFuturesChartData";
import type { DataPoint } from "@/types/emissions";

interface OverviewChartProps {
  data: ChartData[];
  companyBaseYear?: number;
  chartEndYear: number;
  setChartEndYear: (year: number) => void;
  shortEndYear: number;
  longEndYear: number;
  approximatedData?: ChartData[] | null;
  onYearSelect: (year: number) => void;
  yearControlsPlacement?: "footer" | "top-right";
}

export const OverviewChart: FC<OverviewChartProps> = ({
  data,
  companyBaseYear,
  chartEndYear,
  setChartEndYear,
  shortEndYear,
  longEndYear,
  approximatedData,
  onYearSelect,
  yearControlsPlacement = "footer",
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  const filteredData = useMemo(() => {
    return filterValidTotalData(data);
  }, [data]);

  const firstDataYear = filteredData[0]?.year || 2000;

  // Merge data similar to municipality structure for tooltip compatibility
  const chartData = useMemo(() => {
    const merged = mergeChartDataWithApproximated(
      filteredData,
      approximatedData,
    );
    // Filter to only include data from firstDataYear onwards to prevent empty space
    return merged.filter((d) => d.year >= firstDataYear);
  }, [filteredData, approximatedData, firstDataYear]);

  const isFirstYear = companyBaseYear === filteredData[0]?.year;

  const legendItems = useMemo(() => {
    const hiddenItems = new Set<string>();
    if (!approximatedData) {
      hiddenItems.add("approximated");
      hiddenItems.add("trend");
      hiddenItems.add("carbonLaw");
    }
    return createOverviewLegendItems(t, hiddenItems, false);
  }, [t, approximatedData]);

  const asDataPoints: DataPoint[] = useMemo(
    () =>
      chartData.map((point) => ({
        year: point.year,
        total: point.total,
        trend: point.trend,
        approximated: point.approximated,
        carbonLaw: point.carbonLaw,
      })),
    [chartData],
  );

  const chartDataWithBand = useMemo(() => {
    if (!approximatedData) return chartData;
    const bandByYear = new Map(
      buildTwoFuturesRows(asDataPoints, currentYear).map((row) => [
        row.year,
        row,
      ]),
    );
    return chartData.map((point) => {
      const band = bandByYear.get(point.year);
      return {
        ...point,
        parisBase: band?.parisBase,
        gap: band?.gap,
      };
    });
  }, [approximatedData, asDataPoints, chartData, currentYear]);

  const pathComparison = useMemo(() => {
    if (!approximatedData) {
      return { totalTrend: 0, totalParis: 0 };
    }
    return compareFuturePathTotals(asDataPoints, currentYear, chartEndYear);
  }, [approximatedData, asDataPoints, currentYear, chartEndYear]);

  const ticks = generateChartTicks(
    firstDataYear,
    chartEndYear,
    shortEndYear,
    currentYear,
  );

  const handleClick = createChartClickHandler(onYearSelect);

  return (
    <ChartWrapper className="relative">
      {yearControlsPlacement === "top-right" && (
        <div className="absolute right-0 top-0 z-20">
          <ChartYearControls
            chartEndYear={chartEndYear}
            shortEndYear={shortEndYear}
            longEndYear={longEndYear}
            setChartEndYear={setChartEndYear}
          />
        </div>
      )}

      <ChartArea
        className={yearControlsPlacement === "top-right" ? "pt-14" : ""}
      >
        <ResponsiveContainer {...getChartContainerProps()}>
          <ComposedChart
            {...getLineChartProps(
              chartDataWithBand,
              handleClick,
              getResponsiveChartMargin(isMobile),
            )}
          >
            {companyBaseYear && (
              <ReferenceLine
                {...getBaseYearReferenceLineProps(
                  companyBaseYear,
                  isFirstYear,
                  t,
                )}
              />
            )}

            {/* Current year reference line - only show if within chart domain */}
            {currentYear <= chartEndYear && (
              <ReferenceLine
                {...getCurrentYearReferenceLineProps(currentYear)}
              />
            )}

            <Tooltip
              content={
                <ChartTooltip
                  dataView="overview"
                  companyBaseYear={companyBaseYear}
                  unit={t("companies.tooltip.tonsCO2e")}
                />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <XAxis
              {...getXAxisProps(
                "year",
                [firstDataYear, chartEndYear],
                ticks,
                createCustomTickRenderer(companyBaseYear),
              )}
              type="number"
            />

            <YAxis {...getYAxisProps(currentLanguage)} />

            {/* Main total emissions line */}
            <Line
              type="monotone"
              dataKey="total"
              {...getConsistentLineProps(
                "historical",
                isMobile,
                t("companies.emissionsHistory.totalEmissions"),
              )}
              connectNulls={false}
            />

            {/* Paris overshoot band (trend above carbon law) */}
            {approximatedData && (
              <>
                <Area
                  dataKey="parisBase"
                  stackId="overshoot"
                  stroke="none"
                  fill="transparent"
                  isAnimationActive={false}
                  legendType="none"
                />
                <Area
                  dataKey="gap"
                  stackId="overshoot"
                  stroke="none"
                  fill="var(--pink-3)"
                  fillOpacity={0.22}
                  isAnimationActive={false}
                  legendType="none"
                />
              </>
            )}

            {/* Approximated data lines */}
            {approximatedData && (
              <>
                <Line
                  type="linear"
                  dataKey="approximated"
                  {...getConsistentLineProps(
                    "estimated",
                    isMobile,
                    t("companies.emissionsHistory.approximated"),
                    "var(--grey)",
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="trend"
                  {...getConsistentLineProps(
                    "trend",
                    isMobile,
                    t("companies.emissionsHistory.trend"),
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="carbonLaw"
                  {...getConsistentLineProps(
                    "paris",
                    isMobile,
                    t("companies.emissionsHistory.carbonLaw"),
                  )}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter className="mb-0 space-y-2 md:space-y-2.5">
        <EnhancedLegend items={legendItems} />
        {approximatedData && (
          <FutureTotalsCaption
            year={chartEndYear}
            totalTrend={pathComparison.totalTrend}
            totalParis={pathComparison.totalParis}
            translationPrefix="companies.emissionsHistory"
          />
        )}
        {yearControlsPlacement === "footer" && (
          <ChartYearControls
            chartEndYear={chartEndYear}
            shortEndYear={shortEndYear}
            longEndYear={longEndYear}
            setChartEndYear={setChartEndYear}
            className="!mt-0"
          />
        )}
      </ChartFooter>
    </ChartWrapper>
  );
};

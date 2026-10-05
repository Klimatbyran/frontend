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
  EnhancedLegend,
  getXAxisProps,
  getBaseYearReferenceLineProps,
  getChartContainerProps,
  getLineChartProps,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  generateChartTicks,
  createChartClickHandler,
  createCustomTickRenderer,
  filterValidTotalData,
  mergeChartDataWithApproximated,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { FutureTotalsCaption } from "@/components/charts/twoFutures/FutureTotalsCaption";
import { createTwoFuturesLegendItems } from "@/components/charts/twoFutures/createTwoFuturesLegendItems";
import { getTodayReferenceLineProps } from "@/components/charts/twoFutures/getTodayReferenceLineProps";
import {
  FUTURE_LINE_DASH,
  TwoFuturesTooltip,
} from "@/components/charts/twoFutures/TwoFuturesTooltip";
import {
  getTwoFuturesChartMargin,
  getTwoFuturesYAxisProps,
} from "@/components/charts/twoFutures/twoFuturesChartAxis";
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

const TRANSLATION_PREFIX = "companies.emissionsHistory";

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

  const filteredData = useMemo(() => filterValidTotalData(data), [data]);
  const firstDataYear = filteredData[0]?.year || 2000;

  const mergedForProjection = useMemo(() => {
    const merged = mergeChartDataWithApproximated(
      filteredData,
      approximatedData,
    );
    return merged.filter((d) => d.year >= firstDataYear);
  }, [filteredData, approximatedData, firstDataYear]);

  const projectedData: DataPoint[] = useMemo(
    () =>
      mergedForProjection.map((point) => ({
        year: point.year,
        total: point.total,
        trend: point.trend,
        approximated: point.approximated,
        carbonLaw: point.carbonLaw,
      })),
    [mergedForProjection],
  );

  const rows = useMemo(
    () => buildTwoFuturesRows(projectedData, currentYear),
    [projectedData, currentYear],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (point) => point.year >= firstDataYear && point.year <= chartEndYear,
      ),
    [rows, firstDataYear, chartEndYear],
  );

  const isFirstYear = companyBaseYear === filteredData[0]?.year;
  const hasFuturePaths = Boolean(approximatedData);

  const legendItems = useMemo(
    () => createTwoFuturesLegendItems(t, TRANSLATION_PREFIX, hasFuturePaths),
    [t, hasFuturePaths],
  );

  const pathComparison = useMemo(() => {
    if (!hasFuturePaths) {
      return { totalTrend: 0, totalParis: 0, areaTrend: 0, areaParis: 0 };
    }
    return compareFuturePathTotals(projectedData, currentYear, chartEndYear);
  }, [hasFuturePaths, projectedData, currentYear, chartEndYear]);

  const tooltipLabels = useMemo(
    () => ({
      history: t(`${TRANSLATION_PREFIX}.pastPath`),
      trend: t(`${TRANSLATION_PREFIX}.trendPath`),
      paris: t(`${TRANSLATION_PREFIX}.parisPath`),
    }),
    [t],
  );

  const ticks = generateChartTicks(
    firstDataYear,
    chartEndYear,
    shortEndYear,
    currentYear,
  );

  const handleClick = createChartClickHandler(onYearSelect);
  const unit = t("companies.tooltip.tonsCO2e");

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
              filteredRows,
              handleClick,
              getTwoFuturesChartMargin(isMobile),
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

            {currentYear <= chartEndYear && (
              <ReferenceLine
                {...getTodayReferenceLineProps(
                  currentYear,
                  t(`${TRANSLATION_PREFIX}.todayMarker`),
                )}
              />
            )}

            <Tooltip
              content={<TwoFuturesTooltip unit={unit} labels={tooltipLabels} />}
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

            <YAxis {...getTwoFuturesYAxisProps(currentLanguage, isMobile)} />

            {hasFuturePaths && (
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

            <Line
              type="monotone"
              dataKey="history"
              stroke="#ffffff"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
              name={tooltipLabels.history}
            />

            {hasFuturePaths && (
              <>
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="var(--pink-3)"
                  strokeWidth={2.5}
                  strokeDasharray={FUTURE_LINE_DASH}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                  name={tooltipLabels.trend}
                />
                <Line
                  type="monotone"
                  dataKey="paris"
                  stroke="var(--green-2)"
                  strokeWidth={2.5}
                  strokeDasharray={FUTURE_LINE_DASH}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                  name={tooltipLabels.paris}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter className="mb-0 space-y-2 md:space-y-2.5">
        <EnhancedLegend items={legendItems} />
        {hasFuturePaths && (
          <FutureTotalsCaption
            year={chartEndYear}
            totalTrend={pathComparison.areaTrend}
            totalParis={pathComparison.areaParis}
            translationPrefix={TRANSLATION_PREFIX}
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

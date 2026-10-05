import { FC, useMemo, useState } from "react";
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
import { DataPoint } from "@/types/emissions";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  ChartArea,
  ChartFooter,
  ChartWrapper,
  ChartYearControls,
  EnhancedLegend,
  getChartContainerProps,
  getXAxisProps,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import {
  buildTwoFuturesRows,
  compareFuturePathTotals,
} from "@/components/territories/emissionsGraph/twoFuturesChartData";
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

interface OverviewChartProps {
  projectedData: DataPoint[];
}

export const OverviewChart: FC<OverviewChartProps> = ({ projectedData }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const currentYear = new Date().getFullYear();

  const [chartEndYear, setChartEndYear] = useState(2050);

  const rows = useMemo(
    () => buildTwoFuturesRows(projectedData, currentYear),
    [projectedData, currentYear],
  );

  const filteredRows = useMemo(
    () => rows.filter((point) => point.year <= chartEndYear),
    [rows, chartEndYear],
  );

  const legendItems = useMemo(
    () => createTwoFuturesLegendItems(t, "detailPage.graph"),
    [t],
  );

  const pathComparison = useMemo(
    () => compareFuturePathTotals(projectedData, currentYear, chartEndYear),
    [projectedData, currentYear, chartEndYear],
  );

  const tooltipLabels = useMemo(
    () => ({
      history: t("detailPage.graph.pastPath"),
      trend: t("detailPage.graph.trendPath"),
      paris: t("detailPage.graph.parisPath"),
    }),
    [t],
  );

  const unit = t("emissionsUnit");

  return (
    <ChartWrapper className="h-auto">
      <ChartArea className="h-[300px] min-h-0 flex-none sm:h-[380px]">
        <ResponsiveContainer {...getChartContainerProps()}>
          <ComposedChart
            data={filteredRows}
            margin={getTwoFuturesChartMargin(isMobile)}
          >
            <XAxis
              {...getXAxisProps(
                "year",
                [1990, 2050],
                [1990, 2015, 2020, currentYear, 2030, 2040, 2050],
              )}
              allowDuplicatedCategory
              tickFormatter={(year) => String(year)}
            />
            <YAxis {...getTwoFuturesYAxisProps(currentLanguage, isMobile)} />

            <Tooltip
              content={<TwoFuturesTooltip unit={unit} labels={tooltipLabels} />}
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <ReferenceLine
              {...getTodayReferenceLineProps(
                currentYear,
                t("detailPage.graph.todayMarker"),
              )}
            />

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
          </ComposedChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter className="mb-0 space-y-2 md:space-y-2.5">
        <EnhancedLegend items={legendItems} />
        <FutureTotalsCaption
          year={chartEndYear}
          totalTrend={pathComparison.areaTrend}
          totalParis={pathComparison.areaParis}
          translationPrefix="detailPage.graph"
        />
        <ChartYearControls
          chartEndYear={chartEndYear}
          setChartEndYear={setChartEndYear}
          className="!mt-0"
        />
      </ChartFooter>
    </ChartWrapper>
  );
};

import { FC, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trans, useTranslation } from "react-i18next";
import { DataPoint } from "@/types/emissions";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  ChartArea,
  ChartFooter,
  ChartWrapper,
  ChartYearControls,
  EnhancedLegend,
  getChartContainerProps,
  getResponsiveChartMargin,
  getXAxisProps,
  getYAxisProps,
  type LegendItem,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import {
  buildTwoFuturesRows,
  sumFutureOvershootTonnes,
} from "@/components/territories/emissionsGraph/twoFuturesChartData";

interface OverviewChartProps {
  projectedData: DataPoint[];
}

type TooltipRow = {
  dataKey?: string;
  value?: number;
  name?: string;
  color?: string;
};

function TwoFuturesTooltip({
  active,
  payload,
  label,
  unit,
  labels,
}: {
  active?: boolean;
  payload?: TooltipRow[];
  label?: string | number;
  unit: string;
  labels: Record<"history" | "trend" | "paris", string>;
}) {
  const { currentLanguage } = useLanguage();
  if (!active || !payload?.length) return null;

  const rows = payload.filter(
    (entry) =>
      entry.value != null &&
      entry.dataKey !== "parisBase" &&
      entry.dataKey !== "gap",
  );

  return (
    <div className="rounded-md border border-white/10 bg-black-2 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">{label}</p>
      <ul className="space-y-1">
        {rows.map((entry) => {
          const key = entry.dataKey as keyof typeof labels;
          const name = labels[key] ?? entry.name;
          return (
            <li
              key={entry.dataKey}
              className="flex items-center justify-between gap-4 tabular-nums"
            >
              <span className="flex items-center gap-2 text-grey">
                <span
                  className="h-0.5 w-4 rounded-full"
                  style={{ background: entry.color }}
                  aria-hidden
                />
                {name}
              </span>
              <span className="text-white">
                {formatEmissionsAbsolute(entry.value!, currentLanguage)}{" "}
                {unit}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function createTwoFuturesLegendItems(
  t: (key: string) => string,
): LegendItem[] {
  return [
    {
      name: t("detailPage.graph.pastPath"),
      color: "#ffffff",
      isClickable: false,
      isHidden: false,
      isDashed: false,
    },
    {
      name: t("detailPage.graph.trendPath"),
      color: "var(--pink-3)",
      isClickable: false,
      isHidden: false,
      isDashed: false,
    },
    {
      name: t("detailPage.graph.parisPath"),
      color: "var(--green-2)",
      isClickable: false,
      isHidden: false,
      isDashed: false,
    },
  ];
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

  const legendItems = useMemo(() => createTwoFuturesLegendItems(t), [t]);

  const overshootTonnes = useMemo(
    () => sumFutureOvershootTonnes(projectedData, currentYear),
    [projectedData, currentYear],
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
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <ComposedChart
            data={filteredRows}
            margin={{
              ...getResponsiveChartMargin(isMobile),
              left: isMobile ? 8 : 16,
              right: 12,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              vertical={false}
            />
            <XAxis
              {...getXAxisProps(
                "year",
                [1990, 2050],
                [1990, 2015, 2020, currentYear, 2030, 2040, 2050],
              )}
              allowDuplicatedCategory
              tickFormatter={(year) => String(year)}
            />
            <YAxis
              {...getYAxisProps(currentLanguage, [0, "auto"])}
              width={isMobile ? 48 : 56}
            />

            <Tooltip
              content={
                <TwoFuturesTooltip unit={unit} labels={tooltipLabels} />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <ReferenceLine
              x={currentYear}
              stroke="rgba(255,255,255,0.35)"
              strokeDasharray="4 4"
              label={{
                value: t("detailPage.graph.todayMarker"),
                position: "insideTopLeft",
                fill: "var(--grey)",
                fontSize: 12,
              }}
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
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
              name={tooltipLabels.paris}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartArea>

      {overshootTonnes > 0 && (
        <p className="max-w-3xl px-1 text-sm leading-relaxed text-white/80 md:text-base">
          <Trans
            i18nKey="detailPage.graph.twoFuturesCaption"
            values={{
              overshoot: formatEmissionsAbsolute(
                overshootTonnes,
                currentLanguage,
              ),
              unit,
            }}
            components={[<span key="0" className="text-pink-3" />]}
          />
        </p>
      )}

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

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  ChartArea,
  ChartWrapper,
  getChartContainerProps,
  getDynamicChartHeight,
  getResponsiveChartMargin,
  getXAxisProps,
  getYAxisProps,
} from "@/components/charts";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { DEFAULT_STATISTICAL_GRADIENT_COLORS } from "@/utils/ui/colorGradients";
import type { YearValuePoint } from "@/hooks/nation/useNationDetails";

const MAP_GRADIENT_STOPS = [
  DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientStart,
  DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidLow,
  DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidHigh,
  DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientEnd,
] as const;

const MAP_GRADIENT_CSS = `linear-gradient(to right, 
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientStart} 0%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidLow} 33%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidHigh} 66%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientEnd} 100%)`;

type ChartDatum = {
  year: number;
  valueKt: number;
  fill: string;
};

function getBarColor(
  value: number,
  minValue: number,
  maxValue: number,
): string {
  if (maxValue === minValue) {
    return DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidHigh;
  }

  const ratio = (value - minValue) / (maxValue - minValue);
  const t = 1 - ratio;
  const scaled = t * (MAP_GRADIENT_STOPS.length - 1);
  const index = Math.min(MAP_GRADIENT_STOPS.length - 2, Math.floor(scaled));
  const localT = scaled - index;
  const from = MAP_GRADIENT_STOPS[index];
  const to = MAP_GRADIENT_STOPS[index + 1];

  return `color-mix(in srgb, ${from} ${(1 - localT) * 100}%, ${to} ${localT * 100}%)`;
}

function toChartData(points: YearValuePoint[]): ChartDatum[] {
  const valuesKt = points.map((point) => point.value / 1000);
  const minValue = Math.min(...valuesKt);
  const maxValue = Math.max(...valuesKt);

  return points.map((point) => {
    const valueKt = point.value / 1000;

    return {
      year: point.year,
      valueKt,
      fill: getBarColor(valueKt, minValue, maxValue),
    };
  });
}

type ExportOfOilProductsTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: ChartDatum }>;
  unit?: string;
};

function ExportOfOilProductsTooltip({
  active,
  payload,
  unit,
}: ExportOfOilProductsTooltipProps) {
  const { currentLanguage } = useLanguage();

  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const { year, valueKt } = payload[0].payload;
  const formattedValue = formatEmissionsAbsolute(
    valueKt * 1000,
    currentLanguage,
  );

  return (
    <div className="rounded-level-2 border border-black-1 bg-black-2 px-3 py-2 shadow-md">
      <p className="text-sm font-semibold text-white">{year}</p>
      <p className="text-sm text-grey tabular-nums">
        {formattedValue} {unit}
      </p>
    </div>
  );
}

export function ExportOfOilProductsEmissionsChart({
  data,
  className,
}: {
  data: YearValuePoint[];
  className?: string;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

  const chartData = useMemo(() => toChartData(data), [data]);
  const baselineValueKt = chartData[0]?.valueKt;
  const xAxisTicks = useMemo(
    () => chartData.map((point) => point.year).filter((year) => year % 5 === 0),
    [chartData],
  );

  if (chartData.length === 0) {
    return null;
  }

  return (
    <SectionWithHelp helpItems={[]} className={className}>
      <CardHeader
        title={t("nation.exportOfOilProducts.title")}
        description={t("nation.exportOfOilProducts.description")}
        className="[&>div]:mb-4 [&>div]:@lg:mb-6"
      />

      <div
        className="mt-8"
        style={{ height: getDynamicChartHeight("overview", isMobile) }}
      >
        <ChartWrapper>
          <ChartArea className="min-h-0 h-full">
            <ResponsiveContainer {...getChartContainerProps()}>
              <BarChart
                data={chartData}
                margin={getResponsiveChartMargin(isMobile)}
              >
                <XAxis
                  {...getXAxisProps("year", undefined, xAxisTicks)}
                  interval={0}
                  tickFormatter={(year) => year}
                />
                <YAxis {...getYAxisProps(currentLanguage)} />

                <Tooltip
                  content={
                    <ExportOfOilProductsTooltip unit={t("emissionsUnit")} />
                  }
                  cursor={{ fill: "var(--black-1)", opacity: 0.35 }}
                  wrapperStyle={{ outline: "none", zIndex: 60 }}
                />

                {baselineValueKt !== undefined && (
                  <ReferenceLine
                    y={baselineValueKt}
                    stroke="var(--grey)"
                    strokeDasharray="4 4"
                    label={{
                      value: "1990",
                      position: "insideTopRight",
                      fill: "var(--grey)",
                      fontSize: 12,
                    }}
                  />
                )}

                <Bar
                  dataKey="valueKt"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={isMobile ? 10 : 16}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.year} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartArea>
        </ChartWrapper>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-grey">
        <span>{t("nation.exportOfOilProducts.legendHigh")}</span>
        <div
          className="h-5 w-40 rounded-full"
          style={{ background: MAP_GRADIENT_CSS }}
        />
        <span>{t("nation.exportOfOilProducts.legendLow")}</span>
      </div>
    </SectionWithHelp>
  );
}

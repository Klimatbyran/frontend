import { FC, useMemo } from "react";
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
import { isMobile } from "react-device-detect";
import {
  ChartArea,
  ChartFooter,
  ChartTooltip,
  ChartWrapper,
  createCustomTickRenderer,
  getBaseYearReferenceLineProps,
  getChartContainerProps,
  getResponsiveChartMargin,
  getYAxisProps,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import type { EmissionsIntensityPoint } from "@/utils/data/emissionsIntensityData";
import { formatIntensityAxisValue } from "@/utils/formatting/localization";
import {
  createStatisticalGradient,
  getStatisticalGradientLegendBackground,
} from "@/utils/ui/colorGradients";

interface EmissionsIntensityTrendChartProps {
  data: EmissionsIntensityPoint[];
  companyBaseYear?: number;
  unitLabel: string;
}

export const EmissionsIntensityTrendChart: FC<
  EmissionsIntensityTrendChartProps
> = ({ data, companyBaseYear, unitLabel }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const latestYear = data[data.length - 1]?.year;
  const isFirstYear = companyBaseYear === data[0]?.year;

  const intensities = useMemo(
    () => data.map((point) => point.intensity),
    [data],
  );

  const intensityRange = useMemo(() => {
    return {
      min: Math.min(...intensities),
      max: Math.max(...intensities),
    };
  }, [intensities]);

  const hasColorScale = intensityRange.min !== intensityRange.max;

  const formatYAxisValue = useMemo(
    () => (value: number) =>
      formatIntensityAxisValue(value, currentLanguage, intensityRange.max),
    [currentLanguage, intensityRange.max],
  );

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        year: point.year,
        intensity: point.intensity,
        isAIGenerated: point.isAIGenerated,
        fill: hasColorScale
          ? createStatisticalGradient(intensities, point.intensity, false)
          : "var(--grey)",
        isLatest: point.year === latestYear,
      })),
    [data, hasColorScale, intensities, latestYear],
  );

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <BarChart
            data={chartData}
            margin={getResponsiveChartMargin(isMobile)}
            barCategoryGap="20%"
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

            <Tooltip
              content={
                <ChartTooltip
                  companyBaseYear={companyBaseYear}
                  showUnit={false}
                  customFormatter={(value) =>
                    `${formatIntensityAxisValue(Number(value), currentLanguage, intensityRange.max)} ${unitLabel}`
                  }
                />
              }
              cursor={{ fill: "var(--grey)", fillOpacity: 0.1 }}
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <XAxis
              dataKey="year"
              type="category"
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              tick={createCustomTickRenderer(companyBaseYear)}
              padding={{ left: 8, right: 8 }}
            />

            <YAxis
              {...getYAxisProps(currentLanguage, [0, "auto"], formatYAxisValue)}
              dataKey="intensity"
            />

            <Bar
              dataKey="intensity"
              name={t("companies.emissionsIntensity.title")}
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={entry.fill}
                  stroke={entry.isLatest ? "var(--white)" : undefined}
                  strokeWidth={entry.isLatest ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartArea>

      {hasColorScale && (
        <ChartFooter>
          <div
            className="flex items-center justify-center gap-2 text-xs text-grey flex-wrap"
            role="img"
            aria-label={t("companies.emissionsIntensity.colorScaleAriaLabel")}
          >
            <span className="whitespace-nowrap">
              {formatIntensityAxisValue(
                intensityRange.max,
                currentLanguage,
                intensityRange.max,
              )}{" "}
              {unitLabel}
            </span>
            <div className="relative w-32 h-3 shrink-0">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: getStatisticalGradientLegendBackground(),
                }}
              />
            </div>
            <span className="whitespace-nowrap">
              {formatIntensityAxisValue(
                intensityRange.min,
                currentLanguage,
                intensityRange.max,
              )}{" "}
              {unitLabel}
            </span>
          </div>
        </ChartFooter>
      )}
    </ChartWrapper>
  );
};

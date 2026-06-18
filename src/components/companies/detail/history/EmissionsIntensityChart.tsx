import { FC, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import {
  ChartWrapper,
  ChartArea,
  ChartFooter,
  EnhancedLegend,
  getChartContainerProps,
  getResponsiveChartMargin,
  getXAxisProps,
  getYAxisProps,
  createChartClickHandler,
  createCustomTickRenderer,
  generateChartTicks,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { LegendItem } from "@/types/charts";
import type {
  EmissionsIntensityDataPoint,
  EmissionsIntensitySummary,
} from "@/types/emissionsIntensity";
import { EmissionsIntensityTooltip } from "./EmissionsIntensityTooltip";

interface EmissionsIntensityChartProps {
  data: EmissionsIntensityDataPoint[];
  summary: EmissionsIntensitySummary;
  companyBaseYear?: number;
  onYearSelect?: (year: number) => void;
}

export const EmissionsIntensityChart: FC<EmissionsIntensityChartProps> = ({
  data,
  summary,
  companyBaseYear,
  onYearSelect,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  const firstDataYear = data[0]?.year || 2000;
  const lastDataYear = data[data.length - 1]?.year || currentYear;

  const ticks = generateChartTicks(
    firstDataYear,
    lastDataYear,
    lastDataYear,
    currentYear,
  );

  const handleClick = onYearSelect
    ? createChartClickHandler(onYearSelect)
    : undefined;

  const legendItems = useMemo((): LegendItem[] => {
    return [
      {
        name: t("companies.emissionsIntensity.intensity"),
        color: "var(--orange-2)",
        isClickable: false,
        isHidden: false,
        isDashed: false,
      },
      {
        name: t("companies.emissionsIntensity.baseline"),
        color: "var(--grey)",
        isClickable: false,
        isHidden: false,
        isDashed: true,
      },
    ];
  }, [t]);

  const intensityYAxisFormatter = (value: number) =>
    localizeIntensityAxis(value, currentLanguage);

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <AreaChart
            data={data}
            margin={getResponsiveChartMargin(isMobile)}
            onClick={handleClick}
          >
            <defs>
              <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--orange-2)"
                  stopOpacity={0.45}
                />
                <stop
                  offset="95%"
                  stopColor="var(--orange-2)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="var(--black-2)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <Tooltip
              content={<EmissionsIntensityTooltip />}
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <XAxis
              {...getXAxisProps(
                "year",
                [firstDataYear, lastDataYear],
                ticks,
                createCustomTickRenderer(companyBaseYear),
              )}
              type="number"
            />

            <YAxis
              {...getYAxisProps(currentLanguage, [0, "auto"], {
                formatter: intensityYAxisFormatter,
              })}
            />

            <ReferenceLine
              y={summary.firstIntensity}
              stroke="var(--grey)"
              strokeDasharray="4 4"
              label={{
                value: t("companies.emissionsIntensity.baseline"),
                position: "insideTopRight",
                fill: "var(--grey)",
                fontSize: 12,
              }}
            />

            <Area
              type="monotone"
              dataKey="intensity"
              stroke="var(--orange-2)"
              fill="url(#intensityGradient)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--orange-2)", strokeWidth: 0 }}
              activeDot={{ r: 6, cursor: "pointer" }}
              name={t("companies.emissionsIntensity.intensity")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter>
        <EnhancedLegend items={legendItems} />
      </ChartFooter>
    </ChartWrapper>
  );
};

function localizeIntensityAxis(
  value: number,
  currentLanguage: "sv" | "en",
): string {
  return new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-GB", {
    maximumFractionDigits: value < 10 ? 1 : 0,
  }).format(value);
}

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
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";

interface EmissionsIntensityTrendChartProps {
  data: EmissionsIntensityPoint[];
  companyBaseYear?: number;
  unitLabel: string;
}

const BAR_COLOR = "var(--grey)";
const LATEST_BAR_COLOR = "var(--blue-2)";

export const EmissionsIntensityTrendChart: FC<
  EmissionsIntensityTrendChartProps
> = ({ data, companyBaseYear, unitLabel }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const latestYear = data[data.length - 1]?.year;
  const isFirstYear = companyBaseYear === data[0]?.year;

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        year: point.year,
        intensity: point.intensity,
        isAIGenerated: point.isAIGenerated,
        fill: point.year === latestYear ? LATEST_BAR_COLOR : BAR_COLOR,
      })),
    [data, latestYear],
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
                    `${formatEmissionsAbsolute(value, currentLanguage)} ${unitLabel}`
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

            <YAxis {...getYAxisProps(currentLanguage)} dataKey="intensity" />

            <Bar
              dataKey="intensity"
              name={t("companies.emissionsIntensity.title")}
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry) => (
                <Cell key={entry.year} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartArea>
    </ChartWrapper>
  );
};

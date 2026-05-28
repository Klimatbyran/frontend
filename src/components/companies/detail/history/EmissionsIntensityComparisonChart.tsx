import { FC, useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
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
  getChartContainerProps,
  getResponsiveChartMargin,
  getYAxisProps,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import type { IntensityComparison } from "@/utils/data/emissionsIntensityData";
import { formatIntensityAxisValue } from "@/utils/formatting/localization";

interface EmissionsIntensityComparisonChartProps {
  comparison: IntensityComparison;
  unitLabel: string;
  includeAllCompaniesAverage?: boolean;
}

interface ComparisonBar {
  key: string;
  label: string;
  intensity: number;
  fill: string;
}

const BAR_COLORS = {
  company: "var(--blue-2)",
  industry: "var(--pink-3)",
  all: "var(--grey)",
} as const;

export const EmissionsIntensityComparisonChart: FC<
  EmissionsIntensityComparisonChartProps
> = ({ comparison, unitLabel, includeAllCompaniesAverage = false }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const barData = useMemo(() => {
    const bars: ComparisonBar[] = [
      {
        key: "company",
        label: t("companies.emissionsIntensity.comparisonThisCompany"),
        intensity: comparison.company.intensity,
        fill: BAR_COLORS.company,
      },
    ];

    if (
      comparison.industryAverage != null &&
      comparison.industryCompanyCount > 0
    ) {
      bars.push({
        key: "industry",
        label: t("companies.emissionsIntensity.comparisonIndustryAverage"),
        intensity: comparison.industryAverage,
        fill: BAR_COLORS.industry,
      });
    }

    if (
      includeAllCompaniesAverage &&
      comparison.allCompaniesAverage != null &&
      comparison.allCompaniesCount > 0
    ) {
      bars.push({
        key: "all",
        label: t("companies.emissionsIntensity.comparisonAllCompaniesAverage"),
        intensity: comparison.allCompaniesAverage,
        fill: BAR_COLORS.all,
      });
    }

    return bars;
  }, [comparison, includeAllCompaniesAverage, t]);

  const maxIntensity = useMemo(
    () => Math.max(...barData.map((bar) => bar.intensity)),
    [barData],
  );

  const formatYAxisValue = useMemo(
    () => (value: number) =>
      formatIntensityAxisValue(value, currentLanguage, maxIntensity),
    [currentLanguage, maxIntensity],
  );

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <BarChart
            data={barData}
            margin={getResponsiveChartMargin(isMobile)}
            barCategoryGap="20%"
          >
            <Tooltip
              content={
                <ChartTooltip
                  showUnit={false}
                  customFormatter={(value) =>
                    `${formatIntensityAxisValue(Number(value), currentLanguage, maxIntensity)} ${unitLabel}`
                  }
                />
              }
              cursor={{ fill: "var(--grey)", fillOpacity: 0.1 }}
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <XAxis
              dataKey="label"
              type="category"
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: "var(--grey)", fontSize: 12 }}
            />

            <YAxis
              {...getYAxisProps(currentLanguage, [0, "auto"], formatYAxisValue)}
              dataKey="intensity"
            />

            <Bar dataKey="intensity" radius={[4, 4, 0, 0]}>
              {barData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartArea>
    </ChartWrapper>
  );
};
